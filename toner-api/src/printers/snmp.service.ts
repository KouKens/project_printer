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
 * 機能別・色別の枚数はメーカー拡張 MIB にしかない。
 * 標準の prtMarkerTable はどの機種もマーカー 1 本で、内訳を持っていない。
 * どの表も「ID の列」「名前の列」「値の列」を行番号で突き合わせて読む。
 */
const COUNTER = {
  /** RICOH ricohEngineCounter */
  ricohId: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.2',
  ricohName: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.5',
  ricohValue: '1.3.6.1.4.1.367.3.2.1.2.19.5.1.9',
  /**
   * Canon の全カウンタ表。**機能別の内訳はこちらにしかない。**
   * 下の抜粋版と紛らわしいが、末尾が 1.4 と 1.3 で別の表
   */
  canonId: '1.3.6.1.4.1.1602.1.11.1.4.1.2',
  canonName: '1.3.6.1.4.1.1602.1.11.1.4.1.3',
  canonValue: '1.3.6.1.4.1.1602.1.11.1.4.1.4',
  /**
   * 同じ機種が別に持っている抜粋版（iR-ADV は 4 件だけ）。
   * 全カウンタ表を持たない機種のための受け皿で、総数と黒しか入っていない
   */
  canonBriefId: '1.3.6.1.4.1.1602.1.11.1.3.1.2',
  canonBriefName: '1.3.6.1.4.1.1602.1.11.1.3.1.3',
  canonBriefValue: '1.3.6.1.4.1.1602.1.11.1.3.1.4',
  /**
   * EPSON の用紙サイズ別カウンタ。**上の 2 社と作りが違う。**
   *
   * ID も名前も無く、行は用紙サイズ（A3/Ledger・A4/Letter …）で、
   * 列が意味を表す。ここで使うのは総ページ数（列 4）とカラーページ数（列 5）で、
   * どちらも全用紙サイズを足して 1 台ぶんにする。
   * 機能別（プリンター・コピー・スキャン）の列は無い
   */
  epsonTotal: '1.3.6.1.4.1.1248.1.2.2.6.1.1.4',
  epsonColor: '1.3.6.1.4.1.1248.1.2.2.6.1.1.5',
} as const;

/**
 * RICOH のカウンタ ID。名前の列（ricohName）で意味を確かめてある。
 *
 * **400 は機器の総数ではなく「プリンター機能の総数」**（Counter:Print:Total）で、
 * 401 + 402 + 403 に等しい。機器の総数は 10（Counter: Machine Total）のほう。
 * 手元の RICOH 22 台はすべてプリンター専用機なので両者は一致し、
 * コピー・スキャナのカウンタは表に存在しない。
 *
 * 以前ここで機能別として見ていた 1806 と 701 は別物だった。
 * 1806 は `Total Prints: <A3,DLT: Total`（A3 未満の総枚数）、
 * 701 は `No. of Printed Sides in Duplex`（両面印字の面数）で、
 * たまたま足すと総数に近くなるだけ。**機能別には使えない**
 */
const RICOH_COUNTER = {
  /** Counter: Machine Total。複合機ならコピー分も含む */
  machine: 10,
  /** Counter:Print:Total */
  printTotal: 400,
  /** Counter:Print:Black & White */
  printMono: 401,
  /** Counter:Print:Single/Two-col.。単色はカラー側に寄せる */
  printSingle: 402,
  /** Counter:Print:Full Color */
  printFull: 403,
} as const;

/**
 * Canon のカウンタ ID。名前の列（canonName）で意味を確かめてある。
 *
 * iR-ADV 8 台すべてで **201 + 301 + 701 = 101** が成り立つ。
 * 301 はプリント、701 は FAX 受信の印刷で、どちらも「印刷した」ぶん。
 * 機能を 3 つに分ける都合上、コピー以外はまとめてプリンター側に置く
 * （プリンター = 総数 − コピー）。この引き算なら FAX 受信の取りこぼしが出ない。
 *
 * 色は「フルカラー + 単色」の側しか出ないので、モノクロは引いて出す
 */
