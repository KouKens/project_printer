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
  /** prtMarkerLifeCount：累計カウンタ。単位は counterUnit を見ること */
  pageCount: '1.3.6.1.2.1.43.10.2.1.4.1.1',
  /**
   * prtMarkerCounterUnit：上のカウンタの単位。
   *
   * **枚数とは限らない。** 一般のプリンターは 7（インプレッション＝枚）だが、
   * SATO のラベルプリンターは 17（メートル）で、印字した長さを返してくる。
   * 単位を見ずに足すと、長さと枚数を混ぜて集計してしまう
   */
  counterUnit: '1.3.6.1.2.1.43.10.2.1.3.1.1',
} as const;

/** prtMarkerCounterUnit の値。集計の可否はここで判断する */
export const COUNTER_UNIT = {
  /** インプレッション。一般のプリンターの「枚」 */
  IMPRESSIONS: 7,
  SHEETS: 8,
  /** メートル。SATO のラベルプリンター */
  METERS: 17,
} as const;

/** その単位が「枚数」か。枚として数えてよいものだけ true */
export function isSheetUnit(unit: number | null): boolean {
  // 単位を返さない機種は、これまでどおり枚として扱う（一般のプリンターしかない）
  if (unit === null) return true;
  return unit === COUNTER_UNIT.IMPRESSIONS || unit === COUNTER_UNIT.SHEETS;
}

/** 表として歩いて取る値 */
const TABLE = {
  ifPhysAddress: '1.3.6.1.2.1.2.2.1.6',
  supplyDescription: '1.3.6.1.2.1.43.11.1.1.6',
  supplyColorantIndex: '1.3.6.1.2.1.43.11.1.1.3',
  supplyClass: '1.3.6.1.2.1.43.11.1.1.4',
  supplyType: '1.3.6.1.2.1.43.11.1.1.5',
  supplyMaxCapacity: '1.3.6.1.2.1.43.11.1.1.8',
  supplyLevel: '1.3.6.1.2.1.43.11.1.1.9',
  colorantValue: '1.3.6.1.2.1.43.12.1.1.4',
  /** prtAlertTable。部品の交換案内や異常が入る */
  alertSeverity: '1.3.6.1.2.1.43.18.1.1.2',
  alertGroup: '1.3.6.1.2.1.43.18.1.1.4',
  /** group が消耗品のとき、対象の消耗品の行番号を指す */
  alertGroupIndex: '1.3.6.1.2.1.43.18.1.1.5',
  alertCode: '1.3.6.1.2.1.43.18.1.1.7',
  alertDescription: '1.3.6.1.2.1.43.18.1.1.8',
  /** 操作パネルの表示文字。警告表を持たない機種の受け皿 */
  consoleText: '1.3.6.1.2.1.43.16.5.1.2',
} as const;

/**
 * モノクロ・カラー別の枚数はメーカー拡張 MIB にしかない。
 * 標準の prtMarkerTable はどの機種もマーカー 1 本で、内訳を持っていない。
 * どちらの表も「ID の列」と「値の列」を行番号で突き合わせて読む。
 */
const COUNTER = {
  /** RICOH ricohEngineCounter */
  ricohId: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.2',
  ricohValue: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.9',
  /** Canon cnPrtCounter */
  canonId: '1.3.6.1.4.1.1602.1.11.1.3.1.2',
  canonValue: '1.3.6.1.4.1.1602.1.11.1.3.1.4',
} as const;

/**
 * RICOH のカウンタ ID。401 + 402 + 403 = 400 になる。
 *
 * **400 は「トータル」で、コピー分も含む。** 実機 3 台（SP C341 ×2 / SP C342）で
 * ID 10（トータル）と 400 が完全に一致することを確認した。
 *
 * 機能別は合計だけを持つ。プリンター(1806) + コピー(701) ≒ 400 になる
 * （読んでいる最中も機器が動くので数十ずれる）。
 * **機能別のカラー・モノクロ内訳は機器が出していない。**
 * スキャナは手元の機器がいずれも 0 を返し、どの ID か特定できていない
 */
