import { useCallback, useEffect, useMemo, useState } from 'react';
import PeriodPicker from '../components/PeriodPicker';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import { isSheetUnit } from '../lib/counter';
import { saveCsv } from '../lib/csv';
import { num } from '../lib/format';
import { periodQuery, usePeriod } from '../lib/period';
import { hits, searchWords } from '../lib/search';
import { ipToNumber, nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './DataTable.css';

/**
 * 1 台 1 日分の記録。
 *
 * 枚数は **機能（プリンター / コピー / スキャナ）× 色（モノクロ / カラー）**
 * の 6 つが土台で、合計はそれを足したもの。
 *
 *     累計         = 累計モノクロ + 累計カラー
 *     累計モノクロ = プリンターモノクロ + コピーモノクロ
 *     累計カラー   = プリンターカラー   + コピーカラー
 *     累計プリンター = プリンターモノクロ + プリンターカラー（コピー・スキャナも同様）
 *
 * **スキャナだけは累計に入らない。** 紙に出ないので機器の累計印刷枚数
 * （prtMarkerLifeCount）にも含まれておらず、読み取り枚数として別に見る。
 * 取れない機能・色は null で、0 枚とは区別する
 */
type DailyCount = {
  id: number;
  printerId: number;
  ipAddress: string;
  model: string | null;
  /**
   * カウンタの単位（prtMarkerCounterUnit）。7 / 8 は枚、17 はメートル。
   * **この画面は枚の機器だけを出す。** ラベルプリンターは長さで数えるので、
   * 混ぜて足すと枚数の合計が意味を失う（「ラベル印字状況」で別に見る）
   */
  counterUnit: number | null;
  /** 台帳から引いた部署。IP が重複していて 1 台に絞れないときは null */
  department: string | null;
  /** 台帳の管理番号 */
  no: string | null;
  date: string;
  /** その時点の累計 */
  total: number;
  totalMono: number | null;
  totalColor: number | null;
  /** 機能 × 色の累計 */
  totalPrintMono: number | null;
  totalPrintColor: number | null;
  totalCopyMono: number | null;
  totalCopyColor: number | null;
  totalScanMono: number | null;
  totalScanColor: number | null;
  /** 上を足した機能ごとの累計。両方とも取れていないときだけ null */
  totalPrint: number | null;
  totalCopy: number | null;
  totalScan: number | null;
  /** 期間内の枚数。初回とカウンタ巻き戻しのときは null */
  pages: number | null;
  monoPages: number | null;
  colorPages: number | null;
  printMonoPages: number | null;
  printColorPages: number | null;
  copyMonoPages: number | null;
  copyColorPages: number | null;
  scanMonoPages: number | null;
  scanColorPages: number | null;
  printPages: number | null;
  copyPages: number | null;
  scanPages: number | null;
  spanDays: number;
  capturedAt: string;
};

type SortKey =
  | 'date'
  | 'department'
  | 'ipAddress'
  | 'model'
  | 'pages'
  | 'monoPages'
  | 'colorPages'
  | 'total'
  | 'totalMono'
  | 'totalColor'
  | 'totalPrint'
  | 'totalPrintMono'
  | 'totalPrintColor'
  | 'totalCopy'
  | 'totalCopyMono'
  | 'totalCopyColor'
  | 'totalScan'
  | 'totalScanMono'
  | 'totalScanColor'
  | 'capturedAt';

/**
 * 列のまとまり。見出しを 2 段にして、どれが何の内訳かを段で示す。
 * 同じ「モノクロ」「カラー」が何度も出るので、上の段が無いと読めない
 */
type Group = '記録' | '1日' | '累計' | 'プリンター' | 'コピー' | 'スキャナ' | '取得';

const COLUMNS: {
  key: SortKey;
  label: string;
  /** 上の段が見えない狭い画面でも意味が分かるよう、マウスを当てたときに出す */
  title?: string;
  group: Group;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'date', label: '日付', group: '記録', kind: 'date' },
  { key: 'department', label: '部署', group: '記録', kind: 'text' },
  { key: 'ipAddress', label: 'IP アドレス', group: '記録', kind: 'ip' },
  { key: 'model', label: '機種', group: '記録', kind: 'text' },

  { key: 'pages', label: '合計', title: '1 日の印刷枚数', group: '1日', kind: 'number', numeric: true },
  { key: 'monoPages', label: 'モノクロ', title: '1 日のモノクロ枚数（累計モノクロの差）', group: '1日', kind: 'number', numeric: true },
  { key: 'colorPages', label: 'カラー', title: '1 日のカラー枚数（累計カラーの差）', group: '1日', kind: 'number', numeric: true },

  { key: 'total', label: '合計', title: '累計（累計モノクロ + 累計カラー）', group: '累計', kind: 'number', numeric: true },
  { key: 'totalMono', label: 'モノクロ', title: '累計モノクロ（プリンター + コピー）', group: '累計', kind: 'number', numeric: true },
  { key: 'totalColor', label: 'カラー', title: '累計カラー（プリンター + コピー）', group: '累計', kind: 'number', numeric: true },

  { key: 'totalPrint', label: '計', title: '累計プリンター（モノクロ + カラー）', group: 'プリンター', kind: 'number', numeric: true },
  { key: 'totalPrintMono', label: 'モノクロ', title: '累計プリンターモノクロ', group: 'プリンター', kind: 'number', numeric: true },
  { key: 'totalPrintColor', label: 'カラー', title: '累計プリンターカラー', group: 'プリンター', kind: 'number', numeric: true },

  { key: 'totalCopy', label: '計', title: '累計コピー（モノクロ + カラー）', group: 'コピー', kind: 'number', numeric: true },
  { key: 'totalCopyMono', label: 'モノクロ', title: '累計コピーモノクロ', group: 'コピー', kind: 'number', numeric: true },
  { key: 'totalCopyColor', label: 'カラー', title: '累計コピーカラー', group: 'コピー', kind: 'number', numeric: true },

  { key: 'totalScan', label: '計', title: '累計スキャナ（モノクロ + カラー）。紙に出ないので累計には入らない', group: 'スキャナ', kind: 'number', numeric: true },
  { key: 'totalScanMono', label: 'モノクロ', title: '累計スキャナモノクロ', group: 'スキャナ', kind: 'number', numeric: true },
  { key: 'totalScanColor', label: 'カラー', title: '累計スキャナカラー', group: 'スキャナ', kind: 'number', numeric: true },

  { key: 'capturedAt', label: '取得時刻', group: '取得', kind: 'date' },
];