const CANON_COUNTER = {
  /** Total 1 = prtMarkerLifeCount */
  total: 101,
  /** Total (Black 1) */
  mono: 108,
  /** Copy (Total 1) */
  copyTotal: 201,
  /** Copy (Full Color + Single Color/1) */
  copyColor: 232,
  /** Scan (Total 1)。紙に出ないので総数には入っていない */
  scanTotal: 501,
} as const;

/**
 * EPSON の表と `prtMarkerLifeCount` のずれをどこまで許すか（ページ）。
 *
 * **エプソンは私有 MIB を公開していない。** RICOH や Canon と違って
 * 名前の列も無いので、列の意味は「総ページ数の合計が prtMarkerLifeCount と
 * 一致すること」でしか確かめられない。そこで毎回それを確かめ、
 * 合わなければ読まなかったことにする（ファーム更新で列の意味が変わったら、
 * 黙って別の数字を貯め続けるより読めないほうがよい）。
 *
 * 累計は poll の最初、この表は最後に読むので、その間に印刷されると数ページずれる。
 * 25ipm の機種で数秒ぶんを見込んで 10 ページまでは許す
 */
const EPSON_TOTAL_TOLERANCE = 10;

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

/**
 * 表を 1 列歩いた結果。
 *
 * **complete が false なら途中で切れている。** 取れた行だけを黙って使うと、
 * 「表の後ろが無い機器」に見えてしまう（下の walk のコメント参照）
 */
type WalkResult = {
  rows: Map<string, Varbind>;
  complete: boolean;
};

/** 表の 1 列を何行読めたか。**調べるための情報**で、集計には使わない */
export type ColumnStatus = {
  name: string;
  oid: string;
  rows: number;
  complete: boolean;
};

/** 消耗品の表として歩く列。dump でも同じ順で歩く */
const SUPPLY_COLUMNS = [
  { name: '説明', oid: TABLE.supplyDescription },
  { name: '残量', oid: TABLE.supplyLevel },
  { name: '最大容量', oid: TABLE.supplyMaxCapacity },
  { name: '色番号', oid: TABLE.supplyColorantIndex },
  { name: '色名', oid: TABLE.colorantValue },
  { name: '種別', oid: TABLE.supplyType },
  { name: '分類', oid: TABLE.supplyClass },
] as const;

/** 警告の表として歩く列 */
const ALERT_COLUMNS = [
  { name: '重大度', oid: TABLE.alertSeverity },
  { name: '区分', oid: TABLE.alertGroup },
  { name: '対象行', oid: TABLE.alertGroupIndex },
  { name: 'コード', oid: TABLE.alertCode },
  { name: '説明', oid: TABLE.alertDescription },
] as const;

