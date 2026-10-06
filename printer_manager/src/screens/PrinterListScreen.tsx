import { useCallback, useEffect, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import DailyCheckStar from '../components/DailyCheckStar';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import {
  MAINT_SOON_DAYS,
  maintDaysLeft,
  maintLeftLabel,
  maintStatus,
} from '../lib/maint';
import type { CsvValue } from '../lib/csv';
import { foldKey } from '../lib/fold';
import { num } from '../lib/format';
import { hits, searchWords } from '../lib/search';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import { saveDailyCheck } from '../lib/daily-check';
import { refreshAsset } from '../lib/refresh';
import { stockState } from '../lib/stock';
import './DataTable.css';

type SupplyReading = {
  id: number;
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

type Alert = {
  id: number;
  alertIndex: number;
  severity: number | null;
  alertGroup: number | null;
  /** 対象の消耗品の supplyIndex。特定できないときは null */
  groupIndex: number | null;
  code: number | null;
  description: string | null;
};

/**
 * 台帳に紐づけた品番と、その台の拠点の在庫（API の `linkedToners`）。
 * 無効にした品番と、他の画面に出さない品番（hidden）は API が外して返す
 */
type LinkedToner = {
  id: string;
  name: string | null;
  /** トナー登録の色欄そのまま（「ブラック」「4色パック」など） */
  color: string | null;
  /** 色欄を black / cyan / magenta / yellow に畳んだもの。色欄が空なら空配列 */
  colors: string[];
  part: 'TONER' | 'DRUM' | 'WASTE' | 'MAINTENANCE' | 'OTHER';
  recycled: boolean;
  /** 在庫がこの本数以下なら少ない。null は 0 本のときだけ知らせる */
  alertThreshold: number | null;
  /** この台が置いてある拠点の在庫。他の拠点の分は足していない */
  stock: number;
  /**
   * この拠点の未入荷の注文の本数。搬入で本数が合えば入荷済みに変わる
   * （トナー入出状況の「一致」）ので、残っているのはまだ届いていない分
   */
  onOrder: number;
};

/** 品番・在庫の欄で、トナー・インク以外に添える短い呼び名 */
const PART_SHORT: Record<Exclude<LinkedToner['part'], 'TONER'>, string> = {
  DRUM: 'ドラム',
  WASTE: '廃トナー',
  MAINTENANCE: 'メンテ',
  OTHER: '部品',
};

/** prtMarkerSuppliesType の呼び名 */
const SUPPLY_TYPE_NAME: Record<number, string> = {
  1: 'その他',
  3: 'トナー',
  4: '廃トナー',
  5: 'インク',
  6: 'インクカートリッジ',
  7: 'リボン',
  9: 'ドラム',
  10: '現像剤',
  13: 'ワックスリボン',
  15: '定着',
  18: 'クリーナー',
  20: '転写',
  21: 'トナーカートリッジ',
};

/**
 * 印刷に使う消耗品。今回の色付けの対象から外す。
 *
 * リボン（7・13）はラベルプリンターの消耗品で、トナーと同じ扱いにする。
 * **API 側の printers/supply-types.ts と同じ内容にすること。**
 * 別のバンドルなので import できず、写しになっている
 */
const CONSUMABLE_TYPES = [3, 5, 6, 7, 13, 21];

/** 色の並び順。機種によって返る順がばらつくので、表示は必ずこの順に揃える */
const COLOR_ORDER = ['black', 'cyan', 'magenta', 'yellow'];

/** 色の頭文字。black は印刷の慣習どおり K とし、B（青）と紛れないようにする */
const COLOR_INITIAL: Record<string, string> = {
  black: 'K',
  cyan: 'C',
  magenta: 'M',
  yellow: 'Y',
};

/**
 * 名前から色を拾うための対応表。
 * Brother は色ごとにドラムを持つのに prtMarkerColorant を返さないので、
 * 名前（Black Drum Unit）だけが色の手がかりになる。
 */
const NAME_COLOR: [RegExp, string][] = [
  [/black|ブラック|黒/i, 'black'],
  [/cyan|シアン/i, 'cyan'],
  [/magenta|マゼンタ/i, 'magenta'],
  [/yellow|イエロー/i, 'yellow'],
];

/** 色の並び順の位置。色を持たないものは末尾に置く */
function colorRank(supply: SupplyReading): number {
  const index = COLOR_ORDER.indexOf(colorantOf(supply) ?? '');
  return index < 0 ? COLOR_ORDER.length : index;
}

/** その消耗品の色。機器が色を返さないときは名前から拾う */
function colorantOf(supply: SupplyReading): string | null {
  const direct = supply.colorant?.toLowerCase();
  if (direct) return direct;
  for (const [pattern, color] of NAME_COLOR) {
    if (pattern.test(supply.name)) return color;
  }
  return null;
}

/**
 * 交換部品の交換案内とみなす文面。
 *
 * RICOH はドラムや定着を消耗品の表に載せてこないので残量では拾えず、
 * prtAlertGroupIndex も意味のある行を指さない（トナーの 1 行目を返してくる）。
 * 文面で見分けるしかない。
 *
 * **トナーは対象外**なので、部品の名前が入っているものだけを拾う。
 * RICOH の「黒ﾄﾅｰ残りわずか」を交換部品として数えないため。
 * 判定の前に NFKC で正規化して、半角カナ（ﾄﾞﾗﾑﾕﾆｯﾄ）も同じ表記に揃える
 */
const PART_ALERT = /(ドラム|定着|転写|現像|クリーニング).*(交換時期|交換が必要)/;

/** 交換時期とみなす残量。0% は使い切り */
const DUE_PERCENT = 0;
/** まもなく交換とみなす残量 */
const SOON_PERCENT = 20;

/** トナー・インク以外の交換部品か。種別を返さない機種は判断しない */
function isPart(supply: SupplyReading): boolean {
  if (supply.supplyType === null) return false;
  return !CONSUMABLE_TYPES.includes(supply.supplyType);
}

/**
 * 交換部品の状態。2 つの手がかりを併用する。
 *
 * 1. 残量 — Canon のように部品の残量を数値で返す機種はこれで拾える
 * 2. 警告 — 富士ゼロックスのように残量を「あり」としか返さない機種は
 *    残量では拾えないが、機器自身が「交換が必要です」と言ってくる
 *
 * 警告がトナーの話か部品の話かは、prtAlertGroupIndex が指す消耗品の種別で見分ける。
 * 文面では見分けられない（RICOH の「黒ﾄﾅｰ残りわずか」も同じ重大度 4 で来る）。
 */
function partState(readings: SupplyReading[], alerts: Alert[]): 'due' | 'soon' | null {
  // 警告が交換部品を名指ししていれば、残量に関わらず交換時期
  const byIndex = new Map(readings.map((s) => [s.supplyIndex, s]));
  const partAlert = alerts.some((alert) => {
    // 部品が消耗品の表に無い機種は、指す先が無いので文面で見る
    if (PART_ALERT.test((alert.description ?? '').normalize('NFKC'))) return true;
    if (alert.groupIndex === null) return false;
    const supply = byIndex.get(alert.groupIndex);
    return supply !== undefined && isPart(supply);
  });
  if (partAlert) return 'due';

  const parts = readings.filter((s) => isPart(s) && s.percent !== null);
  if (parts.length === 0) return null;

  const lowest = Math.min(...parts.map((s) => s.percent as number));
  if (lowest <= DUE_PERCENT) return 'due';
  if (lowest <= SOON_PERCENT) return 'soon';
  return null;
}

/** 交換部品を残量の少ない順に並べる */
function partsOf(readings: SupplyReading[]): SupplyReading[] {
  return readings
    .filter(isPart)
    .sort((a, b) => (a.percent ?? 999) - (b.percent ?? 999));
}

/**
 * トナー・インクの残り具合。**自分で発注する機器の注文の目安にする。**
 * empty = すぐ交換（ほぼ無い・機器が「無い」と言っている）
 * low   = 注文の目安（少ない・機器が「残りわずか」と言っている）
 */
type TonerLevel = 'empty' | 'low';

/** 注文の目安とみなす残量（%）。これ以下で色を付ける */
const TONER_LOW_PERCENT = 20;
/** すぐ交換とみなす残量（%） */
const TONER_EMPTY_PERCENT = 5;

const TONER_LEVEL_LABEL: Record<TonerLevel, string> = {
  empty: 'すぐ交換',
  low: '注文の目安',
};

/** 残量の札に添える短い印 */
const TONER_LEVEL_SHORT: Record<TonerLevel, string> = {
  empty: '交換',
  low: '少',
};

/**
 * Printer-MIB の prtAlertCode のうち、トナー・インクの残りを言うもの。
 * 機器によっては番号を取り違えて送ってくる（ドラムの警告に 1111 を付ける機種がある）ので、
 * 番号が合っていても文面が部品の話なら使わない（`NOT_TONER`）
 */
const TONER_ALERT_CODE: Record<number, TonerLevel> = {
  1101: 'empty', // markerTonerEmpty
  1102: 'low', // markerTonerAlmostEmpty
  1104: 'empty', // markerInkEmpty
  1105: 'low', // markerInkAlmostEmpty
};

/**
 * 部品の警告の言葉。「廃トナー」のようにトナーの言葉を含んでいても、こちらが先。
 * 「カートリッジ」はトナーの言葉に入れない（RICOH の「ｶｰﾄﾘｯｼﾞ交換時期：部品交換時期」は
 * 部品の交換案内で、トナーの残りではない）
 */
const NOT_TONER =
  /廃|ドラム|定着|転写|現像|クリーニング|メンテナンス|waste|drum|fuser|fixing|maintenance/i;
const TONER_WORD = /トナー|インク|\btoner\b|\bink\b/i;
const EMPTY_WORD = /交換|ありません|なくなり|切れ|空|\bempty\b|\bout\b/i;
const LOW_WORD = /わずか|少な|ニアエンド|\blow\b|\bnear/i;

/**
 * 機器が出している警告から読むトナー・インクの残り。
 *
 * **Canon iR-ADV は残量を計測しておらず、入っている間は 100% を返す。**
 * 残量だけを見ると切れるまで色が付かないので、機器自身の「残りわずか」を併せて見る。
 * 番号（prtAlertCode）が標準どおりならそれで、無ければ文面で決める。
 * RICOH の「黒ﾄﾅｰ残りわずか」は半角カナなので NFKC で揃えてから見る
 */
function tonerAlertLevel(alert: Alert): TonerLevel | null {
  const text = (alert.description ?? '').normalize('NFKC');
  if (NOT_TONER.test(text)) return null;

  const byCode = alert.code === null ? undefined : TONER_ALERT_CODE[alert.code];
  if (byCode) return byCode;

  if (!TONER_WORD.test(text)) return null;
  if (EMPTY_WORD.test(text)) return 'empty';
  if (LOW_WORD.test(text)) return 'low';
  return null;
}

/** 残量（%）から読む具合。量が分からない（あり・不明）ものは決めない */
function percentLevel(supply: SupplyReading): TonerLevel | null {
  if (supply.percent === null) return null;
  if (supply.percent <= TONER_EMPTY_PERCENT) return 'empty';
  if (supply.percent <= TONER_LOW_PERCENT) return 'low';
  return null;
}

/** 2 つの具合の悪いほう */
function worse(a: TonerLevel | null, b: TonerLevel | null): TonerLevel | null {
  if (a === 'empty' || b === 'empty') return 'empty';
  if (a === 'low' || b === 'low') return 'low';
  return null;
}

/** 警告の文面が名指ししている色。書いていなければ null */
function alertColor(alert: Alert): string | null {
  const text = (alert.description ?? '').normalize('NFKC');
  for (const [pattern, color] of NAME_COLOR) {
    if (pattern.test(text)) return color;
  }
  return null;
}

/**
 * 1 本のトナー・インクの具合と、そう決めた警告の文面。
 * 警告がどの色の話かは、文面に色があれば色で、無ければ指している行（groupIndex）で見る
 */
function supplyLevel(
  supply: SupplyReading,
  alerts: Alert[],
): { level: TonerLevel | null; reasons: string[] } {
  let level = percentLevel(supply);
  const reasons: string[] = [];

  for (const alert of alerts) {
    const found = tonerAlertLevel(alert);
    if (!found) continue;
    const color = alertColor(alert);
    const targets =
      color !== null ? color === colorantOf(supply) : alert.groupIndex === supply.supplyIndex;
    if (!targets) continue;
    level = worse(level, found);
    if (alert.description) reasons.push(alert.description);
  }
  return { level, reasons };
}

/**
 * 一覧に 1 つずつ出すトナー・インク。**表示（`SupplyCell`）と判定で同じものを見る。**
 * 交換部品は隣の列で見るので外す。種別を返さない機種は色ごとの先頭だけ（`tonerRow`）
 */
const tonerSupplies = (readings: SupplyReading[]) =>
  tonerRow(readings.filter((supply) => !isPart(supply))).shown;

/**
 * その機器のトナー・インクのいちばん悪い具合。
 * 色まで決められない警告（色を書かず、指す行も合わない）も機器としては拾う
 */
function tonerLevel(readings: SupplyReading[], alerts: Alert[]): TonerLevel | null {
  return [
    ...tonerSupplies(readings).map(percentLevel),
    ...alerts.map(tonerAlertLevel),
  ].reduce<TonerLevel | null>(worse, null);
}

/** 行（台帳）のトナー・インクの具合。実機の情報が無ければ決めない */
const rowTonerLevel = (row: Row) =>
  row.printer ? tonerLevel(row.printer.readings, row.printer.alerts) : null;

/** 色の分からないもの。どの品番の話か決められないので、トナー・インクを全部候補にする */
const ANY_COLOR = 'any';

/** K C M Y のどれかに畳む。RICOH の 'other' のような値は色が分からない扱い */
const knownColor = (color: string | null) =>
  color !== null && COLOR_ORDER.includes(color) ? color : ANY_COLOR;

/**
 * 残りの少ない色。品番・在庫の欄で「どれを頼むか」に印を付けるために使う。
 *
 * 残量の札（`supplyLevel`）で少ないものの色に加えて、機器の警告の色も拾う。
 * Canon は 100% のまま警告だけを出すので、札には色が付かなくても警告から決まる。
 * 色を名指ししない警告は、指している行の色、それも無ければ「色が分からない」
 */
function lowColors(readings: SupplyReading[], alerts: Alert[]): Set<string> {
  const colors = new Set<string>();

  for (const supply of tonerSupplies(readings)) {
    if (supplyLevel(supply, alerts).level) colors.add(knownColor(colorantOf(supply)));
  }

  const byIndex = new Map(readings.map((supply) => [supply.supplyIndex, supply]));
  for (const alert of alerts) {
    if (!tonerAlertLevel(alert)) continue;
    const target = alert.groupIndex === null ? undefined : byIndex.get(alert.groupIndex);
    colors.add(knownColor(alertColor(alert) ?? (target ? colorantOf(target) : null)));
  }
  return colors;
}

/**
 * その品番が、残りの少ない色に使うものか。**トナー・インクだけが対象。**
 * 色の分からない品番（色欄が空）と、色の分からない「少ない」は、外すより候補に残す
 * （印が付かないと、頼むべき品番を見落とす）
 */
function isNeeded(toner: LinkedToner, low: Set<string>): boolean {
  if (low.size === 0 || toner.part !== 'TONER') return false;
  if (low.has(ANY_COLOR) || toner.colors.length === 0) return true;
  return toner.colors.some((color) => low.has(color));
}

/**
 * **注文が要る台。** 頼む品番がどれも、この拠点に在庫 0 本で、注文中も無い。
 * 在庫 0 でも注文中なら、届くのを待てばよいので数えない（二重に頼まないため）。
 * 頼む品番が紐づいていない台は「分からない」なので数えない（欄に「品番が未登録」と出す）
 */
function needsOrder(row: Row): boolean {
  if (!row.printer) return false;
  const low = lowColors(row.printer.readings, row.printer.alerts);
  const needed = row.toners.filter((toner) => isNeeded(toner, low));
  return (
    needed.length > 0 &&
    needed.every((toner) => toner.stock <= 0 && toner.onOrder <= 0)
  );
}

/** 台帳に実機と印刷枚数をぶら下げた 1 行。取れないものは null */
type Row = {
  id: number;
  /** 持っている拠点。全拠点まとめて出すので、どこの機器かが分かるよう列に出す */
  company: { id: number; name: string } | null;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
  serialNumber: string | null;
  /** 保守の有無の手入力。保守終了日が無いときだけ判定に使う */
  maintContract: string | null;
  /** 保守の期間。端末情報の画面で入力したもの */
  maintStartOn: string | null;
  maintEndOn: string | null;
  /** 保守金額（円）。修理費用と並べて契約の損得を見る */
  maintFee: number | null;
  /**
   * 毎日チェックする機器か（トナー・インクを自分で発注する機器）。
   * 付いている台は一覧の上の「毎日チェック」の表にも並ぶ
   */
  dailyCheck: boolean;
  /** 紐づけた品番と、この台の拠点の在庫。毎日チェックの「品番・在庫」に出す */
  toners: LinkedToner[];
  /**
   * 実際に頼む先。台帳で指定していればそれ、無ければメーカーの既定。
   * 保守が「有」の行にだけ出す（切れている機器の連絡先を出しても掛け直せない）
   */
  effectiveVendor: {
    id: number;
    name: string;
    phones: string[];
    source: 'asset' | 'maker';
  } | null;
  /** 修理履歴の集計。回数は復旧日が保守期間に入っているものだけ */
  repairs: {
    /** 保守期間が入力されているか。無い台帳は回数を出さずハイフンにする */
    hasMaint: boolean;
    inHouse: number;
    vendor: number;
    /** 保守期間内に復旧した履歴の費用合計（円） */
    cost: number;
    /** そのうち費用が入力されている件数。0 なら合計は「未入力」の意味 */
    costKnown: number;
    /** 完了していない履歴の件数。期間に関わらず数える */
    open: number;
    total: number;
  };
  printer: {
    id: number;
    ipAddress: string;
    hostName: string | null;
    model: string | null;
    serialNumber: string | null;
    macAddress: string | null;
    pageCount: number | null;
    reachable: boolean;
    lastError: string | null;
    /** 最後に問い合わせた時刻。失敗しても進む */
    lastPolledAt: string | null;
    /** 表示している情報がいつのものか */
    lastSuccessAt: string | null;
    /** 操作パネルの表示文字 */
    consoleText: string | null;
    /** 読み方。SATO_ENQ は自動では更新されず、画面から押したときだけ読む */
    protocol: 'SNMP' | 'SATO_ENQ';
    readings: SupplyReading[];
    alerts: Alert[];
  } | null;
  latest: {
    date: string | null;
    pages: number | null;
    monoPages: number | null;
    colorPages: number | null;
    total: number;
    totalMono: number | null;
    totalColor: number | null;
  } | null;
};

type SortKey =
  | 'company'
  | 'department'
  | 'no'
  | 'ipAddress'
  | 'maker'
  | 'model'
  | 'serialNumber'
  | 'maintStatus'
  | 'maintStartOn'
  | 'maintEndOn'
  | 'maintLeft'
  | 'maintFee'
  | 'maintVendor'
  | 'maintPhones'
  | 'repairOpen'
  | 'repairInHouse'
  | 'repairVendor'
  | 'repairCost'
  | 'state'
  | 'liveModel'
  | 'pageCount'
  | 'pages'
  | 'monoPages'
  | 'colorPages'
  | 'lastSuccessAt'
  | 'partLevel';

const COLUMNS: {
  key: SortKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
  group: '台帳' | '修理' | '機器' | '枚数';
}[] = [
  { key: 'company', label: '拠点', kind: 'text', group: '台帳' },
  { key: 'department', label: '部署', kind: 'text', group: '台帳' },
  { key: 'no', label: 'No.', kind: 'text', group: '台帳' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip', group: '台帳' },
  { key: 'maker', label: 'メーカー', kind: 'text', group: '台帳' },
  { key: 'model', label: '型番', kind: 'text', group: '台帳' },
  { key: 'serialNumber', label: 'シリアル', kind: 'text', group: '台帳' },
  { key: 'maintStatus', label: '保守', kind: 'text', group: '台帳' },
  { key: 'maintStartOn', label: '保守開始', kind: 'date', group: '台帳' },
  { key: 'maintEndOn', label: '保守終了', kind: 'date', group: '台帳' },
  { key: 'maintLeft', label: '残り', kind: 'number', numeric: true, group: '台帳' },
  { key: 'maintFee', label: '保守金額', kind: 'number', numeric: true, group: '台帳' },
  { key: 'maintVendor', label: '保守企業', kind: 'text', group: '台帳' },
  { key: 'maintPhones', label: '電話番号', kind: 'text', group: '台帳' },
  { key: 'repairOpen', label: '修理', kind: 'text', group: '修理' },
  {
    key: 'repairInHouse',
    label: '保守内・自分で対応',
    kind: 'number',
    numeric: true,
    group: '修理',
  },
  {
    key: 'repairVendor',
    label: '保守内・業者',
    kind: 'number',
    numeric: true,
    group: '修理',
  },
  {
    key: 'repairCost',
    label: '保守内・費用',
    kind: 'number',
    numeric: true,
    group: '修理',
  },
  { key: 'state', label: '状態', kind: 'text', group: '機器' },
  { key: 'liveModel', label: '機種（実機）', kind: 'text', group: '機器' },
  { key: 'pageCount', label: '累計印刷', kind: 'number', numeric: true, group: '機器' },
  { key: 'lastSuccessAt', label: '取得できた時刻', kind: 'date', group: '機器' },
  {
    key: 'partLevel',
    label: '交換部品の最低残量',
    kind: 'number',
    numeric: true,
    group: '機器',
  },
  { key: 'pages', label: '直近 1 日', kind: 'number', numeric: true, group: '枚数' },
  { key: 'monoPages', label: 'モノクロ', kind: 'number', numeric: true, group: '枚数' },
  { key: 'colorPages', label: 'カラー', kind: 'number', numeric: true, group: '枚数' },
];

const COLORANT_HEX: Record<string, string> = {
  black: '#2b3440',
  cyan: '#20a6c9',
  magenta: '#c9407f',
  yellow: '#e0b420',
};

/** まとまり見出しの列数。列を足しても見出しがずれないように数える */
const span = (group: (typeof COLUMNS)[number]['group']) =>
  COLUMNS.filter((c) => c.group === group).length;

/** 取れていない値は空欄にする。0 と区別したいので null だけを空にする */
const show = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : num.format(value);

/**
 * 毎日チェックの表に出す取得時刻。年と秒を落として「10/6 12:30」にする。
 * **今日の値でなければ色を変える** —— 定期の取り直しは 12:30 なので、朝に見ると
 * 前の日の残量が並んでいる。それと知らずに「まだある」と読まないため
 */
function shortWhen(iso: string | null | undefined) {
  if (!iso) return <span className="dt-muted">—</span>;
  const at = new Date(iso);
  const today = at.toDateString() === new Date().toDateString();
  return (
    <span
      className={today ? undefined : 'dt-daily-stale'}
      title={
        at.toLocaleString('ja-JP') +
        (today ? '' : '\n今日はまだ取得していません。「取得し直す」で今の残量になります')
      }
    >
      {at.toLocaleString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  );
}

/**
 * 一覧に出す消耗品を絞る。
 * 種別を返さない機種はトナーとドラムを分けられず、どちらも同じ色を名乗るので、
 * そのまま並べると「K 100%」と「K 0%」が混ざって読めない。
 * 色ごとに最初の 1 件＝トナーだけ残し、残りは件数で示す。
 */
function tonerRow(readings: SupplyReading[]) {
  const seen = new Set<string>();
  const shown: SupplyReading[] = [];
  const rest: SupplyReading[] = [];

  for (const supply of readings) {
    const key = supply.colorant?.toLowerCase() ?? '';
    if (key && !seen.has(key)) {
      seen.add(key);
      shown.push(supply);
    } else {
      rest.push(supply);
    }
  }

  if (shown.length === 0 && rest.length > 0) {
    return { shown: rest.slice(0, 1), rest: rest.slice(1) };
  }
  return { shown, rest };
}

function shortName(supply: SupplyReading): string {
  const color = colorantOf(supply);
  if (color) return COLOR_INITIAL[color] ?? color.slice(0, 1).toUpperCase();
  return supply.name.slice(0, 4);
}

function levelText(supply: SupplyReading): string {
  if (supply.percent !== null) return `${supply.percent}%`;
  return supply.level === -3 ? 'あり' : '不明';
}

/** 残量が数値で取れなかった項目か（不明・あり） */
const isUnknownLevel = (supply: SupplyReading) => supply.percent === null;

/**
 * 残量に付ける色。
 * 数値で取れなかった項目は、残量の値ではないと分かるよう控えめに出す。
 * 消してしまうと、その部品が無いのか読めていないのかが付かない
 */
function levelClass(supply: SupplyReading): string | undefined {
  if (supply.percent === null) return 'dt-muted';
  if (supply.percent <= DUE_PERCENT) return 'dt-low';
  if (supply.percent <= SOON_PERCENT) return 'dt-soon';
  return undefined;
}

/**
 * 残量の説明。**取れなかった項目にも他と同じ形で出す。**
 * 「不明」は機器が残量を返さないという意味で、部品が無いわけではない
 */
function levelTitle(supply: SupplyReading): string {
  const text = `${supply.name}: ${levelText(supply)}`;
  return isUnknownLevel(supply) && supply.level !== -3
    ? `${text}\nこの機器はこの項目の残量を返していません（部品が無いという意味ではありません）`
    : text;
}

function SupplyCell({
  readings,
  alerts,
}: {
  readings: SupplyReading[];
  /** 機器の警告。残量を返さない機種（Canon は 100% のまま）の「残りわずか」をここから拾う */
  alerts: Alert[];
}) {
  // 交換部品は隣の列にまとめて出すので、ここではトナー・インクだけを見る。
  // 種別を返さない機種は分けられないため、そのときだけ全件が対象になる
  const { shown, rest } = tonerRow(readings.filter((supply) => !isPart(supply)));

  // 機器が返す順は機種ごとにばらつく（富士ゼロックスは K Y M C）。
  // 台を並べて見比べられるよう、交換部品と同じ K C M Y の順に揃える。
  // 絞り込みの後に並べるのは、色が重なったとき先頭＝トナーを残すため
  const ordered = [...shown].sort((a, b) => colorRank(a) - colorRank(b));

  return (
    <span className="dt-supplies">
      {ordered.map((supply) => {
        // 少ないものは札ごと色を付ける。注文するかどうかをここで決めるので、文字の色だけでは弱い
        const { level, reasons } = supplyLevel(supply, alerts);
        const title = [
          levelTitle(supply),
          level
            ? `${TONER_LEVEL_LABEL[level]}（残り ${
                level === 'empty' ? TONER_EMPTY_PERCENT : TONER_LOW_PERCENT
              }% 以下、または機器の警告）`
            : null,
          ...reasons.map((reason) => `機器の警告: ${reason}`),
        ]
          .filter(Boolean)
          .join('\n');

        return (
          <span
            className={level ? `dt-supply dt-supply-${level}` : 'dt-supply'}
            key={supply.id}
            title={title}
          >
            <span
              className="dt-dot"
              style={{
                background: COLORANT_HEX[supply.colorant?.toLowerCase() ?? ''] ?? '#c3ccd4',
              }}
              aria-hidden
            />
            {shortName(supply)}
            {/* 取れなかった項目は交換部品の欄と同じ扱いにする（値ではないので控えめに） */}
            <span className={isUnknownLevel(supply) ? 'dt-muted' : undefined}>
              {levelText(supply)}
            </span>
            {/*
              * 色が見分けにくい人にも分かるよう、少ないものには文字でも添える。
              * 4 色並ぶカラー機で札が伸びないよう短くする（詳しくは title）
              */}
            {level && <span className="dt-supply-flag">{TONER_LEVEL_SHORT[level]}</span>}
          </span>
        );
      })}

      {rest.length > 0 && (
        <span className="dt-supply" title={rest.map(levelTitle).join('\n')}>
          他 {rest.length} 件
        </span>
      )}
    </span>
  );
}

/** 同じ種別の部品をひとまとめにしたもの */
type PartGroup = {
  type: number;
  label: string;
  items: SupplyReading[];
};

/**
 * 交換部品の並び。**残量ではなく種別で固定する。**
 *
 * 残量の少ない順に並べていたため、同じ機種でも機器ごとに列の並びが変わり、
 * 台を並べて見比べられなかった（iR-ADV C3520F と C3530F で 8 台 5 通り）。
 * さらに残量を返さない部品は最後に回っていたので、**その部品だけ「不明」で
 * 返す機器では並びが 1 つずれる**。どの機器でも同じ位置に同じ種別が出るように、
 * 残量に関わらずこの順で出す。少ない部品は文字の色と行の色で分かる。
 * ここに無い種別は末尾へ、その中では種別の番号順に置く
 */
const PART_TYPE_ORDER = [9, 15, 20, 10, 18, 4, 1];

const partRank = (type: number) => {
  const index = PART_TYPE_ORDER.indexOf(type);
  return index < 0 ? PART_TYPE_ORDER.length : index;
};

/**
 * 交換部品を種別ごとにまとめる。
 * カラー機はドラムを色ごとに 1 本ずつ持つので、平らに並べると
 * 「ドラム」が 4 つ散らばってどれがどの色か分からない。種別で 1 行にする。
 */
function groupParts(readings: SupplyReading[]): PartGroup[] {
  const groups = new Map<number, PartGroup>();

  for (const part of partsOf(readings)) {
    const type = part.supplyType ?? 1;
    const group = groups.get(type) ?? {
      type,
      label: SUPPLY_TYPE_NAME[type] ?? '部品',
      items: [],
    };
    group.items.push(part);
    groups.set(type, group);
  }

  for (const group of groups.values()) {
    group.items.sort((a, b) => colorRank(a) - colorRank(b) || a.supplyIndex - b.supplyIndex);
  }

  return [...groups.values()].sort(
    (a, b) => partRank(a.type) - partRank(b.type) || a.type - b.type,
  );
}

/**
 * 種別の中身。色ごとに分かれている部品は色別に出し、
 * 色を持たず値も同じ並び（トレイごとの搬送キットなど）は件数にまとめる。
 */
function partChips(group: PartGroup) {
  const hasColor = group.items.some((item) => colorantOf(item) !== null);
  const levels = new Set(group.items.map(levelText));

  if (!hasColor && group.items.length > 1 && levels.size === 1) {
    const head = group.items[0];
    return (
      <span className="dt-supply" title={group.items.map((item) => item.name).join('\n')}>
        <span className={levelClass(head)}>{levelText(head)}</span>
        <span className="dt-muted">×{group.items.length}</span>
      </span>
    );
  }

  return group.items.map((item) => {
    /*
     * 1 本しかない部品には色を出さない。種別の見出しだけで足り、
     * RICOH は廃トナー 1 本に意味のない色（other や black）を付けてくるため
     */
    const color = group.items.length > 1 ? colorantOf(item) : null;

    return (
      <span className="dt-supply" key={item.id} title={levelTitle(item)}>
        {color && (
          <span
            className="dt-dot"
            style={{ background: COLORANT_HEX[color] ?? '#c3ccd4' }}
            aria-hidden
          />
        )}
        {/* 色で見分けられない並びは名前で。1 本だけなら見出しで足りる */}
        {color ? shortName(item) : group.items.length > 1 ? item.name.slice(0, 8) : null}
        <span className={levelClass(item)}>{levelText(item)}</span>
      </span>
    );
  });
}

/** トナー・インク以外の交換部品。種別ごとに 1 行、残量の少ない順に出す */
function PartCell({ readings }: { readings: SupplyReading[] }) {
  const groups = groupParts(readings);
  if (groups.length === 0) return <span className="dt-muted">—</span>;

  return (
    <span className="dt-parts">
      {groups.map((group) => (
        <span className="dt-part" key={group.type}>
          <span className="dt-part-label">{group.label}</span>
          <span className="dt-supplies">{partChips(group)}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * 機器が出している警告。
 * 重大度 1 は「省ｴﾈﾓｰﾄﾞ待機中」など単なる状態なので控えめに出す。
 */
function AlertCell({
  alerts,
  consoleText,
}: {
  alerts: Alert[];
  consoleText: string | null;
}) {
  if (alerts.length === 0) {
    return consoleText ? <span className="dt-muted">{consoleText}</span> : <span />;
  }

  return (
    <span className="dt-supplies">
      {alerts.map((alert) => (
        <span
          className={
            (alert.severity ?? 0) >= 3 ? 'dt-supply dt-supply-warn' : 'dt-supply dt-muted'
          }
          key={alert.id}
          title={`重大度 ${alert.severity ?? '不明'}`}
        >
          {alert.description}
        </span>
      ))}
    </span>
  );
}

/**
 * 毎日チェックの「品番・在庫」。紐づけた品番を並べ、**この台の拠点の在庫**を添える。
 *
 * 残りの少ない色に使う品番には印を付けて、横の残量の札と目で結べるようにする。
 * 在庫の色はトナー個数状況と同じ（0 本は赤、警告本数以下はオレンジ）。
 * 「少ない色の品番が在庫 0」なら注文が要る、在庫があれば替えればよい、と読める
 */
function StockCell({
  toners,
  low,
  site,
}: {
  toners: LinkedToner[];
  /** 残りの少ない色（`lowColors`） */
  low: Set<string>;
  /** 在庫を数えている拠点の名前。説明に出す */
  site: string;
}) {
  if (toners.length === 0) {
    return (
      <span
        className={low.size > 0 ? 'dt-stock-none dt-stock-none-need' : 'dt-stock-none'}
        title="トナー登録でこの台に品番を紐づけると、ここに品番と在庫が出ます"
      >
        品番が未登録
      </span>
    );
  }

  return (
    <span className="dt-stocks">
      {toners.map((toner) => {
        const need = isNeeded(toner, low);
        const state = stockState(toner);
        const dot = toner.colors.length === 1 ? COLORANT_HEX[toner.colors[0]] : undefined;
        const ordered = toner.onOrder > 0;
        const title = [
          `${toner.name ?? toner.id}${toner.recycled ? '（リサイクル品）' : ''}`,
          `${site}の在庫 ${toner.stock} 本` +
            (toner.alertThreshold !== null ? `（${toner.alertThreshold} 本以下で警告）` : ''),
          ordered ? `注文中 ${toner.onOrder} 本（まだ入荷していない注文）` : null,
          need
            ? toner.stock <= 0 && !ordered
              ? '残りの少ない色に使う品番です。在庫も注文中も無いので、注文が要ります'
              : '残りの少ない色に使う品番です'
            : null,
        ]
          .filter(Boolean)
          .join('\n');

        return (
          <span
            key={toner.id}
            className={[
              'dt-stock',
              need ? 'dt-stock-need' : '',
              state ? `dt-stock-${state}` : '',
              // 在庫 0 でも注文中なら、赤（要注文）にしない
              ordered ? 'dt-stock-ordered' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={title}
          >
            {dot && <span className="dt-dot" style={{ background: dot }} aria-hidden />}
            {toner.part !== 'TONER' && (
              <span className="dt-stock-part">{PART_SHORT[toner.part]}</span>
            )}
            <span className="dt-mono">{toner.id}</span>
            <span className="dt-stock-qty">在庫 {toner.stock}</span>
            {ordered && <span className="dt-stock-onorder">注文中 {toner.onOrder}</span>}
          </span>
        );
      })}
    </span>
  );
}

/**
 * 一覧に出す保守業者。**保守が「有」の行にだけ出す。**
 * 切れている契約の連絡先を並べても掛ける先が違うため
 */
const maintVendorOf = (row: Row) =>
  maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract) === '有'
    ? row.effectiveVendor
    : null;

/** 完了していない修理があるか。状態が空のものも「完了していない」とみなす */
const underRepair = (row: Row) => row.repairs.open > 0;

/**
 * SATO のラベルプリンターか。
 * この機種だけ SNMP を持たず、ENQ でしか状態を読めないので分けて扱う
 */
const isSato = (row: Row) => foldKey(row.maker ?? '') === 'sato';

/**
 * SNMP を持たず、**個別にしか読めない**機種の型番。
 *
 * レスプリは公式マニュアルに SNMP の記載が無く、実機も応答しない。
 * 一括取得（SNMP）に混ぜても待ち時間が伸びるだけなので対象から外し、
 * 行ごとの「状態を読む」（ENQ）だけで読む。
 * 台帳にあるのは R408v-exSTD だが、レスプリはシリーズごと SNMP を持たないので
 * シリーズ名で見る。同じ SATO でも HC4-LX は SNMP で応答するため対象外。
 *
 * 突き合わせる前に `foldKey` で畳むので、`ＬＥＳＰＲＩＴ`（全角）や
 * `ﾚｽﾌﾟﾘ`（半角カナ）で登録されていても拾える
 */
const ENQ_ONLY_MODEL = /レスプリ|l'?esprit/;

/** 一括取得から外したことを知らせるときの呼び名 */
const ENQ_ONLY_LABEL = 'レスプリ';

const isEnqOnly = (row: Row) => ENQ_ONLY_MODEL.test(foldKey(row.model ?? ''));

/**
 * 状態を ENQ で読む行か。
 *
 * すでに読んで保存してある行は実機側の protocol で分かる。
 * まだ一度も読んでいない行は実機が無いので、台帳のメーカーで見る
 */
const isEnqRow = (row: Row) =>
  row.printer?.protocol === 'SATO_ENQ' ||
  (row.printer === null && isSato(row) && row.ipAddress !== null);

/**
 * 行ごとの「取得」（SNMP）を投げてよい行か。**一括取得と同じ条件にする。**
 * 押せる行と一括で当たる行が食い違うと、どちらで取れるのか分からなくなる。
 *
 * SNMP を持たない機種（レスプリ）と、ENQ で読むと分かっている機器は外す。
 * 投げても待ち時間が伸びるだけで何も取れない。あちらは「状態」の欄から読む
 */
const canPoll = (row: Row) =>
  row.ipAddress !== null &&
  !isEnqOnly(row) &&
  row.printer?.protocol !== 'SATO_ENQ';

/** ENQ で読んだ状態。画面に出すだけで保存しない */
type SatoStatus = {
  code: string;
  label: string;
  kind: 'ok' | 'warn' | 'error';
  nearEnd: boolean;
  remaining: number;
};

type SatoCell = { busy: boolean; status?: SatoStatus; error?: string };

/** 並べ替えの鍵。台帳と実機で入れ子が違うので、ここで平らにする */
function pick(row: Row, key: SortKey): unknown {
  switch (key) {
    case 'repairOpen':
      // 修理中を先頭に集めたいので、件数ではなく有無で並べる
      return underRepair(row) ? '1修理中' : '2—';
    case 'repairInHouse':
      // 保守期間が無い台帳は 0 回ではなく「出せない」ので末尾に置く
      return row.repairs.hasMaint ? row.repairs.inHouse : null;
    case 'repairVendor':
      return row.repairs.hasMaint ? row.repairs.vendor : null;
    case 'repairCost':
      // 費用が 1 件も入っていない機器は 0 円ではないので末尾に置く
      return row.repairs.costKnown > 0 ? row.repairs.cost : null;
    case 'maintLeft':
      // 残りの少ない順に並べたいので日数で。終了日が無い行は末尾
      return maintDaysLeft(row.maintEndOn);
    case 'maintVendor':
      return maintVendorOf(row)?.name ?? null;
    case 'maintPhones':
      return maintVendorOf(row)?.phones[0] ?? null;
    case 'maintStatus':
      // 保存された値ではなく、保守開始日・終了日から出した判定で並べる
      return maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract);
    case 'state': {
      // 実機が無い行は末尾に置きたいので null のままにする
      if (row.printer === null) return null;
      return row.printer.reachable ? '1応答あり' : '2応答なし';
    }
    case 'liveModel':
      return row.printer?.model ?? null;
    case 'pageCount':
      return row.printer?.pageCount ?? null;
    case 'lastSuccessAt':
      return row.printer?.lastSuccessAt ?? null;
    case 'partLevel': {
      if (!row.printer) return null;
      const parts = partsOf(row.printer.readings).filter((s) => s.percent !== null);
      return parts.length > 0 ? (parts[0].percent as number) : null;
    }
    case 'pages':
      return row.latest?.pages ?? null;
    case 'monoPages':
      return row.latest?.monoPages ?? null;
    case 'colorPages':
      return row.latest?.colorPages ?? null;
    default:
      return row[key];
  }
}

/** 交換部品のうち、残量を数値で返しているもののいちばん低い値 */
function lowestPartPercent(row: Row): number | null {
  if (!row.printer) return null;
  const parts = partsOf(row.printer.readings).filter((s) => s.percent !== null);
  return parts.length > 0 ? (parts[0].percent as number) : null;
}

/** 消耗品を 1 つのセルに収める。「名前: 残量」を並べる */
const suppliesText = (readings: SupplyReading[]) =>
  readings.map((supply) => `${supply.name}: ${levelText(supply)}`).join(' / ');

/**
 * CSV に出す列。**画面の COLUMNS とは別に持つ。**
 *
 * 表では色や印で示しているもの（修理中の帯、残りの色、消耗品の点）は、
 * ファイルにすると何も残らない。文字にして出す。
 * 「残り」は「あと 3 か月」ではなく日数にする（Excel で並べ替えられるように）
 */
const CSV_COLUMNS: { label: string; value: (row: Row) => CsvValue }[] = [
  { label: '拠点', value: (row) => row.company?.name ?? null },
  { label: '部署', value: (row) => row.department },
  { label: 'No.', value: (row) => row.no },
  // 表では ★ で出しているので、ファイルでは ○ にする
  { label: '毎日チェック', value: (row) => (row.dailyCheck ? '○' : null) },
  { label: 'IP アドレス', value: (row) => row.ipAddress },
  { label: 'メーカー', value: (row) => row.maker },
  { label: '型番', value: (row) => row.model },
  { label: 'シリアル', value: (row) => row.serialNumber },
  {
    label: '保守',
    value: (row) => maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract),
  },
  { label: '保守開始', value: (row) => row.maintStartOn },
  { label: '保守終了', value: (row) => row.maintEndOn },
  { label: '残り日数', value: (row) => maintDaysLeft(row.maintEndOn) },
  { label: '保守金額', value: (row) => row.maintFee },
  { label: '保守企業', value: (row) => maintVendorOf(row)?.name ?? null },
  {
    label: '電話番号',
    value: (row) => maintVendorOf(row)?.phones.join(' / ') ?? null,
  },
  { label: '修理', value: (row) => (underRepair(row) ? '修理中' : '') },
  { label: '未完了の修理', value: (row) => row.repairs.open },
  // 保守期間が入っていない台帳は 0 回ではなく「出せない」ので空欄にする
  {
    label: '保守内・自分で対応',
    value: (row) => (row.repairs.hasMaint ? row.repairs.inHouse : null),
  },
  {
    label: '保守内・業者',
    value: (row) => (row.repairs.hasMaint ? row.repairs.vendor : null),
  },
  // 費用が 1 件も入っていなければ 0 円ではないので空欄にする
  {
    label: '保守内・費用',
    value: (row) =>
      row.repairs.hasMaint && row.repairs.costKnown > 0 ? row.repairs.cost : null,
  },
  {
    label: '状態',
    value: (row) =>
      row.printer === null ? '' : row.printer.reachable ? '応答あり' : '応答なし',
  },
  { label: '機種（実機）', value: (row) => row.printer?.model ?? null },
  { label: '累計印刷', value: (row) => row.printer?.pageCount ?? null },
  {
    label: '取得できた時刻',
    value: (row) =>
      row.printer?.lastSuccessAt
        ? new Date(row.printer.lastSuccessAt).toLocaleString('ja-JP')
        : null,
  },
  { label: '交換部品の最低残量', value: lowestPartPercent },
  { label: '直近 1 日', value: (row) => row.latest?.pages ?? null },
  { label: 'モノクロ', value: (row) => row.latest?.monoPages ?? null },
  { label: 'カラー', value: (row) => row.latest?.colorPages ?? null },
  // 表では札の色で示している。少なくなければ空欄
  {
    label: 'トナー・インクの残り',
    value: (row) => {
      const level = rowTonerLevel(row);
      return level ? TONER_LEVEL_LABEL[level] : null;
    },
  },
  {
    label: 'トナー・インク',
    value: (row) =>
      row.printer ? suppliesText(row.printer.readings.filter((s) => !isPart(s))) : '',
  },
  // 在庫はその台の拠点の本数。表では色で示している「少ない色の品番」は印（*）にする
  {
    label: '品番・在庫（その拠点）',
    value: (row) => {
      if (row.toners.length === 0) return null;
      const low = row.printer
        ? lowColors(row.printer.readings, row.printer.alerts)
        : new Set<string>();
      return row.toners
        .map(
          (toner) =>
            `${isNeeded(toner, low) ? '*' : ''}${toner.id} 在庫 ${toner.stock}` +
            (toner.onOrder > 0 ? ` 注文中 ${toner.onOrder}` : ''),
        )
        .join(' / ');
    },
  },
  // 少ない色の品番に在庫も注文中も無い台。表では見出しの札と赤い枠で示している
  {
    label: '要注文',
    value: (row) => (needsOrder(row) ? '○' : null),
  },
  {
    label: '交換部品',
    value: (row) => (row.printer ? suppliesText(partsOf(row.printer.readings)) : ''),
  },
  {
    label: '警告',
    value: (row) => {
      if (!row.printer) return '';
      const alerts = row.printer.alerts
        .map((alert) => alert.description)
        .filter(Boolean);
      // 警告が無いときは操作パネルの表示を出す。画面の「警告」の欄と同じ
      return alerts.length > 0 ? alerts.join(' / ') : (row.printer.consoleText ?? '');
    },
  },
];

export default function PrinterListScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  /** 台帳の IP が空で、一覧から外した台の数。黙って減らさないよう見出しに出す */
  const [noIp, setNoIp] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'department',
    dir: 'asc',
  });
  const [filter, setFilter] = useState<
    'all' | 'toner' | 'due' | 'maint' | 'live' | 'blank'
  >('all');
  /** 探す文字。**取ってある行をこの場で絞るだけで、API は叩かない** */
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** SATO の状態。台帳 ID ごとに、押して読んだ結果を持つ */
  const [sato, setSato] = useState<Record<number, SatoCell>>({});
  /**
   * 行ごとの取得中。**画面全体の busy とは分けている。**
   * 応答しない機器は待ち時間ぶん止まるので、その間も他の行を押せるようにする
   */
  const [fetching, setFetching] = useState<Record<number, boolean>>({});

  /*
   * **台帳の IP が空の台は出さない**（両方の表とも）。問い合わせる先が無く、
   * 機器の状態がいつまでも空欄のまま並ぶだけなので。
   * 落とすのは画面側で、API（overview）は全台を返す ——印刷状況の
   * 「集計表用にコピー」が同じ口を全台・No. の順で読むため
   */
  const load = useCallback(async () => {
    try {
      const all = await request<Row[]>('/printer-assets/overview');
      const addressed = all.filter((row) => row.ipAddress !== null);
      setRows(addressed);
      setNoIp(all.length - addressed.length);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * 別の画面で修理履歴や台帳を直しても、この一覧は開いたときの内容のまま。
   * 窓に戻ってきたときと、隠れていたタブが表に出たときに読み直す。
   * 開きっぱなしの表を見て「直したのに反映されない」となるのを防ぐ
   */
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') void load();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);

  /**
   * 絞り込みセレクタだけを当てた台。**「探す」の分母はここ。**
   * 全 78 台のまま出すと、セレクタで 10 台に絞ってから探したときに
   * 「9 / 78 台」と出て、セレクタが落とした 68 台まで探した結果に見える
   */
  const base = useMemo(
    () =>
      rows.filter((row) => {
        // 毎日チェックの印が無い台も含めて、残りの少ない台を探すため
        if (filter === 'toner') return rowTonerLevel(row) !== null;
        if (filter === 'due') {
          return (
            row.printer !== null && partState(row.printer.readings, row.printer.alerts) !== null
          );
        }
        if (filter === 'maint') {
          const days = maintDaysLeft(row.maintEndOn);
          return days !== null && days <= MAINT_SOON_DAYS;
        }
        if (filter === 'live') return row.printer !== null && row.printer.reachable;
        if (filter === 'blank') return row.printer === null;
        return true;
      }),
    [rows, filter],
  );

  const shown = useMemo(() => {
    const words = searchWords(query);

    /*
     * 探すのは台帳と実機の「その台を指す値」。残量や枚数は数字が並ぶだけで
     * 探しても当たらないので入れない。シリアルとホスト名は列に出ていないが、
     * 現物のラベルから引けるよう探し先には入れる
     */
    const filtered = base.filter((row) =>
      hits(
        [
          row.company?.name,
          row.department,
          row.no,
          row.ipAddress,
          row.maker,
          row.model,
          row.serialNumber,
          row.printer?.hostName,
          row.printer?.model,
          row.printer?.serialNumber,
          row.printer?.ipAddress,
          row.effectiveVendor?.name,
          // 紐づけた品番。箱の品番から「この品番を使う台」を引けるように
          ...row.toners.map((toner) => toner.id),
        ],
        words,
      ),
    );

    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(
      filtered,
      (row) => pick(row, sort.key),
      column?.kind ?? 'text',
      sort.dir,
      (row) => row.id,
    );
  }, [base, sort, query]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      live: rows.filter((r) => r.printer !== null && r.printer.reachable).length,
      blank: rows.filter((r) => r.printer === null).length,
      repairing: rows.filter(underRepair).length,
      // 期限切れも含む。どちらも「手を打つ必要がある」ものとしてまとめて出す
      maintSoon: rows.filter((r) => {
        const days = maintDaysLeft(r.maintEndOn);
        return days !== null && days <= MAINT_SOON_DAYS;
      }).length,
      maintExpired: rows.filter((r) => {
        const days = maintDaysLeft(r.maintEndOn);
        return days !== null && days < 0;
      }).length,
      due: rows.filter((r) => r.printer && partState(r.printer.readings, r.printer.alerts) === 'due').length,
      soon: rows.filter((r) => r.printer && partState(r.printer.readings, r.printer.alerts) === 'soon').length,
      toner: rows.filter((r) => rowTonerLevel(r) !== null).length,
      /*
       * 一括で問い合わせる先の数。ボタンに出すので、実際に投げる数と揃える。
       * 同じ IP の台帳が複数あるので重複を除き、ENQ でしか読めない機種は数えない
       */
      withIp: new Set(
        rows
          .filter((r) => r.ipAddress !== null && !isEnqOnly(r))
          .map((r) => r.ipAddress),
      ).size,
    }),
    [rows],
  );

  /**
   * 毎日チェックの台。**上の絞り込みと探す欄は当てない**（毎日同じ台を見るための表なので）。
   *
   * 並びは**トナー・インクの残りが少ない順**（すぐ交換 → 注文の目安 → それ以外）、
   * 同じ具合の中は部署・No. の順。注文が要る台が上に来るので、上から見ていけばよい
   */
  const daily = useMemo(() => {
    const rank = (level: TonerLevel | null) =>
      level === 'empty' ? 0 : level === 'low' ? 1 : 2;

    return rows
      .filter((row) => row.dailyCheck)
      .map((row) => ({ row, level: rowTonerLevel(row) }))
      .sort(
        (a, b) =>
          rank(a.level) - rank(b.level) ||
          (a.row.department ?? '').localeCompare(b.row.department ?? '', 'ja') ||
          (a.row.no ?? '').localeCompare(b.row.no ?? '', 'ja', { numeric: true }) ||
          a.row.id - b.row.id,
      );
  }, [rows]);

  const dailyCounts = useMemo(
    () => ({
      empty: daily.filter((item) => item.level === 'empty').length,
      low: daily.filter((item) => item.level === 'low').length,
      /** 少ない色の品番に、その拠点の在庫も注文中も無い台。注文が要る */
      needsOrder: daily.filter((item) => needsOrder(item.row)).length,
      /*
       * 残量を読めていない台。「少ないものはありません」と言い切らないために数える
       * （一度も取れていない台と、最後の問い合わせで応答しなかった台）
       */
      unread: daily.filter((item) => item.row.printer === null || !item.row.printer.reachable)
        .length,
      /**
       * まとめて取り直す先の数。ボタンに出すので、`fetchFromLedger` が実際に投げる数
       * （IP あり・ENQ でしか読めない機種を除く・IP の重複なし）と揃える
       */
      pollable: new Set(
        daily
          .filter((item) => item.row.ipAddress !== null && !isEnqOnly(item.row))
          .map((item) => item.row.ipAddress),
      ).size,
    }),
    [daily],
  );

  /**
   * ★ の付け外し。**押した時点で保存する**（他の列は送らず、台帳の更新日も動かない）。
   * 読み直さずに手元の行だけ書き換える。一覧を取り直すと SATO の読んだ結果などが
   * 入れ替わって見えるうえ、78 台ぶんの消耗品を読み直すほどのことではないため
   */
  const toggleDailyCheck = async (row: Row) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;
    const on = !row.dailyCheck;

    setError(null);
    setNotice(null);
    try {
      await saveDailyCheck(row.id, on);
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, dailyCheck: on } : item)),
      );
      setNotice(
        on
          ? `${label} を毎日チェックに入れました（上の表に並びます）`
          : `${label} を毎日チェックから外しました`,
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /**
   * 台帳の IP をまとめて問い合わせ、取れたものだけ機器として登録する。
   * 同じ IP を持つ台帳が複数あるので（No.041 と No.051）、重複は除いて 1 回にする。
   *
   * **ENQ でしか読めない機種はここに含めない**（下の ENQ_ONLY 参照）。
   * まとめて問い合わせるのは SNMP なので、持っていない機種に投げても
   * 待ち時間が伸びるだけで何も取れない。あちらは行ごとの「状態を読む」で読む。
   *
   * 毎日チェックの表の「取得し直す」も同じ入口を使い、その台だけを渡す
   * （定期の取り直しは 12:30 なので、朝に見ると前の日の残量になっている）。
   * `scope` は知らせに添える呼び名（「毎日チェック」）
   */
  const fetchFromLedger = async (source: Row[] = rows, scope = '') => {
    const addressed = source.filter(
      (row): row is Row & { ipAddress: string } => row.ipAddress !== null,
    );
    const targets = [
      ...new Set(
        addressed.filter((row) => !isEnqOnly(row)).map((row) => row.ipAddress),
      ),
    ];
    const skipped = new Set(
      addressed.filter((row) => isEnqOnly(row)).map((row) => row.ipAddress),
    );

    if (targets.length === 0) {
      setError(
        scope
          ? `${scope}の機器に、SNMP で問い合わせられる IP アドレスがありません`
          : 'IP アドレスを持つ台帳がありません',
      );
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const results = await request<{ status: string }[]>('/printers/bulk', {
        method: 'POST',
        body: JSON.stringify({
          printers: targets.map((ipAddress) => ({ ipAddress })),
          fillLocationFromLedger: true,
        }),
      });

      const ok = results.filter((r) => r.status === 'registered').length;
      setNotice(
        `${scope ? `${scope}の ` : ''}${targets.length} 件の IP に問い合わせ、${ok} 台から取得できました` +
          `（応答なし ${results.length - ok} 台）` +
          // 黙って外すと「いつまでも出てこない」と見えるので、外した数を必ず添える
          (skipped.size > 0
            ? `。${ENQ_ONLY_LABEL} ${skipped.size} 台は一括の対象外です（行の「状態を読む」から個別に読んでください）`
            : ''),
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * その行の機器を 1 台だけ問い合わせ直す。
   *
   * 端末情報の画面の「更新」と同じ入口（/printer-assets/:id/refresh）を使う。
   * 台帳の IP へ SNMP で当たり、取れた内容で実機マスタを作り直したうえで、
   * 台帳の更新日も進める（実機を見て確かめた記録になる）。
   * 台帳のシリアルが空なら、読めたシリアルがそのまま入る。
   *
   * 一括取得と違って結果を 1 行ぶん詳しく出す。1 台を狙って押すときは、
   * 何が取れたのか（機種・シリアル・消耗品の数）まで見たいため
   */
  const fetchOne = async (row: Row) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;

    setFetching((prev) => ({ ...prev, [row.id]: true }));
    setError(null);
    setNotice(null);
    try {
      const result = await refreshAsset(row.id);

      if (result.status === 'ok') {
        const printer = result.printer;
        const supplies = printer?.readings?.length ?? 0;
        setNotice(
          `${label}（${result.ipAddress}）を取得しました` +
            `${printer?.model ? ` / ${printer.model}` : ''}` +
            `${printer?.serialNumber ? ` / ${printer.serialNumber}` : ''}` +
            `${supplies > 0 ? ` / 消耗品 ${supplies} 件` : ''}` +
            `${result.serial?.status === 'filled' ? ' / シリアルを台帳に登録しました' : ''}`,
        );

        // 取得自体は成功しているので、書けなかったことは警告として別に出す
        if (result.serial?.status === 'taken') {
          const owner = `${result.serial.department ?? '部署未設定'} No.${
            result.serial.no ?? '—'
          }`;
          setError(
            `シリアル ${result.serial.serialNumber} は ${owner} が既に持っているため、` +
              `${label} には登録しませんでした。どちらの台帳の機器か確かめてください`,
          );
        }
      } else if (result.status === 'no-ip') {
        setError(`${label} は IP アドレスが未入力なので問い合わせできません`);
      } else {
        setError(
          `${label}（${result.ipAddress}）から応答がありません` +
            `${result.message ? `（${result.message}）` : ''}。` +
            '表示中の情報は前回取得できたときのものです',
        );
      }

      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFetching((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  /**
   * SATO ラベルプリンターの状態を 1 台読む。**押したときだけ動く。**
   *
   * この機種は SNMP を持たず、印刷用のポートへ ENQ を送って状態を返させる。
   * 相手は稼働中の機器なので、定期実行や一括取得には入れていない。
   * 結果は画面に出すだけで保存しない（実機マスタに載せると毎日の SNMP 巡回で
   * 「応答なし」として上書きされてしまうため）
   */
  const readSato = async (row: Row) => {
    if (!row.ipAddress) return;
    setSato((prev) => ({ ...prev, [row.id]: { busy: true } }));
    try {
      const found = await request<SatoStatus>('/printers/sato-status', {
        method: 'POST',
        body: JSON.stringify({ ipAddress: row.ipAddress }),
      });
      setSato((prev) => ({ ...prev, [row.id]: { busy: false, status: found } }));
    } catch (err) {
      setSato((prev) => ({
        ...prev,
        [row.id]: { busy: false, error: (err as Error).message },
      }));
    }
  };

  /**
   * 状態の欄（ENQ で読む機器）。
   *
   * **押した直後は手元の結果を、それ以外は保存済みの値を出す。**
   * 保存してあるので画面を開き直しても消えず、「取得できた時刻」も埋まる。
   * ただし定期実行では更新されないので、いつ読んだ値なのかが分かることが大事
   */
  const satoCell = (row: Row) => {
    if (!row.ipAddress) return '';

    const state = sato[row.id];
    if (state?.busy) return <span className="dt-muted">取得中…</span>;

    const reread = '\n押すと読み直します';

    // 押した直後の結果
    if (state?.error) {
      return (
        <button
          className="pl-sato pl-sato-ng"
          onClick={() => void readSato(row)}
          title={`${state.error}${reread}`}
          type="button"
        >
          応答なし
        </button>
      );
    }
    if (state?.status) {
      const { kind, label, code } = state.status;
      return (
        <button
          className={`pl-sato pl-sato-${kind}`}
          onClick={() => void readSato(row)}
          title={`${label}（コード ${code}）${reread}`}
          type="button"
        >
          {label}
        </button>
      );
    }

    // 保存してある、最後に読んだときの状態
    const saved = row.printer;
    if (saved) {
      const when = saved.lastPolledAt
        ? new Date(saved.lastPolledAt).toLocaleString('ja-JP')
        : null;
      return (
        <button
          className={`pl-sato ${saved.reachable ? 'pl-sato-saved' : 'pl-sato-ng'}`}
          onClick={() => void readSato(row)}
          title={
            [
              saved.reachable ? saved.consoleText : saved.lastError,
              when ? `${when} に読んだ値です` : null,
              '自動では更新されません' + reread,
            ]
              .filter(Boolean)
              .join('\n') as string
          }
          type="button"
        >
          {saved.reachable ? (saved.consoleText ?? '応答あり') : '応答なし'}
        </button>
      );
    }

    return (
      <button
        className="pl-sato"
        onClick={() => void readSato(row)}
        title="このラベルプリンターは SNMP を持たないので、押したときだけ状態を読みます"
        type="button"
      >
        状態を読む
      </button>
    );
  };

  /** 「取得」ボタンの説明。押せない行は、なぜ押せないのかを出す */
  const fetchTitle = (row: Row) => {
    if (!row.ipAddress) return 'IP アドレスが未入力なので問い合わせできません';
    if (canPoll(row)) {
      return `${row.ipAddress} に問い合わせて、この機器の情報を取り直します`;
    }
    return `${
      isEnqOnly(row) ? ENQ_ONLY_LABEL : 'この機器'
    }は SNMP を持たないので、「状態」の欄から読んでください`;
  };

  const cellOf = (row: Row, key: SortKey) => {
    switch (key) {
      // 全拠点をまとめて出す画面なので、どこの機器かを名前で示す
      case 'company':
        return row.company?.name ?? '—';
      case 'repairOpen':
        return underRepair(row) ? (
          <span
            className="dt-badge dt-badge-repair"
            title={`完了していない修理履歴が ${row.repairs.open} 件あります`}
          >
            修理中
          </span>
        ) : (
          <span className="dt-muted">—</span>
        );
      case 'maintLeft': {
        const days = maintDaysLeft(row.maintEndOn);
        if (days === null) return <span className="dt-muted">—</span>;
        return (
          <span
            className={days < 0 ? 'dt-low' : days <= MAINT_SOON_DAYS ? 'dt-soon' : undefined}
            title={`保守終了 ${row.maintEndOn}`}
          >
            {maintLeftLabel(row.maintEndOn)}
          </span>
        );
      }
      case 'maintFee':
        return row.maintFee === null ? (
          <span className="dt-muted">—</span>
        ) : (
          `${num.format(row.maintFee)} 円`
        );
      case 'maintVendor': {
        const vendor = maintVendorOf(row);
        if (!vendor) return <span className="dt-muted">—</span>;
        return (
          <span
            title={
              vendor.source === 'asset'
                ? 'この機器だけ指定しています（メーカーの既定より優先）'
                : 'メーカーの既定です'
            }
          >
            {vendor.name}
          </span>
        );
      }
      case 'maintPhones': {
        const vendor = maintVendorOf(row);
        if (!vendor || vendor.phones.length === 0) {
          return <span className="dt-muted">—</span>;
        }
        // 代表・担当・夜間を縦に並べる。横に繋げると行が伸びて読めない
        return (
          <span className="dt-phones">
            {vendor.phones.map((phone, index) => (
              <span key={index}>{phone}</span>
            ))}
          </span>
        );
      }
      case 'repairCost': {
        if (!row.repairs.hasMaint) return <span className="dt-muted">—</span>;
        // 1 件も入力が無いときは 0 円と書かない。無償だったのか未入力なのか分からない
        if (row.repairs.costKnown === 0) {
          return <span className="dt-muted">—</span>;
        }
        return (
          <span title={`費用が入力されている履歴 ${row.repairs.costKnown} 件の合計`}>
            {num.format(row.repairs.cost)} 円
          </span>
        );
      }
      case 'repairInHouse':
      case 'repairVendor': {
        // 保守期間が入っていない台帳は「保守内」を決められない
        if (!row.repairs.hasMaint) return <span className="dt-muted">—</span>;
        const count =
          key === 'repairInHouse' ? row.repairs.inHouse : row.repairs.vendor;
        return count === 0 ? <span className="dt-muted">0</span> : num.format(count);
      }
      case 'maintStatus':
        return maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract) ?? '—';
      case 'state': {
        // SNMP を持たない SATO は、押したときだけ ENQ で状態を読む
        if (isEnqRow(row)) return satoCell(row);
        if (row.printer === null) return '';

        const { reachable, lastPolledAt, lastError } = row.printer;
        // 応答なしでも前回の情報は残すので、いつ何で失敗したかを添える
        const title = reachable
          ? undefined
          : [
              lastPolledAt
                ? `${new Date(lastPolledAt).toLocaleString('ja-JP')} の問い合わせで応答なし`
                : null,
              lastError,
              '表示中の情報は前回取得できたときのものです',
            ]
              .filter(Boolean)
              .join('\n');

        return (
          <span
            className={reachable ? 'dt-badge dt-badge-ok' : 'dt-badge dt-badge-ng'}
            title={title}
          >
            {reachable ? '応答あり' : '応答なし'}
          </span>
        );
      }
      case 'liveModel':
        return row.printer?.model ?? '';
      case 'pageCount':
        return show(row.printer?.pageCount);
      case 'lastSuccessAt':
        return row.printer?.lastSuccessAt
          ? new Date(row.printer.lastSuccessAt).toLocaleString('ja-JP')
          : '';
      case 'pages':
        return show(row.latest?.pages);
      case 'monoPages':
        return show(row.latest?.monoPages);
      case 'colorPages':
        return show(row.latest?.colorPages);
      case 'partLevel': {
        if (!row.printer) return '';
        const parts = partsOf(row.printer.readings).filter((s) => s.percent !== null);
        if (parts.length === 0) return '';
        const worst = parts[0];
        return (
          <span
            className={
              (worst.percent as number) <= DUE_PERCENT
                ? 'dt-low'
                : (worst.percent as number) <= SOON_PERCENT
                  ? 'dt-soon'
                  : undefined
            }
            title={`${SUPPLY_TYPE_NAME[worst.supplyType ?? 1] ?? '部品'}: ${worst.name}`}
          >
            {worst.percent}%
          </span>
        );
      }
      default:
        return row[key] ?? '';
    }
  };

  return (
    <div className="dt">
      <header className="dt-head">
        <h1>機器一覧</h1>
        <p>
          端末台帳のうち IP アドレスのある {counts.total} 台に、その IP から取得した実機の情報と
          直近の印刷枚数を突き合わせた一覧です。一度も取得できていない機器（応答がない）は、
          機器情報と枚数の欄が空欄になります。一度取得できた機器は、その後応答しなくなっても
          前回の情報を残します。いつ取れた情報かは「取得できた時刻」で分かります。
          {noIp > 0 &&
            `プリンター登録で IP アドレスが未入力の ${noIp} 台は、問い合わせる先が無いので` +
              'ここには出していません（毎日チェックの表にも出ません）。IP を入れると並びます。'}
        </p>
      </header>

      {/*
        * 毎日チェックの表。トナー・インクを自分で発注する機器だけを、残りの少ない順に並べる。
        * 下の一覧の絞り込み・探す欄は当てない（毎日同じ台を見るための表なので）
        */}
      <section className="dt-daily" aria-labelledby="dt-daily-title">
        <div className="dt-daily-head">
          <h2 id="dt-daily-title">
            <span className="dt-daily-star" aria-hidden>
              ★
            </span>
            毎日チェック（{daily.length} 台）
          </h2>

          {daily.length > 0 && (
            <span className="dt-daily-tags">
              {dailyCounts.empty > 0 && (
                <span className="dt-daily-tag dt-daily-tag-empty">
                  すぐ交換 {dailyCounts.empty} 台
                </span>
              )}
              {dailyCounts.low > 0 && (
                <span className="dt-daily-tag dt-daily-tag-low">
                  注文の目安 {dailyCounts.low} 台
                </span>
              )}
              {dailyCounts.needsOrder > 0 && (
                <span
                  className="dt-daily-tag dt-daily-tag-nostock"
                  title="残りの少ない色に使う品番が、その台の拠点に在庫 0 本で、注文中もありません。注文が要ります"
                >
                  要注文 {dailyCounts.needsOrder} 台
                </span>
              )}
              {dailyCounts.empty + dailyCounts.low === 0 && (
                <span className="dt-daily-tag dt-daily-tag-ok">残りの少ないものはありません</span>
              )}
              {/* 読めていない台があるのに「ありません」とだけ言わないよう、並べて出す */}
              {dailyCounts.unread > 0 && (
                <span
                  className="dt-daily-tag dt-daily-tag-unread"
                  title="一度も取得できていない台と、最後の問い合わせで応答しなかった台です。残量は前回取れたときのものか、空欄です"
                >
                  応答なし・未取得 {dailyCounts.unread} 台
                </span>
              )}
            </span>
          )}

          <span className="dt-daily-tools">
            <button
              onClick={() =>
                void fetchFromLedger(
                  daily.map((item) => item.row),
                  '毎日チェック',
                )
              }
              disabled={busy || dailyCounts.pollable === 0}
              type="button"
              title="毎日チェックの台だけに問い合わせて、残量を今の値にします。定期の取り直しは 12:30 なので、朝は前の日の値になっています"
            >
              {busy ? '取得中…' : `この ${dailyCounts.pollable} 台を取得し直す`}
            </button>
            <CsvButton
              name="プリンター状況_毎日チェック"
              label="CSV で保存（毎日チェック）"
              header={CSV_COLUMNS.map((col) => col.label)}
              rows={() => daily.map(({ row }) => CSV_COLUMNS.map((col) => col.value(row)))}
              count={daily.length}
              title="毎日チェックの台を、この表の並び（残りの少ない順）で CSV に保存します"
            />
          </span>
        </div>

        <p className="dt-daily-legend">
          <span className="dt-supply dt-supply-empty">
            <span className="dt-dot" style={{ background: COLORANT_HEX.black }} aria-hidden />K 3%
            <span className="dt-supply-flag">{TONER_LEVEL_SHORT.empty}</span>
          </span>
          すぐ交換（残り {TONER_EMPTY_PERCENT}% 以下）
          <span className="dt-supply dt-supply-low">
            <span className="dt-dot" style={{ background: COLORANT_HEX.cyan }} aria-hidden />C 15%
            <span className="dt-supply-flag">{TONER_LEVEL_SHORT.low}</span>
          </span>
          注文の目安（残り {TONER_LOW_PERCENT}% 以下）
          <span className="dt-legend-note">
            残量を数値で返さない機種（Canon iR-ADV は入っている間ずっと 100%）は、
            機器が出す「残りわずか」「交換してください」の警告で色を付けます。
            「あり」「不明」は量が分からないので色を付けません。
            印は下の一覧の ☆ か、プリンター登録の「毎日チェックする」で付け外しします。
          </span>
        </p>

        {daily.length === 0 ? (
          <p className="dt-daily-empty">
            毎日チェックする機器はまだありません。トナー・インクを自分で発注する機器に、
            下の一覧の ☆ を押して印を付けると、ここに残りの少ない順で並びます。
          </p>
        ) : (
          <TableBox className="dt-wrap dt-wrap-short" memoryKey="printers.daily">
            <table className="dt-table">
              {/*
                * 列は「どの台か → 何を頼むか（機種）→ どれだけ残っているか」の順。
                * 注文を決めるのに要る列を左に寄せ、窓が狭くても横に送らずに読めるようにする
                */}
              <thead>
                <tr>
                  <th className="dt-plain">毎日</th>
                  <th className="dt-plain">拠点</th>
                  <th className="dt-plain">部署</th>
                  <th className="dt-plain">No.</th>
                  <th className="dt-plain">機種</th>
                  <th className="dt-plain">トナー・インク</th>
                  <th className="dt-plain">品番・在庫（その拠点）</th>
                  <th className="dt-plain">交換部品</th>
                  <th className="dt-plain">取得できた時刻</th>
                  <th className="dt-plain">状態</th>
                  <th className="dt-plain">取得</th>
                  <th className="dt-plain">警告</th>
                </tr>
              </thead>
              <tbody>
                {daily.map(({ row, level }) => (
                  <tr
                    key={row.id}
                    className={
                      level
                        ? `dt-row-toner-${level}`
                        : row.printer === null
                          ? 'dt-down'
                          : undefined
                    }
                  >
                    <td>
                      <DailyCheckStar
                        on={row.dailyCheck}
                        label={`${row.department ?? '部署未設定'} No.${row.no ?? '—'}`}
                        onToggle={() => void toggleDailyCheck(row)}
                      />
                    </td>
                    <td>{cellOf(row, 'company')}</td>
                    <td>{row.department ?? ''}</td>
                    <td>{row.no ?? ''}</td>
                    <td>{[row.maker, row.model].filter(Boolean).join(' ')}</td>
                    <td className="dt-daily-toner">
                      {row.printer && row.printer.readings.length > 0 ? (
                        <SupplyCell readings={row.printer.readings} alerts={row.printer.alerts} />
                      ) : (
                        <span className="dt-muted">—</span>
                      )}
                    </td>
                    <td className="dt-daily-stock">
                      <StockCell
                        toners={row.toners}
                        low={
                          row.printer
                            ? lowColors(row.printer.readings, row.printer.alerts)
                            : new Set()
                        }
                        site={row.company?.name ?? 'この拠点'}
                      />
                    </td>
                    <td>{row.printer ? <PartCell readings={row.printer.readings} /> : ''}</td>
                    <td className="dt-daily-when">{shortWhen(row.printer?.lastSuccessAt)}</td>
                    <td>{cellOf(row, 'state')}</td>
                    <td className="pl-ops">
                      <button
                        onClick={() => void fetchOne(row)}
                        disabled={busy || fetching[row.id] || !canPoll(row)}
                        title={fetchTitle(row)}
                        type="button"
                      >
                        {fetching[row.id] ? '取得中…' : '取得'}
                      </button>
                    </td>
                    <td className="dt-daily-alerts">
                      {row.printer ? (
                        <AlertCell
                          alerts={row.printer.alerts}
                          consoleText={row.printer.consoleText}
                        />
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableBox>
        )}
      </section>

      <div className="dt-tools">
        <label>
          <span>絞り込み</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">すべて（{counts.total} 台）</option>
            <option value="toner">
              トナー・インクが少ない（{counts.toner} 台）
            </option>
            <option value="due">
              交換部品に注意（{counts.due + counts.soon} 台）
            </option>
            <option value="maint">
              保守が切れる・切れている（{counts.maintSoon} 台）
            </option>
            <option value="live">実機の情報あり（{counts.live} 台）</option>
            <option value="blank">機器情報が空欄（{counts.blank} 台）</option>
          </select>
        </label>

        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="部署・No.・IP・メーカー・型番・シリアル・品番"
          count={shown.length}
          total={base.length}
          unit="台"
        />

        <button onClick={() => void fetchFromLedger()} disabled={busy} type="button">
          {busy ? '取得中…' : `台帳の IP で取得（${counts.withIp} 件）`}
        </button>

        <button onClick={() => void load()} disabled={busy} type="button">
          一覧を更新
        </button>

        <CsvButton
          name="プリンター状況"
          label="CSV で保存（下の一覧）"
          header={CSV_COLUMNS.map((col) => col.label)}
          rows={() => shown.map((row) => CSV_COLUMNS.map((col) => col.value(row)))}
          count={shown.length}
          title="いま出ている行を CSV に保存します。表で色や点にしている保守の残り・消耗品の残量も、文字にして入ります"
        />
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <p className="dt-legend">
        <span className="dt-swatch dt-swatch-repair" aria-hidden />
        修理中（{counts.repairing} 台）
        <span className="dt-legend-note">
          修理履歴に、状態が「完了」になっていないものが残っている機器です。
          「保守内」の 3 列は、復旧日（未入力なら発生日）が保守開始日〜保守終了日に
          入っている履歴だけを数えます（どちらの日付も無い履歴は数えません）。
          費用は入力されているものだけを足すので、1 件も入っていなければ
          0 円ではなくハイフンにします。
          「残り」は保守終了日までの日数で、{MAINT_SOON_DAYS} 日を切ると色が付き、
          過ぎていれば超過日数を赤で出します（期限切れ {counts.maintExpired} 台）。
        </span>
      </p>

      <p className="dt-legend">
        <span className="dt-swatch dt-swatch-due" aria-hidden />
        交換時期（{counts.due} 台）
        <span className="dt-swatch dt-swatch-soon" aria-hidden />
        まもなく交換（{counts.soon} 台）
        <span className="dt-legend-note">
          トナー・インクを除いた部品（ドラム・定着・転写・廃トナーなど）が対象です。
          残量 {DUE_PERCENT}% で交換時期、{SOON_PERCENT}% 以下でまもなく交換。
          残量を数値で返さない機種は、機器が出している交換案内から判定します。
          カラー機はドラムを色ごとに 1 本持つので、交換部品の欄では種別ごとに 1 行へまとめ、
          K（黒）C M Y の順に並べます。種別の並びは残量によらず
          ドラム・定着・転写・現像剤・クリーナー・廃トナー・その他で固定なので、
          機器が違っても同じ位置に同じ種別が出ます。機器が残量を返さない項目は
          「不明」と薄く出し、位置は動かしません（部品が無いという意味ではありません）。
        </span>
      </p>

      <p className="dt-hint">
        トナー・インクの残量は、精度が機種によって違います。Canon iR-ADV は残量を計測しておらず、
        トナーが入っている間は常に 100% を返すため、この 100% は「まだ十分ある」ではなく
        「入っている」という意味です。残りを枚数で持っている機種（富士ゼロックスなど）は実際の値です。
        ドラム・定着など交換部品の残量は、Canon も実際の値を返します。
        残りの少ないトナー・インクは、上の毎日チェックと同じく札に色を付けます
        （{TONER_EMPTY_PERCENT}% 以下は赤、{TONER_LOW_PERCENT}% 以下は黄。機器の「残りわずか」の警告も含む）。
      </p>

      <p className="dt-hint">
        見出しを押すと並べ替わります。空欄の行は向きによらず末尾に置きます。
      </p>

      {shown.length === 0 ? (
        <p className="dt-empty">表示できる機器がありません。</p>
      ) : (
        <TableBox className="dt-wrap" memoryKey="printers">
          <table className="dt-table">
            <thead>
              <tr className="dt-group-row">
                {/* 毎日チェックの ★。押すと上の表に入る／外れる */}
                <th className="dt-plain" rowSpan={2}>
                  毎日
                </th>
                {/* 行ごとの取得。並べ替えの対象ではないので COLUMNS の外に置く */}
                <th className="dt-plain" rowSpan={2}>
                  取得
                </th>
                <th className="dt-plain" colSpan={span('台帳')}>
                  台帳
                </th>
                <th className="dt-plain dt-group-sep" colSpan={span('修理')}>
                  修理
                </th>
                <th className="dt-plain dt-group-sep" colSpan={span('機器')}>
                  機器（SNMP で取得）
                </th>
                <th className="dt-plain dt-group-sep" colSpan={span('枚数')}>
                  印刷枚数
                </th>
                {/* トナー・交換部品・警告の 3 列は COLUMNS の外に置いている */}
                <th className="dt-plain dt-group-sep" colSpan={3}>
                  消耗品・警告
                </th>
              </tr>
              <tr>
                {COLUMNS.map((col, index) => (
                  <th
                    key={col.key}
                    className={[
                      col.numeric ? 'dt-num' : '',
                      COLUMNS[index - 1] && COLUMNS[index - 1].group !== col.group
                        ? 'dt-group-sep'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-sort={
                      sort.key === col.key
                        ? sort.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" onClick={() => setSort(nextSort(sort, col.key))}>
                      {col.label}
                      <span className="dt-arrow" aria-hidden>
                        {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="dt-plain dt-group-sep">トナー・インク</th>
                <th className="dt-plain">交換部品</th>
                <th className="dt-plain">警告</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr
                  key={row.id}
                  className={
                    // 修理中は消耗品の色より先に出す。今その機器が使えるかの話なので
                    underRepair(row)
                      ? 'dt-row-repair'
                      : row.printer === null
                        ? 'dt-down'
                        : (partState(row.printer.readings, row.printer.alerts) ?? '') === 'due'
                          ? 'dt-row-due'
                          : partState(row.printer.readings, row.printer.alerts) === 'soon'
                            ? 'dt-row-soon'
                            : undefined
                  }
                >
                  <td>
                    <DailyCheckStar
                      on={row.dailyCheck}
                      label={`${row.department ?? '部署未設定'} No.${row.no ?? '—'}`}
                      onToggle={() => void toggleDailyCheck(row)}
                    />
                  </td>
                  <td className="pl-ops">
                    <button
                      onClick={() => void fetchOne(row)}
                      disabled={busy || fetching[row.id] || !canPoll(row)}
                      title={fetchTitle(row)}
                      type="button"
                    >
                      {fetching[row.id] ? '取得中…' : '取得'}
                    </button>
                  </td>
                  {COLUMNS.map((col, index) => (
                    <td
                      key={col.key}
                      className={[
                        col.numeric ? 'dt-num' : '',
                        col.key === 'ipAddress' || col.key === 'serialNumber' ? 'dt-mono' : '',
                        COLUMNS[index - 1] && COLUMNS[index - 1].group !== col.group
                          ? 'dt-group-sep'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {cellOf(row, col.key)}
                    </td>
                  ))}
                  <td className="dt-group-sep">
                    {row.printer && row.printer.readings.length > 0 ? (
                      <SupplyCell readings={row.printer.readings} alerts={row.printer.alerts} />
                    ) : (
                      ''
                    )}
                  </td>

                  <td>{row.printer ? <PartCell readings={row.printer.readings} /> : ''}</td>

                  <td>
                    {row.printer ? (
                      <AlertCell alerts={row.printer.alerts} consoleText={row.printer.consoleText} />
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>
      )}
    </div>
  );
}