const RICOH_COUNTER = {
  total: 400,
  mono: 401,
  single: 402,
  full: 403,
  print: 1806,
  copy: 701,
} as const;

/** Canon のカウンタ ID。カラーは合計から引いて出す */
const CANON_COUNTER = { total: 101, mono: 108 } as const;

/** カラー機なら必ず持っている色 */
const COLOR_NAMES = ['cyan', 'magenta', 'yellow'];

export type SupplySnapshot = {
  supplyIndex: number;
  name: string;
  /** prtMarkerSuppliesType。分類はこれで行う */
  supplyType: number | null;
  supplyClass: number | null;
  colorant: string | null;
  level: number;
  maxCapacity: number;
  percent: number | null;
};

/** 機器が出している警告 1 件 */
export type AlertSnapshot = {
  alertIndex: number;
  severity: number | null;
  alertGroup: number | null;
  /** 対象の消耗品の行番号。-1 や null は特定できない */
  groupIndex: number | null;
  code: number | null;
  description: string | null;
};

/** モノクロ・カラーの内訳をどこから得たか */
export type CountSource =
  /** メーカー拡張 MIB がそのまま返した */
  | 'vendor'
  /** カラーの消耗品を持たない機種なので、全部モノクロと判断した */
  | 'mono-only'
  /** 内訳を取れなかった */
  | 'none';

export type PrinterSnapshot = {
  /** 実際に応答があったバージョン */
  version: SnmpVersionKey;
  hostName: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  pageCount: number | null;
  /**
   * pageCount の単位（prtMarkerCounterUnit）。
   * 7 / 8 なら枚、17 ならメートル。返さない機種は null
   */
  counterUnit: number | null;
  /** 累計のモノクロ枚数。取れない機種は null */
  monoCount: number | null;
  /** 累計のカラー枚数。取れない機種は null */
  colorCount: number | null;
  /**
   * 機能ごとの累計。合計だけで、カラー・モノクロの内訳は機器が持っていない。
   * 取れない機種・メーカーは null（0 と区別する）
   */
  printCount: number | null;
  copyCount: number | null;
  /** どの ID がスキャナか特定できていないため、今は常に null */
  scanCount: number | null;
  countSource: CountSource;
  supplies: SupplySnapshot[];
  alerts: AlertSnapshot[];
  /** 操作パネルの表示文字 */
  consoleText: string | null;
};

/**
 * メーカー拡張 MIB のカウンタ表を、そのまま 1 行ずつ返したもの。
 *
 * **どのカウンタ ID がコピー・プリンター・ファクスなのかは機種ごとに違い、
 * 公開されている一覧も無い。** 実機の表を見て決めるしかないので、
 * その材料を出すための読み取り専用の口。集計には使わない
 */
export type CounterDump = {
  version: SnmpVersionKey;
  /** 拡張 MIB を持つメーカー。判定できなければ null（表は空になる） */
  vendor: 'ricoh' | 'canon' | null;
  sysDescr: string | null;
  /** カウンタ ID の昇順 */
  counters: { id: number; value: number }[];
};

/** 応答がなかった。バージョン違い・コミュニティ名違い・そもそも不在のいずれか */
export class SnmpUnreachableError extends Error {}

/** decode() は状態を持たないので使い回してよい。fatal で不正なバイト列を例外にする */
const UTF8_STRICT = new TextDecoder('utf-8', { fatal: true });
const SHIFT_JIS = new TextDecoder('shift_jis', { fatal: true });
const UTF8_LOOSE = new TextDecoder('utf-8');

/**
 * OctetString のバイト列を文字にする。
 * 機種によっては Shift-JIS(CP932) で返してくる（RICOH の「ﾄﾅｰ」「廃ﾄﾅｰ」など）ので、
 * UTF-8 として読めなければ Shift-JIS で読み直す。
 * Shift-JIS の多バイト列と半角カナは UTF-8 としては不正なバイト列になるため、
 * この順で試せば ASCII と UTF-8 で返す機種の結果は変わらない。
 */
