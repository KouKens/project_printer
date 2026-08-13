import { Injectable, Logger } from '@nestjs/common';
import * as snmp from 'net-snmp';
import type { Session, Varbind } from 'net-snmp';

/** 対応する SNMP バージョン。DB の SnmpVersion と 1 対 1 */
export type SnmpVersionKey = 'V1' | 'V2C';

/** 1 回の問い合わせの待ち時間。応答しない機器で長く待たせない */
const TIMEOUT_MS = 2500;
const RETRIES = 1;

/** subtree 1 回で取る行数。v1 では getNext になるので値は使われない */
const MAX_REPETITIONS = 20;

/** 単独で取れる値（末尾が .0 ないし固定インデックス） */
const SCALAR = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  sysName: '1.3.6.1.2.1.1.5.0',
  hrDeviceDescr: '1.3.6.1.2.1.25.3.2.1.3.1',
  /** prtGeneralSerialNumber */
  serialNumber: '1.3.6.1.2.1.43.5.1.1.17.1',
  /** prtMarkerLifeCount：累計印刷枚数 */
  pageCount: '1.3.6.1.2.1.43.10.2.1.4.1.1',
} as const;

/** 表として歩いて取る値 */
const TABLE = {
  ifPhysAddress: '1.3.6.1.2.1.2.2.1.6',
  supplyDescription: '1.3.6.1.2.1.43.11.1.1.6',
  supplyColorantIndex: '1.3.6.1.2.1.43.11.1.1.3',
  supplyMaxCapacity: '1.3.6.1.2.1.43.11.1.1.8',
  supplyLevel: '1.3.6.1.2.1.43.11.1.1.9',
  colorantValue: '1.3.6.1.2.1.43.12.1.1.4',
} as const;

export type SupplySnapshot = {
  supplyIndex: number;
  name: string;
  colorant: string | null;
  level: number;
  maxCapacity: number;
  percent: number | null;
};

export type PrinterSnapshot = {
  /** 実際に応答があったバージョン */
  version: SnmpVersionKey;
  hostName: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  pageCount: number | null;
  supplies: SupplySnapshot[];
};

/** 応答がなかった。バージョン違い・コミュニティ名違い・そもそも不在のいずれか */
export class SnmpUnreachableError extends Error {}