/** その見出しが何列ぶんか。見出し行の colSpan に渡す */
const span = (group: Group) => COLUMNS.filter((col) => col.group === group).length;

/** 期間内を 1 台にまとめた合計 */
type PrinterTotal = {
  printerId: number;
  department: string | null;
  no: string | null;
  ipAddress: string;
  model: string | null;
  /** 枚数を出せた日の合計 */
  pages: number;
  /** 内訳を返さない機種は null。0 枚と区別する */
  mono: number | null;
  color: number | null;
  /** 機能ごとの内訳。プリンター + コピー = 印刷枚数 */
  print: number | null;
  copy: number | null;
  /** 読み取り枚数。紙に出ないので印刷枚数には足さない */
  scan: number | null;
  /** 枚数を足せた記録の件数 */
  days: number;
  /** 枚数を出せなかった記録の件数（初回・カウンタ巻き戻し） */
  unknown: number;
};

type TotalKey =
  | 'department'
  | 'ipAddress'
  | 'model'
  | 'pages'
  | 'mono'
  | 'color'
  | 'print'
  | 'copy'
  | 'scan'
  | 'days';

const TOTAL_COLUMNS: {
  key: TotalKey;
  label: string;
  title?: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'department', label: '部署', kind: 'text' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip' },
  { key: 'model', label: '機種', kind: 'text' },
  { key: 'pages', label: '印刷枚数', title: 'モノクロ + カラー = プリンター + コピー', kind: 'number', numeric: true },
  { key: 'mono', label: 'モノクロ', kind: 'number', numeric: true },
  { key: 'color', label: 'カラー', kind: 'number', numeric: true },
  { key: 'print', label: 'プリンター', kind: 'number', numeric: true },
  { key: 'copy', label: 'コピー', kind: 'number', numeric: true },
  { key: 'scan', label: 'スキャナ', title: '読み取り枚数。紙に出ないので印刷枚数には入らない', kind: 'number', numeric: true },
  { key: 'days', label: '記録日数', kind: 'number', numeric: true },
];

/** 足せるものだけ足す。1 件も無いときは null のままにして、画面ではハイフンを出す */
function add(current: number | null, value: number | null): number | null {
  return value === null ? current : (current ?? 0) + value;
}

/** 同じ数え方で 2 つを足す。どちらも取れていないときだけ null */
const sumOf = (a: number | null, b: number | null) => add(add(null, a), b);

/**
 * 期間内の記録を機器ごとに足す。
 *
 * 枚数を出せなかった日（初回・カウンタ巻き戻し）は足さずに件数だけ数える。
 * 内訳は、返さない機種では 0 枚ではなく「取れていない」なので、
 * 1 件も無いときは null のままにして画面ではハイフンを出す。
 */
function totalsByPrinter(rows: DailyCount[]): PrinterTotal[] {
  const totals = new Map<number, PrinterTotal>();

  for (const row of rows) {
    const item = totals.get(row.printerId) ?? {
      printerId: row.printerId,
      department: row.department,
      no: row.no,
      ipAddress: row.ipAddress,
      model: row.model,
      pages: 0,
      mono: null,
      color: null,
      print: null,
      copy: null,
      scan: null,
      days: 0,
      unknown: 0,
    };

    if (row.pages === null) item.unknown += 1;
    else {
      item.pages += row.pages;
      item.days += 1;
    }
    item.mono = add(item.mono, row.monoPages);
    item.color = add(item.color, row.colorPages);
    item.print = add(item.print, row.printPages);
    item.copy = add(item.copy, row.copyPages);
    item.scan = add(item.scan, row.scanPages);

    totals.set(row.printerId, item);
  }

  return [...totals.values()];
}