/** 消耗品の表を読んだ結果。切れていたかどうかを添えて返す */
type SupplyRead = {
  supplies: SupplySnapshot[];
  /** 7 列すべてを歩き切れたか。false なら保存側で前回の値を残す */
  complete: boolean;
  columns: ColumnStatus[];
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

/**
 * 累計枚数を **機能 × 色** の 6 つに割ったもの。取れないものは null（0 と区別する）。
 *
 * 画面の集計はこの 6 つだけを土台にして、
 * 「累計プリンター = プリンターモノクロ + プリンターカラー」のように足して出す。
 * どこかを足し忘れて数が合わなくなるのを防ぐため、合計は保存しない。
 *
 * **スキャナは紙に出ないので累計（prtMarkerLifeCount）には入らない。**
 * 累計 = プリンター + コピー で、スキャナは読み取り枚数として別に見る
 */
export type CountMatrix = {
  printMono: number | null;
  printColor: number | null;
  copyMono: number | null;
  copyColor: number | null;
  scanMono: number | null;
  scanColor: number | null;
};

/** 機能別を 1 つも出せない機種の分。カラー・モノクロだけ入る余地を残す */
const NO_MATRIX: CountMatrix = {
  printMono: null,
  printColor: null,
  copyMono: null,
  copyColor: null,
  scanMono: null,
  scanColor: null,
};

export type PrinterSnapshot = CountMatrix & {
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
  /** 累計のモノクロ枚数（プリンター + コピー）。取れない機種は null */
  monoCount: number | null;
  /** 累計のカラー枚数（プリンター + コピー）。取れない機種は null */
  colorCount: number | null;
  countSource: CountSource;
  supplies: SupplySnapshot[];
  /**
   * 消耗品の表を最後まで読めたか。
   *
   * **false のときの supplies は表の途中まで**で、残りが無いのか読めなかったのかは
   * 区別できない。そのまま保存すると、読めた行だけが残って
   * 「ドラムも定着も無い機器」に見えるので、保存側で前回の値を残す
   */
  suppliesComplete: boolean;
  alerts: AlertSnapshot[];
  /** 操作パネルの表示文字 */
  consoleText: string | null;
};

/**
 * 消耗品・警告の表をそのまま返したもの。**調べるための口。**
 *
 * 列ごとに何行読めたかを添える。機器が持っていないのか、
 * 応答が落ちて途中で切れたのかは、行数と complete を並べないと分からない
 */
export type SupplyDump = {
  version: SnmpVersionKey;
  sysDescr: string | null;
  columns: ColumnStatus[];
  supplies: SupplySnapshot[];
  alerts: AlertSnapshot[];
  consoleText: string | null;
};

/**
 * メーカー拡張 MIB のカウンタ表を、そのまま 1 行ずつ返したもの。
 *
 * **どのカウンタ ID がコピー・プリンター・ファクスなのかは機種ごとに違う。**
 * ただしどちらのメーカーも名前の列を持っており（`Counter:Print:Black & White`
 * `Copy (Full Color + Single Color/1)` など）、そこを読めば意味が分かる。
 * 機種を足したときに ID を確かめるための読み取り専用の口
 */
export type CounterDump = {
  version: SnmpVersionKey;
  /** 拡張 MIB を持つメーカー。判定できなければ null（表は空になる） */
  vendor: 'ricoh' | 'canon' | null;
  sysDescr: string | null;
  /** カウンタ ID の昇順 */
  counters: { id: number; name: string | null; value: number }[];
};

/** カウンタ表の 1 行。名前は機器が付けている英語の見出し */
type CounterRow = { name: string | null; value: number };

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
              COUNTER.ricohName,
            )
          : vendor === 'canon'
            ? await this.readCanonCounters(session)
            : new Map<number, CounterRow>();

      return {
        version,
        vendor,
        sysDescr,
        counters: [...table.entries()]
          .map(([id, row]) => ({ id, name: row.name, value: row.value }))
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

      const sysDescr = await this.get(session, SCALAR.sysDescr);
      const hrDeviceDescr = await this.get(session, SCALAR.hrDeviceDescr);
      const serialNumber = await this.get(session, SCALAR.serialNumber);
      const pageCount = await this.get(session, SCALAR.pageCount);
      const counterUnit = await this.get(session, SCALAR.counterUnit);

      const macs = await this.walk(session, TABLE.ifPhysAddress);
      const supplies = await this.readSupplies(session);
      const alerts = await this.readAlerts(session);
      const consoleText = await this.readConsoleText(session);

      const macAddress =
        Array.from(macs.rows.values())
          .map((varbind) => readMac(varbind.value))
          .find((mac) => mac !== null) ?? null;

      const total = pageCount ? readNumber(pageCount.value) : null;
      const descr = sysDescr ? readText(sysDescr.value) : null;
      const counts = await this.readCounts(
        session,
        descr,
        total,
        supplies.supplies,
      );

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
        supplies: supplies.supplies,
        suppliesComplete: supplies.complete,
        alerts,
        consoleText,
      };
    } finally {
      session.close();
    }
  }

  /**
   * 消耗品・警告の表をそのまま読む。**調べるための口。**
   *
   * 一覧に出ない部品があるとき、機器が持っていないのか、
   * 応答が落ちて表が途中で切れたのかを列ごとの行数で見分けるために使う
   */
  async dumpSupplies(
    ipAddress: string,
    community: string,
    preferred: SnmpVersionKey = 'V1',
  ): Promise<SupplyDump> {
    const order: SnmpVersionKey[] =
      preferred === 'V1' ? ['V1', 'V2C'] : ['V2C', 'V1'];

    for (const version of order) {
      try {
        return await this.dumpSuppliesWith(ipAddress, community, version);
      } catch (error) {
        if (!(error instanceof SnmpUnreachableError)) throw error;
        this.logger.debug(`${ipAddress}: SNMP ${version} は応答なし`);
      }
    }

    throw new SnmpUnreachableError(
      `${ipAddress} から SNMP の応答がありません。IP アドレス・コミュニティ名・機器側の SNMP 設定を確認してください`,
    );
  }

  private async dumpSuppliesWith(
    ipAddress: string,
    community: string,
    version: SnmpVersionKey,
  ): Promise<SupplyDump> {
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

      const supplies = await this.readSupplies(session);
      const alerts = await this.readAlerts(session);
      const consoleText = await this.readConsoleText(session);

      return {
        version,
        sysDescr: sysDescrRaw ? readText(sysDescrRaw.value) : null,
        columns: supplies.columns,
        supplies: supplies.supplies,
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
      await this.walkAll(session, ALERT_COLUMNS);

    const alerts: AlertSnapshot[] = [];

    for (const [suffix, varbind] of descriptions.rows) {
      const alertIndex = lastIndexOf(suffix);
      if (alertIndex === null) continue;

      // -1 は「対象を特定できない」の意味なので、null に寄せる
      const rawGroupIndex = readNumber(
        groupIndexes.rows.get(suffix)?.value ?? null,
      );

      alerts.push({
        alertIndex,
        severity: readNumber(severities.rows.get(suffix)?.value ?? null),
        alertGroup: readNumber(groups.rows.get(suffix)?.value ?? null),
        groupIndex:
          rawGroupIndex !== null && rawGroupIndex > 0 ? rawGroupIndex : null,
        code: readNumber(codes.rows.get(suffix)?.value ?? null),
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
    const { rows } = await this.walk(session, TABLE.consoleText);

    const lines = [...rows.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([, varbind]) => readText(varbind.value))
      .filter((line): line is string => line !== null);

    return lines.length > 0 ? lines.join(' / ') : null;
  }

  /** 消耗品の表をまとめて読む。列は 1 本ずつ順に歩く（walkAll のコメント参照） */
  private async readSupplies(session: Session): Promise<SupplyRead> {
    const [
      descriptions,
      levels,
      capacities,
      colorantIndexes,
      colorantValues,
      types,
      classes,
    ] = await this.walkAll(session, SUPPLY_COLUMNS);

    // prtMarkerColorantTable は色番号で引く。末尾の添字だけ見れば足りる
    const colorants = new Map<number, string>();
    for (const [suffix, varbind] of colorantValues.rows) {
      const index = lastIndexOf(suffix);
      const name = readText(varbind.value);
      if (index !== null && name) colorants.set(index, name);
    }

    /*
     * 行は「どれか 1 列にでも出てきた添字」。
     *
     * 説明の列だけを見て並べると、**説明を返さない行はまるごと落ちる**。
     * 残量も種別も返しているのに一覧から消えてしまうので、列を寄せ集めてから引く。
     * 色名（prtMarkerColorantTable）は別の表なので、行を決める側には入れない
     */
    const suffixes = new Set<string>([
      ...descriptions.rows.keys(),
      ...levels.rows.keys(),
      ...capacities.rows.keys(),
      ...colorantIndexes.rows.keys(),
      ...types.rows.keys(),
      ...classes.rows.keys(),
    ]);

    const supplies: SupplySnapshot[] = [];

    for (const suffix of suffixes) {
      const supplyIndex = lastIndexOf(suffix);
      if (supplyIndex === null) continue;

      const description = descriptions.rows.get(suffix);
      const name =
        (description ? readText(description.value) : null) ??
        `消耗品 ${supplyIndex}`;
      const level = readNumber(levels.rows.get(suffix)?.value ?? null) ?? -1;
      const maxCapacity =
        readNumber(capacities.rows.get(suffix)?.value ?? null) ?? -1;
      const colorantIndex = readNumber(
        colorantIndexes.rows.get(suffix)?.value ?? null,
      );

      supplies.push({
        supplyIndex,
        name,
        supplyType: readNumber(types.rows.get(suffix)?.value ?? null),
        supplyClass: readNumber(classes.rows.get(suffix)?.value ?? null),
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

    const results = [
      descriptions,
      levels,
      capacities,
      colorantIndexes,
      colorantValues,
      types,
      classes,
    ];

    return {
      supplies,
      complete: results.every((result) => result.complete),
      columns: SUPPLY_COLUMNS.map((column, position) => ({
        name: column.name,
        oid: column.oid,
        rows: results[position].rows.size,
        complete: results[position].complete,
      })),
    };
  }

  /**
   * 累計を **機能 × 色** に割って読む。
   *
   * RICOH と Canon は拡張 MIB を持っている。それ以外はカラーの消耗品の有無で
   * 判断し、モノクロ専用機なら累計を全部モノクロとして扱う（機能別は出せない）。
   */
  private async readCounts(
    session: Session,
    sysDescr: string | null,
    total: number | null,
    supplies: SupplySnapshot[],
  ): Promise<
    CountMatrix &
      Pick<PrinterSnapshot, 'monoCount' | 'colorCount' | 'countSource'>
  > {
    const descr = sysDescr ?? '';

    if (/ricoh|ipsio/i.test(descr)) {
      const counters = await this.readCounterTable(
        session,
        COUNTER.ricohId,
        COUNTER.ricohValue,
        COUNTER.ricohName,
      );
      const ricoh = this.ricohCounts(counters);
      if (ricoh) return ricoh;
    } else if (/canon/i.test(descr)) {
      const canon = this.canonCounts(await this.readCanonCounters(session));
      if (canon) return canon;
    } else if (/epson/i.test(descr)) {
      const epson = await this.epsonCounts(session, total);
      if (epson) return epson;
    }

    // カラーの消耗品を 1 つも持たない機種は、そもそもカラーを刷れない
    const hasColor = supplies.some(
      (supply) =>
        supply.colorant !== null &&
        COLOR_NAMES.includes(supply.colorant.toLowerCase()),
    );

    // 機能別は拡張 MIB からしか取れないので、ここから先は常に null
    if (!hasColor && supplies.length > 0 && total !== null) {
      return {
        monoCount: total,
        colorCount: 0,
        ...NO_MATRIX,
        countSource: 'mono-only',
      };
    }

    return {
      monoCount: null,
      colorCount: null,
      ...NO_MATRIX,
      countSource: 'none',
    };
  }

  /**
   * RICOH の拡張 MIB から 6 つに割る。表を持たない機種（SP 3610）は null。
   *
   * プリンターの内訳（401 / 402 + 403）は表にそのまま入っている。
   * コピーは機器の総数（10）からプリンターぶんを引いて出す。
   * **手元の 22 台はすべてプリンター専用機なので、ここは必ず 0 になる。**
   * 複合機を足したときにコピー分が消えないよう、引き算で拾えるようにしてある。
   * その場合の内訳は機器が出さないので、まとめてモノクロに寄せる
   */
  private ricohCounts(
    counters: Map<number, CounterRow>,
  ):
    | (CountMatrix &
        Pick<PrinterSnapshot, 'monoCount' | 'colorCount' | 'countSource'>)
    | null {
    const printMono = counters.get(RICOH_COUNTER.printMono)?.value;
    if (printMono === undefined) return null;

    // 単色・2 色はカラー側に寄せる。モノクロ機は 402 / 403 を持たない
    const printColor =
      (counters.get(RICOH_COUNTER.printSingle)?.value ?? 0) +
      (counters.get(RICOH_COUNTER.printFull)?.value ?? 0);

    const printTotal = printMono + printColor;
    const machine =
      counters.get(RICOH_COUNTER.machine)?.value ??
      counters.get(RICOH_COUNTER.printTotal)?.value ??
      printTotal;

    // 読んでいる最中に機器が動くと負になりうるので、下は 0 で止める
    const copyMono = Math.max(0, machine - printTotal);

    return {
      monoCount: printMono + copyMono,
      colorCount: printColor,
      printMono,
      printColor,
      copyMono,
      copyColor: 0,
      // スキャナのカウンタを持つ RICOH 機が手元に無く、ID を特定できていない
      scanMono: null,
      scanColor: null,
      countSource: 'vendor',
    };
  }

  /**
   * Canon の拡張 MIB から 6 つに割る。総数と黒が無ければ null。
   *
   * コピーだけが表に分かれているので、**プリンターは引き算で出す**。
   * こうすると FAX 受信の印刷（701）もプリンター側に入り、
   * 「プリンター + コピー = 総数」が必ず成り立つ。
   * スキャナは色の内訳を持たないので、まとめてモノクロに寄せる
   */
  private canonCounts(
    counters: Map<number, CounterRow>,
  ):
    | (CountMatrix &
        Pick<PrinterSnapshot, 'monoCount' | 'colorCount' | 'countSource'>)
    | null {
    const total = counters.get(CANON_COUNTER.total)?.value;
    const mono = counters.get(CANON_COUNTER.mono)?.value;
    if (total === undefined || mono === undefined) return null;

    const color = total - mono;
    const copyTotal = counters.get(CANON_COUNTER.copyTotal)?.value;
    const copyColor = counters.get(CANON_COUNTER.copyColor)?.value;
    const scanTotal = counters.get(CANON_COUNTER.scanTotal)?.value;

    // 抜粋版の表しか持たない機種はここが欠ける。総数と黒だけ出す
    const split = copyTotal !== undefined && copyColor !== undefined;
    const copyMono = split ? copyTotal - copyColor : null;

    return {
      monoCount: mono,
      colorCount: color,
      printMono: copyMono === null ? null : mono - copyMono,
      printColor: split ? color - copyColor : null,
      copyMono,
      copyColor: split ? copyColor : null,
      scanMono: scanTotal ?? null,
      scanColor: scanTotal === undefined ? null : 0,
      countSource: 'vendor',
    };
  }

  /**
   * EPSON の用紙サイズ別カウンタ表から、累計のモノクロ・カラーを出す。
   *
   * **機能別（プリンター・コピー・スキャン）の列は無い。** 手元の PX-M791FT の
   * 拡張 MIB を歩いた限り、用紙サイズ別と給紙装置別しか持っていないので、
   * 出せるのは色の 2 つだけになる。
   *
   * モノクロ = 総ページ数 − カラーページ数。RICOH・Canon と同じく、
   * **足し合わせの土台はメーカーの表の総数**にする（prtMarkerLifeCount ではない）。
   *
   * カラーの列（列 5）は**モノクロ専用機には存在しない**。手元の PX-S381L 4 台は
   * 1 行も返さず、カラーの PX-M791FT 2 台だけが返す。そのため列が無いことを
   * 「カラー 0」と読むと、モノクロ機を誤ってカラー機として扱うことになる。
   * ここでは列が無ければ読めなかったこととし、モノクロ専用機の判定は
   * 呼び出し元の「カラーの消耗品を持たない」に任せる
   */
  private async epsonCounts(
    session: Session,
    lifeCount: number | null,
  ): Promise<
    | (CountMatrix &
        Pick<PrinterSnapshot, 'monoCount' | 'colorCount' | 'countSource'>)
    | null
  > {
    const [totals, colors] = await this.walkAll(session, [
      { name: '総ページ数', oid: COUNTER.epsonTotal },
      { name: 'カラーページ数', oid: COUNTER.epsonColor },
    ]);

    // 途中で切れた表を足すと少なく出る。読めなかったことにして次回に回す
    if (!totals.complete || !colors.complete) return null;
    if (totals.rows.size === 0 || colors.rows.size === 0) return null;

    const total = sumRows(totals.rows);
    const color = sumRows(colors.rows);
    if (total === null || color === null) return null;

    // 列の意味が変わっていないかを毎回確かめる（EPSON_TOTAL_TOLERANCE 参照）
    if (
      lifeCount !== null &&
      Math.abs(total - lifeCount) > EPSON_TOTAL_TOLERANCE
    ) {
      this.logger.warn(
        `EPSON の総ページ数 ${total} が累計 ${lifeCount} と合いません。色の内訳は読みません`,
      );
      return null;
    }

    if (color > total) return null;

    return {
      monoCount: total - color,
      colorCount: color,
      // 機能別の列を持たないので、6 つはすべて空のまま
      ...NO_MATRIX,
      countSource: 'vendor',
    };
  }

  /**
   * Canon のカウンタ表。**全カウンタ表を先に見る。**
   * 機能別が入っているのはこちらだけで、抜粋版には総数と黒しかない
   */
  private async readCanonCounters(
    session: Session,
  ): Promise<Map<number, CounterRow>> {
    const full = await this.readCounterTable(
      session,
      COUNTER.canonId,
      COUNTER.canonValue,
      COUNTER.canonName,
    );
    if (full.size > 0) return full;

    return this.readCounterTable(
      session,
      COUNTER.canonBriefId,
      COUNTER.canonBriefValue,
      COUNTER.canonBriefName,
    );
  }

  /**
   * ID・名前・値の 3 列を行番号で突き合わせて、カウンタ ID から引けるようにする。
   * 名前は機器が付けている英語の見出しで、ID の意味を確かめるために持つ
   */
  private async readCounterTable(
    session: Session,
    idBase: string,
    valueBase: string,
    nameBase: string,
  ): Promise<Map<number, CounterRow>> {
    const [ids, values, names] = await this.walkAll(session, [
      { name: 'ID', oid: idBase },
      { name: '値', oid: valueBase },
      { name: '名前', oid: nameBase },
    ]);

    const counters = new Map<number, CounterRow>();
    for (const [row, varbind] of ids.rows) {
      const id = readCounterId(varbind.value);
      const value = readNumber(values.rows.get(row)?.value ?? null);
      if (id === null || value === null) continue;

      const label = names.rows.get(row);
      counters.set(id, { name: label ? readText(label.value) : null, value });
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
   * 表を何本かまとめて歩く。**1 台に同時に投げない。**
   *
   * 以前は Promise.all で 14 本を一度に投げていた。歩くのは 1 本につき
   * 1 往復ずつなので、機器には常に 14 件の要求が同時に届くことになる。
   * SNMP は UDP で、返事が 1 つ落ちれば net-snmp はそこで歩くのをやめるため、
   * **表の後ろが黙って欠ける**。手元の Canon（同一セグメント）でも
   * 12 回に 1 回は再送が要り、遠いセグメントでは再送も落ちて欠けていた。
   * 1 本ずつなら 1 台あたり 50ms → 300ms 程度で済み、台ごとの並行は残せる
   */
  private async walkAll(
    session: Session,
    columns: readonly { name: string; oid: string }[],
  ): Promise<WalkResult[]> {
    const results: WalkResult[] = [];
    for (const column of columns) {
      results.push(await this.walk(session, column.oid));
    }
    return results;
  }

  /**
   * 表を歩く。キーは base より後ろの添字（例 "1.2"）。
   *
   * **途中で切れたかどうかを返す。** 消耗品の表はトナー・廃トナー・ドラム・定着の
   * 順に並ぶので、切れたぶんはそのまま「ドラムも定着も無い機器」に見える。
   * 取れたところまでを黙って返していたのがこれの原因だった。
   * 1 度だけ引き直し、それでも切れたときは complete を false で知らせる
   */
  private async walk(session: Session, base: string): Promise<WalkResult> {
    const first = await this.walkOnce(session, base);
    if (first.complete) return first;

    this.logger.debug(`${base} が途中で切れました。引き直します`);
    const retry = await this.walkOnce(session, base);

    // 引き直しも切れたら、多く読めたほうを使う
    return retry.complete || retry.rows.size >= first.rows.size ? retry : first;
  }

  /**
   * 1 回だけ歩く。最後まで行けたかを complete に入れる。
   * v1 の終端（noSuchName）は正常な終わりで、エラーとしては返ってこない
   */
  private walkOnce(session: Session, base: string): Promise<WalkResult> {
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
        (error) => resolve({ rows, complete: !error }),
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

/**
 * 列の全行を足す。1 行でも数として読めなければ null。
 *
 * EPSON の表は行が用紙サイズなので、1 台ぶんの枚数にするには足す必要がある。
 * 読めない行を 0 として飛ばすと、その用紙サイズのぶんだけ黙って少なく出る
 */
function sumRows(rows: Map<string, Varbind>): number | null {
  let sum = 0;
  for (const varbind of rows.values()) {
    const value = readNumber(varbind.value);
    if (value === null) return null;
    sum += value;
  }
  return sum;
}

/** "1.2" → 2。表の添字は末尾が行番号 */
function lastIndexOf(suffix: string): number | null {
  const last = suffix.split('.').pop();
  if (last === undefined) return null;
  const parsed = Number(last);
  return Number.isInteger(parsed) ? parsed : null;
}