/** OctetString / 文字列を読める形にする。制御文字と余白は落とす */
function readText(value: Varbind['value']): string | null {
  let text: string;

  if (Buffer.isBuffer(value)) {
    text = value.toString('utf8');
  } else if (typeof value === 'string') {
    text = value;
  } else {
    return null;
  }

  const cleaned = text.replace(/\p{Cc}/gu, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function readNumber(value: Varbind['value'] | null | undefined): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  return null;
}

/** 6 バイトの ifPhysAddress を AA:BB:CC:DD:EE:FF にする */
function readMac(value: Varbind['value']): string | null {
  if (!Buffer.isBuffer(value) || value.length !== 6) return null;
  if (value.every((byte) => byte === 0)) return null;

  return Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

/**
 * 残量をパーセントにする。
 * level は負値が意味を持つ（-1 不明 / -2 取得不可 / -3 残量あり）ので、
 * そのままでは割れない。maxCapacity が正のときだけ計算する。
 */
function toPercent(level: number, maxCapacity: number): number | null {
  if (level < 0) return null;

  if (maxCapacity > 0) {
    return Math.max(0, Math.min(100, Math.round((level / maxCapacity) * 100)));
  }

  // maxCapacity を返さず level に百分率を入れてくる機種がある
  if (maxCapacity < 0 && level <= 100) return level;

  return null;
}

@Injectable()
export class SnmpService {
  private readonly logger = new Logger(SnmpService.name);

  /**
   * 指定バージョンから順に試す。
   * v2c を止めていて v1 だけ答える機種（iR-ADV など）があるため、
   * 片方が無反応でももう片方を試す。
   */
  async poll(
    ipAddress: string,
    community: string,
    preferred: SnmpVersionKey = 'V1',
  ): Promise<PrinterSnapshot> {
    const order: SnmpVersionKey[] =
      preferred === 'V1' ? ['V1', 'V2C'] : ['V2C', 'V1'];

    for (const version of order) {
      try {
        return await this.pollWith(ipAddress, community, version);
      } catch (error) {
        if (!(error instanceof SnmpUnreachableError)) throw error;
        this.logger.debug(`${ipAddress}: SNMP ${version} は応答なし`);
      }
    }

    throw new SnmpUnreachableError(
      `${ipAddress} から SNMP の応答がありません。IP アドレス・コミュニティ名・機器側の SNMP 設定を確認してください`,
    );
  }

  private async pollWith(
    ipAddress: string,
    community: string,
    version: SnmpVersionKey,
  ): Promise<PrinterSnapshot> {
    const session = snmp.createSession(ipAddress, community, {
      version: version === 'V1' ? snmp.Version1 : snmp.Version2c,
      timeout: TIMEOUT_MS,
      retries: RETRIES,
    });

    // セッションの error を拾わないとプロセスごと落ちる
    session.on('error', (error) => {
      this.logger.debug(`${ipAddress}: セッションエラー ${error.message}`);
    });

    try {
      // 生存確認を兼ねる。ここが無反応ならこのバージョンでは話せない
      const sysName = await this.get(session, SCALAR.sysName);

      const [sysDescr, hrDeviceDescr, serialNumber, pageCount] =
        await Promise.all([
          this.get(session, SCALAR.sysDescr),
          this.get(session, SCALAR.hrDeviceDescr),
          this.get(session, SCALAR.serialNumber),
          this.get(session, SCALAR.pageCount),
        ]);

      const [macs, supplies] = await Promise.all([
        this.walk(session, TABLE.ifPhysAddress),
        this.readSupplies(session),
      ]);

      const macAddress =
        Array.from(macs.values())
          .map((varbind) => readMac(varbind.value))
          .find((mac) => mac !== null) ?? null;

      return {
        version,
        hostName: sysName ? readText(sysName.value) : null,
        model:
          (hrDeviceDescr ? readText(hrDeviceDescr.value) : null) ??
          (sysDescr ? readText(sysDescr.value)?.split(/[\r\n;]/)[0] : null) ??
          null,
        serialNumber: serialNumber ? readText(serialNumber.value) : null,
        macAddress,
        pageCount: pageCount ? readNumber(pageCount.value) : null,
        supplies,
      };
    } finally {
      session.close();
    }
  }

  /** 消耗品の表をまとめて読む */
  private async readSupplies(session: Session): Promise<SupplySnapshot[]> {
    const [descriptions, levels, capacities, colorantIndexes, colorantValues] =
      await Promise.all([
        this.walk(session, TABLE.supplyDescription),
        this.walk(session, TABLE.supplyLevel),
        this.walk(session, TABLE.supplyMaxCapacity),
        this.walk(session, TABLE.supplyColorantIndex),
        this.walk(session, TABLE.colorantValue),
      ]);

    // prtMarkerColorantTable は色番号で引く。末尾の添字だけ見れば足りる
    const colorants = new Map<number, string>();
    for (const [suffix, varbind] of colorantValues) {
      const index = lastIndexOf(suffix);
      const name = readText(varbind.value);
      if (index !== null && name) colorants.set(index, name);
    }

    const supplies: SupplySnapshot[] = [];

    for (const [suffix, varbind] of descriptions) {
      const supplyIndex = lastIndexOf(suffix);
      if (supplyIndex === null) continue;

      const name = readText(varbind.value) ?? `消耗品 ${supplyIndex}`;
      const level = readNumber(levels.get(suffix)?.value ?? null) ?? -1;
      const maxCapacity =
        readNumber(capacities.get(suffix)?.value ?? null) ?? -1;
      const colorantIndex = readNumber(
        colorantIndexes.get(suffix)?.value ?? null,
      );

      supplies.push({
        supplyIndex,
        name,
        colorant:
          colorantIndex !== null
            ? (colorants.get(colorantIndex) ?? null)
            : null,
        level,
        maxCapacity,
        percent: toPercent(level, maxCapacity),
      });
    }

    supplies.sort((a, b) => a.supplyIndex - b.supplyIndex);

    // 添字は hrDeviceIndex.行番号 なので、機器が複数ある機種では
    // 行番号だけでは重なりうる。重なったときは並び順で振り直す
    const unique = new Set(supplies.map((supply) => supply.supplyIndex));
    if (unique.size !== supplies.length) {
      supplies.forEach((supply, position) => {
        supply.supplyIndex = position + 1;
      });
    }

    return supplies;
  }

  /**
   * 単独の OID を 1 本ずつ取る。
   * v1 は 1 つでも存在しない OID を混ぜると PDU 全体が noSuchName で落ちるので、
   * まとめて要求しない。取れなかった項目は null にして先へ進む。
   */
  private get(session: Session, oid: string): Promise<Varbind | null> {
    return new Promise((resolve, reject) => {
      session.get([oid], (error, varbinds) => {
        if (error) {
          if (error instanceof snmp.RequestTimedOutError) {
            reject(new SnmpUnreachableError(error.message));
            return;
          }
          // 未実装の OID。この機種は持っていないというだけ
          resolve(null);
          return;
        }

        const varbind = varbinds[0];
        if (!varbind || snmp.isVarbindError(varbind)) {
          resolve(null);
          return;
        }
        resolve(varbind);
      });
    });
  }

  /**
   * 表を歩く。キーは base より後ろの添字（例 "1.2"）。
   * 途中で切れても取れたところまで返す。消耗品が読めなくても
   * 機器情報だけは残したい。
   */
  private walk(session: Session, base: string): Promise<Map<string, Varbind>> {
    return new Promise((resolve) => {
      const rows = new Map<string, Varbind>();

      session.subtree(
        base,
        MAX_REPETITIONS,
        (varbinds) => {
          for (const varbind of varbinds) {
            if (snmp.isVarbindError(varbind)) continue;
            if (!varbind.oid.startsWith(`${base}.`)) continue;
            rows.set(varbind.oid.slice(base.length + 1), varbind);
          }
        },
        () => resolve(rows),
      );
    });
  }
}

/** "1.2" → 2。表の添字は末尾が行番号 */
function lastIndexOf(suffix: string): number | null {
  const last = suffix.split('.').pop();
  if (last === undefined) return null;
  const parsed = Number(last);
  return Number.isInteger(parsed) ? parsed : null;
}