const DAY_CHOICES = [7, 30, 60, 90, 365];

/**
 * 折れ線グラフの寸法。viewBox で描き、幅は CSS で窓に合わせて伸ばす。
 * 左を広く取っているのは、5 桁の目盛りが軸から食み出さないようにするため。
 */
const CHART = { width: 960, height: 300, top: 14, right: 18, bottom: 34, left: 66 };

/** グラフに出す系列。内訳を返さない機種では合計だけになる */
const SERIES: { key: 'pages' | 'monoPages' | 'colorPages'; label: string; color: string }[] = [
  { key: 'pages', label: '合計', color: '#1f6f8b' },
  { key: 'monoPages', label: 'モノクロ', color: '#2b3440' },
  { key: 'colorPages', label: 'カラー', color: '#c9407f' },
];

/** 目盛りの上限。1・2・5 の刻みに丸めて軸を読みやすくする */
function niceMax(value: number): number {
  if (value <= 0) return 10;
  const base = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * base) return step * base;
  }
  return 10 * base;
}

/** YYYY-MM-DD を UTC のミリ秒に。@db.Date と同じく日付だけを見る */
function dayMs(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** 軸のラベルは M/D で十分。960 の幅に 30 日並べても潰れない */
const monthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/**
 * 枚数の出せなかった日（初回・カウンタ巻き戻し）で線を切る。
 * その日を飛ばして繋ぐと、印刷していない期間があったように見えてしまう。
 */
function segmentsOf(
  rows: DailyCount[],
  key: (typeof SERIES)[number]['key'],
  x: (date: string) => number,
  y: (value: number) => number,
): string[] {
  const segments: string[] = [];
  let current: string[] = [];

  for (const row of rows) {
    const value = row[key];
    if (value === null) {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
      continue;
    }
    current.push(`${x(row.date)},${y(value)}`);
  }
  if (current.length > 1) segments.push(current.join(' '));

  return segments;
}

/** 1 台分の日ごとの枚数を折れ線で。rows は日付の昇順で渡す */
function PageCountChart({ rows, label }: { rows: DailyCount[]; label: string }) {
  const shown = SERIES.filter((s) => rows.some((row) => row[s.key] !== null));
  if (shown.length === 0) {
    return (
      <p className="dt-empty">
        この期間はまだ枚数を出せていません。1 日分の枚数は 2 回目の取得から入ります。
      </p>
    );
  }

  const max = niceMax(
    Math.max(...rows.flatMap((row) => shown.map((s) => row[s.key] ?? 0))),
  );
  const first = dayMs(rows[0].date);
  const last = dayMs(rows[rows.length - 1].date);
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;

  // 記録が 1 日しかないときは幅で割れないので、真ん中に置く
  const x = (date: string) =>
    last === first
      ? CHART.left + plotWidth / 2
      : CHART.left + ((dayMs(date) - first) / (last - first)) * plotWidth;
  const y = (value: number) => CHART.top + plotHeight - (value / max) * plotHeight;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(max * ratio));
  // 日付ラベルは詰め込みすぎると読めない。最大 8 個に間引く。
  // 後ろから数えて、直近の日付は必ずラベルが付くようにする
  const step = Math.max(1, Math.ceil(rows.length / 8));
  const dateLabels = rows.filter((_, index) => (rows.length - 1 - index) % step === 0);

  return (
    <>
      <svg
        className="dt-chart-svg"
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        role="img"
        aria-label={`${label} の日ごとの印刷枚数`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="dt-chart-grid"
              x1={CHART.left}
              x2={CHART.width - CHART.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text className="dt-chart-axis" x={CHART.left - 8} y={y(tick) + 4} textAnchor="end">
              {num.format(tick)}
            </text>
          </g>
        ))}

        {dateLabels.map((row) => (
          <text
            className="dt-chart-axis"
            key={row.id}
            x={x(row.date)}
            y={CHART.height - 12}
            textAnchor="middle"
          >
            {monthDay(row.date)}
          </text>
        ))}

        {shown.map((series) => (
          <g key={series.key}>
            {segmentsOf(rows, series.key, x, y).map((points, index) => (
              <polyline
                className="dt-chart-line"
                key={index}
                points={points}
                stroke={series.color}
              />
            ))}
            {rows.map((row) =>
              row[series.key] === null ? null : (
                <circle
                  className="dt-chart-dot"
                  key={row.id}
                  cx={x(row.date)}
                  cy={y(row[series.key] as number)}
                  r={3}
                  fill={series.color}
                >
                  <title>
                    {`${row.date} ${series.label} ${num.format(row[series.key] as number)} 枚`}
                  </title>
                </circle>
              ),
            )}
          </g>
        ))}
      </svg>

      <p className="dt-chart-legend">
        {shown.map((series) => (
          <span className="dt-chart-key" key={series.key}>
            <span className="dt-chart-swatch" style={{ background: series.color }} aria-hidden />
            {series.label}
          </span>
        ))}
        <span className="dt-chart-note">
          点にカーソルを合わせると日付と枚数が出ます。枚数を出せなかった日は線を切っています。
        </span>
      </p>
    </>
  );
}