function decodeOctets(value: Buffer): string {
  try {
    return UTF8_STRICT.decode(value);
  } catch {
    // UTF-8 ではない。次を試す
  }

  try {
    return SHIFT_JIS.decode(value);
  } catch {
    // どちらでもない。読めるところだけ拾って先へ進む
    return UTF8_LOOSE.decode(value);
  }
}

/** OctetString / 文字列を読める形にする。制御文字と余白は落とす */
function readText(value: Varbind['value']): string | null {
  let text: string;

  if (Buffer.isBuffer(value)) {
    text = decodeOctets(value);
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

  /**
   * メーカー拡張 MIB のカウンタ表をそのまま読む。**調べるための口。**
   * poll と同じくバージョンを順に試す
   */
  async dumpCounters(
    ipAddress: string,
    community: string,
    preferred: SnmpVersionKey = 'V1',
  ): Promise<CounterDump> {
    const order: SnmpVersionKey[] =
      preferred === 'V1' ? ['V1', 'V2C'] : ['V2C', 'V1'];

    for (const version of order) {
      try {
        return await this.dumpCountersWith(ipAddress, community, version);
      } catch (error) {
        if (!(error instanceof SnmpUnreachableError)) throw error;
        this.logger.debug(`${ipAddress}: SNMP ${version} は応答なし`);
      }
    }

    throw new SnmpUnreachableError(
      `${ipAddress} から SNMP の応答がありません。IP アドレス・コミュニティ名・機器側の SNMP 設定を確認してください`,
    );
  }

  private async dumpCountersWith(
    ipAddress: string,
    community: string,
    version: SnmpVersionKey,
  ): Promise<CounterDump> {
    const session = snmp.createSession(ipAddress, community, {
      version: version === 'V1' ? snmp.Version1 : snmp.Version2c,
      timeout: TIMEOUT_MS,
      retries: RETRIES,
    });
    session.on('error', (error) => {
      this.logger.debug(`${ipAddress}: セッションエラー ${error.message}`);
    });

    try {
      // 生存確認を兼ねる。ここが無反応ならこのバージョンでは話せない
      await this.get(session, SCALAR.sysName);
      const sysDescrRaw = await this.get(session, SCALAR.sysDescr);
      const sysDescr = sysDescrRaw ? readText(sysDescrRaw.value) : null;
      const descr = sysDescr ?? '';

      const vendor: CounterDump['vendor'] = /ricoh|ipsio/i.test(descr)
        ? 'ricoh'
        : /canon/i.test(descr)
          ? 'canon'
          : null;

      const table =
        vendor === 'ricoh'
          ? await this.readCounterTable(
              session,
              COUNTER.ricohId,
              COUNTER.ricohValue,
            )
          : vendor === 'canon'
            ? await this.readCounterTable(
                session,
                COUNTER.canonId,
                COUNTER.canonValue,
              )
            : new Map<number, number>();

      return {
        version,
        vendor,
        sysDescr,
        counters: [...table.entries()]
          .map(([id, value]) => ({ id, value }))
          .sort((a, b) => a.id - b.id),
      };
    } finally {
      session.close();
    }
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

      const [sysDescr, hrDeviceDescr, serialNumber, pageCount, counterUnit] =
        await Promise.all([
          this.get(session, SCALAR.sysDescr),
          this.get(session, SCALAR.hrDeviceDescr),
          this.get(session, SCALAR.serialNumber),
          this.get(session, SCALAR.pageCount),
          this.get(session, SCALAR.counterUnit),
        ]);

      const [macs, supplies, alerts, consoleText] = await Promise.all([
        this.walk(session, TABLE.ifPhysAddress),
        this.readSupplies(session),
        this.readAlerts(session),
        this.readConsoleText(session),
      ]);

      const macAddress =
        Array.from(macs.values())
          .map((varbind) => readMac(varbind.value))
          .find((mac) => mac !== null) ?? null;

      const total = pageCount ? readNumber(pageCount.value) : null;
      const descr = sysDescr ? readText(sysDescr.value) : null;
      const counts = await this.readCounts(session, descr, total, supplies);

      return {
        version,
        hostName: sysName ? readText(sysName.value) : null,
        model:
          (hrDeviceDescr ? readText(hrDeviceDescr.value) : null) ??
          descr?.split(/[\r\n;]/)[0] ??
          null,
        serialNumber: serialNumber ? readText(serialNumber.value) : null,
        macAddress,
        pageCount: total,
        counterUnit: counterUnit ? readNumber(counterUnit.value) : null,
        ...counts,
        supplies,
        alerts,
        consoleText,
      };
    } finally {
      session.close();
    }
  }

  /**
   * 機器が出している警告を読む。部品の交換案内はここに入る。
   * 表を持たない機種（RICOH SP C341 / EPSON など）は空で返る。
   */
  private async readAlerts(session: Session): Promise<AlertSnapshot[]> {
    const [severities, groups, groupIndexes, codes, descriptions] =
      await Promise.all([
        this.walk(session, TABLE.alertSeverity),
        this.walk(session, TABLE.alertGroup),
        this.walk(session, TABLE.alertGroupIndex),
        this.walk(session, TABLE.alertCode),
        this.walk(session, TABLE.alertDescription),
      ]);

    const alerts: AlertSnapshot[] = [];

    for (const [suffix, varbind] of descriptions) {
      const alertIndex = lastIndexOf(suffix);
      if (alertIndex === null) continue;

      // -1 は「対象を特定できない」の意味なので、null に寄せる
      const rawGroupIndex = readNumber(groupIndexes.get(suffix)?.value ?? null);

      alerts.push({
        alertIndex,
        severity: readNumber(severities.get(suffix)?.value ?? null),
        alertGroup: readNumber(groups.get(suffix)?.value ?? null),
        groupIndex:
          rawGroupIndex !== null && rawGroupIndex > 0 ? rawGroupIndex : null,
        code: readNumber(codes.get(suffix)?.value ?? null),
        description: readText(varbind.value),
      });
    }

    // 説明が空の行は読んでも仕方がないので落とす（KYOCERA がこれを返す）
    return alerts
      .filter((alert) => alert.description !== null)
      .sort((a, b) => a.alertIndex - b.alertIndex);
  }

  /** 操作パネルの表示。複数行に分かれるので繋げる */
  private async readConsoleText(session: Session): Promise<string | null> {
    const rows = await this.walk(session, TABLE.consoleText);

    const lines = [...rows.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([, varbind]) => readText(varbind.value))
      .filter((line): line is string => line !== null);

    return lines.length > 0 ? lines.join(' / ') : null;
  }

  /** 消耗品の表をまとめて読む */
  private async readSupplies(session: Session): Promise<SupplySnapshot[]> {
    const [
      descriptions,
      levels,
      capacities,
      colorantIndexes,
      colorantValues,
      types,
      classes,
    ] = await Promise.all([
      this.walk(session, TABLE.supplyDescription),
      this.walk(session, TABLE.supplyLevel),
      this.walk(session, TABLE.supplyMaxCapacity),
      this.walk(session, TABLE.supplyColorantIndex),
      this.walk(session, TABLE.colorantValue),
      this.walk(session, TABLE.supplyType),
      this.walk(session, TABLE.supplyClass),
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
        supplyType: readNumber(types.get(suffix)?.value ?? null),
        supplyClass: readNumber(classes.get(suffix)?.value ?? null),
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
   * モノクロ・カラー別の累計を読む。
   * RICOH と Canon は拡張 MIB を持っている。それ以外はカラーの消耗品の有無で
   * 判断し、モノクロ専用機なら累計を全部モノクロとして扱う。
   */
  private async readCounts(
    session: Session,
    sysDescr: string | null,
    total: number | null,
    supplies: SupplySnapshot[],
  ): Promise<
    Pick<
      PrinterSnapshot,
      | 'monoCount'
      | 'colorCount'
      | 'printCount'
      | 'copyCount'
      | 'scanCount'
      | 'countSource'
    >
  > {
    const descr = sysDescr ?? '';

    if (/ricoh|ipsio/i.test(descr)) {
      const counters = await this.readCounterTable(
        session,
        COUNTER.ricohId,
        COUNTER.ricohValue,
      );
      const mono = counters.get(RICOH_COUNTER.mono);

      if (mono !== undefined) {
        // 単色はカラー側に寄せる。401 + 402 + 403 = 400 になる
        const color =
          (counters.get(RICOH_COUNTER.single) ?? 0) +
          (counters.get(RICOH_COUNTER.full) ?? 0);
        return {
          monoCount: mono,
          colorCount: color,
          // 出していない機種は 0 ではなく「取れていない」なので null に倒す
          printCount: counters.get(RICOH_COUNTER.print) ?? null,
          copyCount: counters.get(RICOH_COUNTER.copy) ?? null,
          scanCount: null,
          countSource: 'vendor',
        };
      }
    } else if (/canon/i.test(descr)) {
      const counters = await this.readCounterTable(
        session,
        COUNTER.canonId,
        COUNTER.canonValue,
      );
      const mono = counters.get(CANON_COUNTER.mono);
      const sum = counters.get(CANON_COUNTER.total);

      if (mono !== undefined && sum !== undefined) {
        return {
          monoCount: mono,
          colorCount: sum - mono,
          // iR-ADV が返すのは 4 つだけで、機能別のカウンタは公開していない
          printCount: null,
          copyCount: null,
          scanCount: null,
          countSource: 'vendor',
        };
      }
    }

    // カラーの消耗品を 1 つも持たない機種は、そもそもカラーを刷れない
    const hasColor = supplies.some(
      (supply) =>
        supply.colorant !== null &&
        COLOR_NAMES.includes(supply.colorant.toLowerCase()),
    );

    // 機能別は拡張 MIB からしか取れないので、ここから先は常に null
    const noFunctions = {
      printCount: null,
      copyCount: null,
      scanCount: null,
    };

    if (!hasColor && supplies.length > 0 && total !== null) {
      return {
        monoCount: total,
        colorCount: 0,
        ...noFunctions,
        countSource: 'mono-only',
      };
    }

    return {
      monoCount: null,
      colorCount: null,
      ...noFunctions,
      countSource: 'none',
    };
  }

  /** ID の列と値の列を行番号で突き合わせて、カウンタ ID から値を引けるようにする */
  private async readCounterTable(
    session: Session,
    idBase: string,
    valueBase: string,
  ): Promise<Map<number, number>> {
    const [ids, values] = await Promise.all([
      this.walk(session, idBase),
      this.walk(session, valueBase),
    ]);

    const counters = new Map<number, number>();
    for (const [row, varbind] of ids) {
      const id = readCounterId(varbind.value);
      const value = readNumber(values.get(row)?.value ?? null);
      if (id !== null && value !== null) counters.set(id, value);
    }
    return counters;
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

/**
 * カウンタ ID を読む。
 * RICOH は整数で返すが、Canon は OctetString の "101" で返してくる。
 * 数値として読めなければ文字列として読み直す。
 */
function readCounterId(value: Varbind['value']): number | null {
  const direct = readNumber(value);
  if (direct !== null) return Number.isInteger(direct) ? direct : null;

  const text = readText(value);
  if (text === null) return null;

  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : null;
}

/** "1.2" → 2。表の添字は末尾が行番号 */
function lastIndexOf(suffix: string): number | null {
  const last = suffix.split('.').pop();
  if (last === undefined) return null;
  const parsed = Number(last);
  return Number.isInteger(parsed) ? parsed : null;
}