const show = (value: number | null) => (value === null ? '—' : num.format(value));

/**
 * 列に付ける class。数値は右寄せ、まとまりの変わり目には縦の区切り線を入れる。
 * 見出しと本文で同じものを使わないと線がずれるので、両方からこれを呼ぶ。
 * body だけ IP を等幅にしたいので、そこだけ引数で切り替える
 */
function colClass(index: number, body = false): string | undefined {
  const column = COLUMNS[index];
  const previous = COLUMNS[index - 1];
  return (
    [
      column.numeric ? 'dt-num' : '',
      body && column.key === 'ipAddress' ? 'dt-mono' : '',
      previous && previous.group !== column.group ? 'dt-group-sep' : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
}

/**
 * 1 セルの中身。列の定義（COLUMNS）から引くので、
 * 列を足したときに見出しと本文がずれない
 */
function cellOf(row: DailyCount, key: SortKey) {
  if (key === 'date') return row.date;
  if (key === 'department') {
    return (
      <span title={row.no ? `No.${row.no}` : undefined}>
        {row.department ?? <span className="dt-muted">—</span>}
      </span>
    );
  }
  if (key === 'ipAddress') return row.ipAddress;
  if (key === 'model') return row.model ?? '—';
  if (key === 'capturedAt') return new Date(row.capturedAt).toLocaleString('ja-JP');

  return show(row[key]);
}

/**
 * 集計表に貼る 1 行分。台帳 1 台につき、
 * split_mono_color が立っていればモノクロ・カラーの 2 行、そうでなければ合計の 1 行になる。
 */
type ExportRow = {
  department: string | null;
  no: string | null;
  /** 貼ったものが集計表のどの機器の行か分かるように添える。台帳の型番 */
  name: string | null;
  kind: 'モノクロ' | 'カラー' | '両方';
  /** 取れていない値は null。貼り付けでは空欄にする */
  value: number | null;
};

/** コピー用に台帳から取る分。枚数は保存済みの最新の記録を使う */
type ExportAsset = {
  no: string | null;
  department: string | null;
  model: string | null;
  /** 集計表でこの機器が占める行。2 行の機器は上下どちらがモノクロかも表ごとに違う */
  countLayout: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
  /** 単位の判定に使う。長さで数える機器は集計表に混ぜられない */
  printer: { counterUnit: number | null } | null;
  latest: {
    total: number;
    totalMono: number | null;
    totalColor: number | null;
  } | null;
};

/**
 * 集計表の順に並べた行を作る。
 *
 * 並びは **No. の昇順**。現行の集計表がその順なので、そこに合わせる。
 * 実機に問い合わせず、毎日 12 時の記録で保存された累計値をそのまま使う。
 * 応答しなかった日は記録を作らないので、最新の記録は必ず実測値になる
 */
function buildExportRows(assets: ExportAsset[]): ExportRow[] {
  const sorted = [...assets]
    // 長さ（m）で数える機器は集計表に載せない。枚数の列に長さが混ざる
    .filter((asset) => isSheetUnit(asset.printer?.counterUnit ?? null))
    .sort((a, b) => (a.no ?? '').localeCompare(b.no ?? '', 'ja', { numeric: true }));

  const rows: ExportRow[] = [];
  for (const asset of sorted) {
    const base = { department: asset.department, no: asset.no, name: asset.model };
    const mono: ExportRow = {
      ...base,
      kind: 'モノクロ',
      value: asset.latest?.totalMono ?? null,
    };
    const color: ExportRow = {
      ...base,
      kind: 'カラー',
      value: asset.latest?.totalColor ?? null,
    };

    if (asset.countLayout === 'MONO_COLOR') rows.push(mono, color);
    // 集計表がカラーを上に置いている機器。機器の申告とは逆だが表に合わせる
    else if (asset.countLayout === 'COLOR_MONO') rows.push(color, mono);
    else rows.push({ ...base, kind: '両方', value: asset.latest?.total ?? null });
  }
  return rows;
}

/** 出す列。**部署 / プリンター名 / カラー・モノクロ / 枚数** の 4 つ */
const HEADER = ['部署', 'プリンター名', 'カラー/モノクロ', '枚数'];

/**
 * 1 行を列に開く。貼り付けと CSV で同じ中身にするため、ここだけで作る。
 * 枚数に桁区切りは入れない（入れると数値として読まれない）
 */
const cellsOf = (row: ExportRow) => [
  row.department ?? '',
  row.name ?? '',
  row.kind,
  row.value === null ? '' : String(row.value),
];

/**
 * エクセルへ貼れる形にする。区切りはタブで、エクセルはこれをセルの区切りとして読む。
 *
 * 枚数だけを 1 列で貼っていたが、ずれても気付けなかった。
 * 部署と機種を左に添えておけば、貼った先の行と突き合わせて確かめられる。
 *
 * 見出しは付けない。集計表の枚数欄へそのまま貼れる行数に揃えるため
 */
const toClipboardText = (rows: ExportRow[]) =>
  rows.map((row) => cellsOf(row).join('\t')).join('\n');

/**
 * クリップボードへ入れる。
 *
 * navigator.clipboard は安全なコンテキストかつ画面にフォーカスがある場合しか通らない。
 * 通らなかったときのために、隠した textarea を選択して execCommand('copy') でも試す。
 * どちらも失敗したときだけ false を返す
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 次の手を試す
  }

  const area = document.createElement('textarea');
  area.value = text;
  // 画面に出さずに選択したいが、display:none だと選択できない
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  area.setAttribute('readonly', '');
  document.body.appendChild(area);

  try {
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

export default function PageCountScreen() {
  const [counts, setCounts] = useState<DailyCount[]>([]);
  const periodState = usePeriod(30);
  const { period, label: periodLabel } = periodState;
  const [printerId, setPrinterId] = useState<number | 'all'>('all');
  /** 探す文字。**取ってある記録をこの場で絞るだけで、API は叩かない** */
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'date',
    dir: 'desc',
  });
  /** 機器ごとの合計表の並び。よく見るのは多い順なので枚数の降順から始める */
  const [totalSort, setTotalSort] = useState<{ key: TotalKey; dir: SortDir }>({
    key: 'pages',
    dir: 'desc',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** コピー用の行。画面を開いたときに読み、ボタンを押した時点では通信しない */
  const [exportRows, setExportRows] = useState<ExportRow[]>([]);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    // 期間指定のときは日付を、そうでなければ日数を渡す。判定は API 側と揃えてある
    try {
      setError(null);
      const rows = await request<DailyCount[]>(
        `/printers/page-counts?${periodQuery(period)}`,
      );
      // 枚で数える機器だけ。単位を返さない機種はこれまでどおり枚として扱う
      setCounts(rows.filter((row) => isSheetUnit(row.counterUnit)));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [period]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * コピー用の行を用意する。
   * 台帳と保存済みの累計値だけを見るので、実機には問い合わせない
   */
  const loadExport = useCallback(async () => {
    try {
      const assets = await request<ExportAsset[]>('/printer-assets/overview');
      setExportRows(buildExportRows(assets));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void loadExport();
  }, [loadExport]);

  /**
   * 絞り込みの選択肢。記録のある機器だけ出す。
   * 探すときの手がかりは IP より部署なので、部署を先頭に置いて部署の順に並べる
   */
  const printers = useMemo(() => {
    const seen = new Map<number, { label: string; department: string | null; ip: string }>();

    counts.forEach((row) => {
      if (seen.has(row.printerId)) return;
      const label = [
        row.department ?? '部署なし',
        row.no ? `No.${row.no}` : null,
        row.ipAddress,
        row.model ? `(${row.model})` : null,
      ]
        .filter(Boolean)
        .join(' ');
      seen.set(row.printerId, { label, department: row.department, ip: row.ipAddress });
    });

    // 部署が引けなかった機器は末尾に置く。空文字で並べると先頭を占めてしまう
    const rank = (value: string | null) => value ?? '￿';

    return [...seen.entries()]
      .sort(
        (a, b) =>
          rank(a[1].department).localeCompare(rank(b[1].department), 'ja') ||
          ipToNumber(a[1].ip) - ipToNumber(b[1].ip),
      )
      .map(([id, item]) => [id, item.label] as [number, string]);
  }, [counts]);

  /**
   * 機器ごとの最初の記録の日付。
   * 枚数が出ない理由が「初回」なのか「カウンタの巻き戻し」なのかを分けるために使う。
   * 理由は DB に持っていないので、読み込んだ範囲から判断する。
   */
  const firstDate = useMemo(() => {
    const first = new Map<number, string>();
    counts.forEach((row) => {
      const known = first.get(row.printerId);
      if (known === undefined || row.date < known) first.set(row.printerId, row.date);
    });
    return first;
  }, [counts]);

  /**
   * プリンターのセレクタだけを当てた記録。**「探す」の分母はここ。**
   * 期間の全件のまま出すと、1 台に絞ってから探したときに、
   * セレクタが落とした記録まで探した結果に見える
   */
  const base = useMemo(
    () => (printerId === 'all' ? counts : counts.filter((row) => row.printerId === printerId)),
    [counts, printerId],
  );

  /*
   * 日ごとの記録。**探す欄はここに当てる。**
   * 機器ごとの合計も上の合計もこの行から作るので、絞ると 3 つとも同じ範囲になる
   */
  const rows = useMemo(() => {
    const words = searchWords(query);
    const filtered = base.filter((row) =>
      hits([row.department, row.no, row.ipAddress, row.model, row.date], words),
    );
    const column = COLUMNS.find((c) => c.key === sort.key);

    return sortRows(filtered, (row) => row[sort.key], column?.kind ?? 'text', sort.dir, (row) => row.id);
  }, [base, sort, query]);

  /** 機器ごとの合計。日ごとの表と同じ絞り込み（期間・プリンター）で足す */
  const printerTotals = useMemo(() => {
    const column = TOTAL_COLUMNS.find((c) => c.key === totalSort.key);
    return sortRows(
      totalsByPrinter(rows),
      (row) => row[totalSort.key],
      column?.kind ?? 'text',
      totalSort.dir,
      (row) => row.printerId,
    );
  }, [rows, totalSort]);

  /** グラフは 1 台分だけ描く。日付の昇順に並べ替えて渡す */
  const chartRows = useMemo(() => {
    if (printerId === 'all') return [];
    return counts
      .filter((row) => row.printerId === printerId)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [counts, printerId]);

  const chartLabel = useMemo(
    () => printers.find(([id]) => id === printerId)?.[1] ?? '',
    [printers, printerId],
  );

  const noteOf = (row: DailyCount) => {
    if (row.pages === null) {
      return firstDate.get(row.printerId) === row.date
        ? '初回の記録。1 日分は次回から出ます'
        : 'カウンタが前回より小さくなっています（機器交換かリセット）';
    }

    /*
     * 累計 = 累計モノクロ + 累計カラー が崩れていないか毎行で確かめる。
     * 機種を足したときにカウンタ ID の当て方が違っていれば、ここに出る
     */
    if (row.totalMono !== null && row.totalColor !== null) {
      const split = row.totalMono + row.totalColor;
      if (split !== row.total) {
        return `累計モノクロ + 累計カラー（${num.format(split)}）が累計と合いません`;
      }
    }
    return row.spanDays > 1 ? `${row.spanDays} 日分をまとめた値` : '';
  };

  /** 表示中の合計。null（出せなかった日）は足さない */
  const totals = useMemo(() => {
    const sum = (pick: (row: DailyCount) => number | null) =>
      rows.reduce((acc, row) => acc + (pick(row) ?? 0), 0);

    /** 1 件も取れていない列は 0 枚ではなく「取れていない」。合計もハイフンにする */
    const maybe = (pick: (row: DailyCount) => number | null) =>
      rows.some((row) => pick(row) !== null) ? sum(pick) : null;

    return {
      pages: sum((r) => r.pages),
      mono: sum((r) => r.monoPages),
      color: sum((r) => r.colorPages),
      print: maybe((r) => r.printPages),
      copy: maybe((r) => r.copyPages),
      scan: maybe((r) => r.scanPages),
      unknown: rows.filter((r) => r.pages === null).length,
      /** モノクロ・カラーの内訳を返さない機種の分。合計との差がここに出る */
      noSplit: rows.filter((r) => r.pages !== null && r.monoPages === null).length,
      /** 機能別のカウンタを持たない機種の分。RICOH と Canon 以外 */
      noFunction: rows.filter((r) => r.pages !== null && r.totalPrint === null).length,
      /**
       * 機種は機能別を持っているが、**前日の記録に機能別が入っていない**分。
       * 1 日分は累計の差で出すので、機能別を記録し始める前の日はこうなる。
       * 機種の都合とは理由が違うので分けて数える
       */
      noPrevious: rows.filter(
        (r) => r.pages !== null && r.totalPrint !== null && r.printPages === null,
      ).length,
    };
  }, [rows]);

  /** 今すぐ取り込む。定時（12:00）を待たずに確かめたいとき用 */
  const captureNow = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await request<{ status: string }[]>('/printers/page-counts/capture', {
        method: 'POST',
      });
      const recorded = result.filter((r) => r.status === 'recorded').length;
      setNotice(`${recorded} 台を記録しました（応答なし ${result.length - recorded} 台）`);
      await load();
      await loadExport();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 集計表の 1 列分をクリップボードへ入れる。
   * 押した時点で保持している値をそのまま渡すので、実機への問い合わせは起きない
   */
  const copyForSheet = async () => {
    setError(null);

    if (!(await writeClipboard(toClipboardText(exportRows)))) {
      setError('クリップボードに書き込めませんでした。ブラウザの許可設定を確認してください');
      return;
    }

    const filled = exportRows.filter((row) => row.value !== null).length;
    setCopied(true);
    setNotice(
      `${exportRows.length} 行をコピーしました（値あり ${filled} 行 / 空欄 ` +
        `${exportRows.length - filled} 行）。部署・プリンター名・カラー/モノクロ・枚数の 4 列です。` +
        '空いている場所に貼って、部署と機種が集計表の行と合っているか確かめてください',
    );
    // 押したことが分かる状態を少し残す
    window.setTimeout(() => setCopied(false), 3000);
  };

  /**
   * 同じ中身を CSV として保存する。
   * 貼り付けと違って手元にファイルが残るので、いつの分かが分かるよう日付を名前に入れる
   * （名前と日付の付け方、囲み方、BOM は `lib/csv.ts` が持つ）
   */
  const saveAsCsv = () => {
    setError(null);
    saveCsv('印刷枚数', HEADER, exportRows.map(cellsOf));

    const filled = exportRows.filter((row) => row.value !== null).length;
    setNotice(
      `${exportRows.length} 行を CSV に保存しました（値あり ${filled} 行 / 空欄 ` +
        `${exportRows.length - filled} 行）。ダウンロードした場所を確認してください`,
    );
  };

  return (
    <div className="dt">
      <header className="dt-head">
        <h1>印刷枚数</h1>
        <p>
          毎日 12:00 に各機器の累計を読み、前回との差を 1 日分として記録しています。
          枚数は<strong>機能（プリンター・コピー）× 色（モノクロ・カラー）</strong>で数え、
          累計 = モノクロ + カラー = プリンター + コピー になります。
          スキャナは紙に出ないので累計には入れず、読み取り枚数として別に出します。
          機能別は RICOH と Canon、モノクロ・カラーの内訳はそれに加えてモノクロ専用機で取得できます。
        </p>
      </header>

      <div className="dt-tools">
        <PeriodPicker state={periodState} choices={DAY_CHOICES} />

        <label>
          <span>プリンター</span>
          <select
            value={printerId}
            onChange={(e) =>
              setPrinterId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">すべて（{printers.length} 台）</option>
            {printers.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {/* 2 つの表と上の合計に同じ絞り込みが効く。当てているのは日ごとの記録 */}
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="部署・No.・IP・型番・日付"
          count={rows.length}
          total={base.length}
        />

        <button onClick={() => void captureNow()} disabled={busy} type="button">
          {busy ? '取得中…' : '今すぐ取得'}
        </button>

        <button
          onClick={() => void copyForSheet()}
          disabled={exportRows.length === 0}
          type="button"
        >
          {copied ? 'コピーしました' : `集計表用にコピー（${exportRows.length} 行）`}
        </button>

        <button onClick={saveAsCsv} disabled={exportRows.length === 0} type="button">
          CSV で保存
        </button>
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <section className="dt-chart">
        <h2>日ごとの印刷枚数</h2>
        {printerId === 'all' ? (
          <p className="dt-chart-hint">
            上の「プリンター」で機器（部署名で並んでいます）を選ぶと、その機器の折れ線グラフが出ます。
          </p>
        ) : chartRows.length === 0 ? (
          <p className="dt-empty">{chartLabel} はこの期間の記録がありません。</p>
        ) : (
          <>
            <p className="dt-chart-hint">
              {chartLabel} の {periodLabel}（記録 {chartRows.length} 件）
            </p>
            <PageCountChart rows={chartRows} label={chartLabel} />
          </>
        )}
      </section>

      <dl className="dt-summary">
        <div>
          <dt>期間</dt>
          <dd className="dt-period">{periodLabel}</dd>
        </div>
        <div>
          <dt>{printerId === 'all' ? '期間の合計（全台）' : '期間の合計'}</dt>
          <dd>{num.format(totals.pages)} 枚</dd>
        </div>
        <div>
          <dt>モノクロ</dt>
          <dd>{num.format(totals.mono)} 枚</dd>
        </div>
        <div>
          <dt>カラー</dt>
          <dd>{num.format(totals.color)} 枚</dd>
        </div>
        <div>
          <dt>プリンター</dt>
          <dd>{show(totals.print)} 枚</dd>
        </div>
        <div>
          <dt>コピー</dt>
          <dd>{show(totals.copy)} 枚</dd>
        </div>
        <div>
          <dt>スキャナ（読み取り）</dt>
          <dd>{show(totals.scan)} 枚</dd>
        </div>
        <div>
          <dt>記録</dt>
          <dd>{rows.length} 件</dd>
        </div>
        {totals.unknown > 0 && (
          <div>
            <dt>枚数を出せなかった記録</dt>
            <dd>{totals.unknown} 件</dd>
          </div>
        )}
      </dl>

      {totals.noSplit > 0 && (
        <p className="dt-hint">
          モノクロ・カラーの内訳を返さない機種が {totals.noSplit} 件あるため、モノクロ + カラー
          （{num.format(totals.mono + totals.color)} 枚）は合計（{num.format(totals.pages)} 枚）
          と一致しません。差の {num.format(totals.pages - totals.mono - totals.color)} 枚が
          内訳の取れない分です。
        </p>
      )}

      {(totals.noFunction > 0 || totals.noPrevious > 0) && (
        <p className="dt-hint">
          プリンター + コピー（{show(sumOf(totals.print, totals.copy))} 枚）が合計
          （{num.format(totals.pages)} 枚）と一致しません。
          {totals.noFunction > 0 && (
            <>
              {' '}機能別のカウンタを持っているのは RICOH と Canon だけで、
              持たない機種の記録が {totals.noFunction} 件あります。
            </>
          )}
          {totals.noPrevious > 0 && (
            <>
              {' '}機能別を記録し始める前の日の分が {totals.noPrevious} 件あります
              （1 日分は累計の差で出すので、機能別は 2 回目の取得から入ります）。
            </>
          )}
        </p>
      )}

      {printerTotals.length > 0 && (
        <section className="dt-section">
          <h2>
            プリンターごとの合計（{periodLabel}・{printerTotals.length} 台）
          </h2>
          <p className="dt-hint">
            期間内の記録を機器ごとに足した枚数です。印刷枚数は
            <strong>モノクロ + カラー</strong>でも<strong>プリンター + コピー</strong>でも
            同じ数になります（どちらも取れている機種の場合）。スキャナは紙に出ないので
            印刷枚数には足していません。枚数を出せなかった日（初回・カウンタの巻き戻し）は
            足さず、「記録日数」にも数えません。その件数は記録日数の横に括弧で添えています。
            内訳を返さない機種は「—」です。
          </p>

          <TableBox className="dt-wrap dt-wrap-short" memoryKey="pageCounts.byPrinter">
            <table className="dt-table">
              <thead>
                <tr>
                  {TOTAL_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'dt-num' : undefined}
                      title={col.title}
                      aria-sort={
                        totalSort.key === col.key
                          ? totalSort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setTotalSort(nextSort(totalSort, col.key))}
                      >
                        {col.label}
                        <span className="dt-arrow" aria-hidden>
                          {totalSort.key === col.key
                            ? totalSort.dir === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {printerTotals.map((row) => (
                  <tr key={row.printerId}>
                    <td title={row.no ? `No.${row.no}` : undefined}>
                      {row.department ?? <span className="dt-muted">—</span>}
                    </td>
                    <td className="dt-mono">{row.ipAddress}</td>
                    <td>{row.model ?? '—'}</td>
                    <td className="dt-num">{num.format(row.pages)}</td>
                    <td className="dt-num">{show(row.mono)}</td>
                    <td className="dt-num">{show(row.color)}</td>
                    <td className="dt-num">{show(row.print)}</td>
                    <td className="dt-num">{show(row.copy)}</td>
                    <td className="dt-num">{show(row.scan)}</td>
                    <td className="dt-num">
                      {row.days}
                      {row.unknown > 0 && (
                        <span
                          className="dt-muted"
                          title={`${row.unknown} 件は枚数を出せていません`}
                        >
                          （+{row.unknown}）
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>合計（{printerTotals.length} 台）</td>
                  <td className="dt-num">{num.format(totals.pages)}</td>
                  <td className="dt-num">{num.format(totals.mono)}</td>
                  <td className="dt-num">{num.format(totals.color)}</td>
                  <td className="dt-num">{show(totals.print)}</td>
                  <td className="dt-num">{show(totals.copy)}</td>
                  <td className="dt-num">{show(totals.scan)}</td>
                  <td className="dt-num">
                    {printerTotals.reduce((sum, row) => sum + row.days, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </TableBox>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="dt-empty">
          この期間の記録がありません。「今すぐ取得」を押すか、12:00 の取得をお待ちください。
          なお 1 日分の枚数は 2 回目の取得から入ります。
        </p>
      ) : (
        <section className="dt-section">
          <h2>日ごとの記録（{rows.length} 件）</h2>
          <p className="dt-hint">
            見出しを押すと並べ替わります。上の段が列のまとまりで、「モノクロ」「カラー」は
            その下の内訳です。内訳を返さない機種は「—」です（0 枚ではありません）。
          </p>

          <TableBox className="dt-wrap" memoryKey="pageCounts.daily">
            <table className="dt-table">
              <thead>
                <tr className="dt-group-row">
                  <th className="dt-plain" colSpan={span('記録')}>
                    記録
                  </th>
                  <th className="dt-plain dt-group-sep" colSpan={span('1日')}>
                    1 日の枚数
                  </th>
                  <th className="dt-plain dt-group-sep" colSpan={span('累計')}>
                    累計
                  </th>
                  <th className="dt-plain dt-group-sep" colSpan={span('プリンター')}>
                    累計プリンター
                  </th>
                  <th className="dt-plain dt-group-sep" colSpan={span('コピー')}>
                    累計コピー
                  </th>
                  <th className="dt-plain dt-group-sep" colSpan={span('スキャナ')}>
                    累計スキャナ（読み取り）
                  </th>
                  {/* 備考は並べ替えの対象ではないので COLUMNS の外に置く */}
                  <th className="dt-plain dt-group-sep" colSpan={span('取得') + 1}>
                    取得
                  </th>
                </tr>
                <tr>
                  {COLUMNS.map((col, index) => (
                    <th
                      key={col.key}
                      className={colClass(index)}
                      title={col.title}
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
                  <th className="dt-plain">備考</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {COLUMNS.map((col, index) => (
                      <td key={col.key} className={colClass(index, true)}>
                        {cellOf(row, col.key)}
                      </td>
                    ))}
                    <td>{noteOf(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableBox>
        </section>
      )}
    </div>
  );
}
