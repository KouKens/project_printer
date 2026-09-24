import { useCallback, useEffect, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { CsvValue } from '../lib/csv';
import { num } from '../lib/format';
import { hits, searchWords } from '../lib/search';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './DataTable.css';
import './CostScreen.css';

/** 台 1 台ぶんのカタログ値からの見積り */
type Catalog = {
  /** モノクロ 1 枚ぶんのトナー代（黒・ドラム・廃トナー） */
  baseCostPerPage: number | null;
  /** カラー 1 枚で上に乗るぶん */
  colorCostPerPage: number | null;
  tonerCost: number | null;
  tonerCostPerPage: number | null;
  /** 購入金額を償却年数で割り、期間ぶんに日割りした額 */
  body: number | null;
  /** 保守金額を契約年数で割り、期間ぶんに日割りした額 */
  maint: number | null;
  repairCost: number;
  repairKnown: number;
  total: number | null;
  totalCostPerPage: number | null;
  /** 単価を出せなかった紐づけ品番。あるとトナー代は過小 */
  missingCost: string[];
  tonerCount: number;
};

type CostRow = {
  id: number;
  /** 持っている拠点。全拠点まとめて出すので列として添える */
  company: string | null;
  no: string | null;
  department: string | null;
  maker: string | null;
  model: string | null;
  pages: number | null;
  colorPages: number | null;
  splitKnown: boolean;
  catalog: Catalog;
  /**
   * 実際に持ち出したぶん。紐づけの全品番が「この台だけが使う品番」のときだけ入る。
   * 共用の品番が混じると割り振れないので null
   */
  actual: { tonerCost: number; issues: number } | null;
  actualReason: 'no-toner' | 'shared-toner' | null;
  /** 共用のため割り振れない品番 */
  sharedToners: string[];
};

/** 品番ごとの突き合わせ */
type TonerRow = {
  id: string;
  name: string | null;
  color: string | null;
  isColor: boolean;
  price: number | null;
  yieldPages: number | null;
  costPerPage: number | null;
  assetCount: number;
  pages: number;
  /** カタログどおりなら期間内に何本使うはずか */
  expectedUnits: number | null;
  expectedCost: number | null;
  receivedUnits: number;
  receivedCost: number | null;
  issuedUnits: number;
  issuedCost: number | null;
};

type Costs = {
  period: { from: string; to: string; days: number };
  assumptions: { years: number; maintFeeBasis: 'contract-total' };
  coverage: {
    assets: number;
    withPages: number;
    withPurchasePrice: number;
    withMaint: number;
    missingCostAssets: number;
    unsplitColorAssets: number;
    entries: number;
    /** 実績を割り振れる台。紐づけの全品番がその台専用のもの */
    attributableAssets: number;
  };
  printers: CostRow[];
  toners: TonerRow[];
};

/** 金額。円未満は出さない。未計算は null で渡してハイフンにする */
function money(value: number | null | undefined) {
  if (value === null || value === undefined) return <span className="dt-muted">—</span>;
  return <>{num.format(Math.round(value))}</>;
}

/** 1 枚あたり。銭の桁まで出す。ここが判断の主役なので太字にする */
function perPage(value: number | null | undefined) {
  if (value === null || value === undefined) return <span className="dt-muted">—</span>;
  return <span className="cs-cpp">{value.toFixed(2)}</span>;
}

type PrinterKey =
  | 'company'
  | 'department'
  | 'no'
  | 'model'
  | 'pages'
  | 'tonerCost'
  | 'body'
  | 'maint'
  | 'repairCost'
  | 'total'
  | 'totalCostPerPage'
  | 'actualCost'
  | 'diff';

/** 台ごとの表の列。group で見出しのまとまりを決める */
const PRINTER_COLUMNS: {
  key: PrinterKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
  group: 'asset' | 'catalog' | 'actual' | 'diff';
}[] = [
  { key: 'company', label: '拠点', kind: 'text', group: 'asset' },
  { key: 'department', label: '部署', kind: 'text', group: 'asset' },
  { key: 'no', label: 'No.', kind: 'text', group: 'asset' },
  { key: 'model', label: '機種', kind: 'text', group: 'asset' },
  { key: 'pages', label: '枚数', kind: 'number', numeric: true, group: 'asset' },
  { key: 'tonerCost', label: 'トナー', kind: 'number', numeric: true, group: 'catalog' },
  { key: 'body', label: '本体', kind: 'number', numeric: true, group: 'catalog' },
  { key: 'maint', label: '保守', kind: 'number', numeric: true, group: 'catalog' },
  { key: 'repairCost', label: '修理', kind: 'number', numeric: true, group: 'catalog' },
  { key: 'total', label: '合計', kind: 'number', numeric: true, group: 'catalog' },
  {
    key: 'totalCostPerPage',
    label: '円/枚',
    kind: 'number',
    numeric: true,
    group: 'catalog',
  },
  { key: 'actualCost', label: 'トナー', kind: 'number', numeric: true, group: 'actual' },
  { key: 'diff', label: '差', kind: 'number', numeric: true, group: 'diff' },
];

/** まとまりの見出し。列数はここから数える */
const GROUPS: { key: string; label: string; span: number }[] = [
  { key: 'asset', label: '台帳', span: 4 },
  { key: 'catalog', label: 'カタログ値からの見積り', span: 6 },
  { key: 'actual', label: '実績', span: 1 },
  { key: 'diff', label: '実績 − カタログ', span: 1 },
];

/**
 * その台の実績トナー代 − カタログのトナー代。
 *
 * **1 本も持ち出していない期間では差を出さない。** 期間が短いと「まだ交換していない」
 * だけで実績 0 円になり、差がカタログ値そのままの大きなマイナスに見えてしまう
 */
function diffOf(row: CostRow): number | null {
  if (row.actual === null || row.actual.issues === 0) return null;
  if (row.catalog.tonerCost === null) return null;
  return row.actual.tonerCost - row.catalog.tonerCost;
}

function pickPrinter(row: CostRow, key: PrinterKey): unknown {
  switch (key) {
    case 'company':
    case 'department':
    case 'no':
      return row[key];
    case 'model':
      return [row.maker, row.model].filter(Boolean).join(' ') || null;
    case 'pages':
      return row.pages;
    case 'actualCost':
      return row.actual?.tonerCost ?? null;
    case 'diff':
      return diffOf(row);
    default:
      return row.catalog[key];
  }
}

/** CSV の金額。画面と同じく円未満は出さない。未計算は空欄にする */
const csvYen = (value: number | null | undefined): CsvValue =>
  value === null || value === undefined ? null : Math.round(value);

/** CSV の 1 枚あたり。銭の桁まで。数として読ませたいので円は付けない */
const csvPerPage = (value: number | null | undefined): CsvValue =>
  value === null || value === undefined ? null : Number(value.toFixed(2));

/**
 * 台ごとの CSV。**画面で ※ や棒にしている事情も列にする。**
 * 「単価の出せない品番」「共用で割り振れない品番」が入っていれば、
 * その行のトナー代や実績が欠けていると分かる
 */
const PRINTER_CSV_COLUMNS: { label: string; value: (row: CostRow) => CsvValue }[] = [
  { label: '拠点', value: (row) => row.company },
  { label: '部署', value: (row) => row.department },
  { label: 'No.', value: (row) => row.no },
  { label: 'メーカー', value: (row) => row.maker },
  { label: '型番', value: (row) => row.model },
  { label: '枚数', value: (row) => row.pages },
  { label: 'カラー枚数', value: (row) => row.colorPages },
  { label: 'トナー（カタログ）', value: (row) => csvYen(row.catalog.tonerCost) },
  { label: '本体', value: (row) => csvYen(row.catalog.body) },
  { label: '保守', value: (row) => csvYen(row.catalog.maint) },
  {
    // 費用が 1 件も入っていない台は 0 円ではないので空欄にする
    label: '修理',
    value: (row) =>
      row.catalog.repairKnown === 0 ? null : csvYen(row.catalog.repairCost),
  },
  { label: '合計（カタログ）', value: (row) => csvYen(row.catalog.total) },
  { label: '円/枚', value: (row) => csvPerPage(row.catalog.totalCostPerPage) },
  { label: 'トナー（実績）', value: (row) => csvYen(row.actual?.tonerCost) },
  { label: '持出本数', value: (row) => row.actual?.issues ?? null },
  { label: '差（実績 − カタログ）', value: (row) => csvYen(diffOf(row)) },
  { label: '単価の出せない品番', value: (row) => row.catalog.missingCost.join(' / ') },
  { label: '共用で割り振れない品番', value: (row) => row.sharedToners.join(' / ') },
];

/** 品番ごとの CSV。画面の表と同じ列 */
const TONER_CSV_COLUMNS: { label: string; value: (row: TonerRow) => CsvValue }[] = [
  { label: '品番', value: (row) => row.id },
  { label: '名前', value: (row) => row.name },
  { label: '色', value: (row) => row.color },
  { label: '円/枚', value: (row) => csvPerPage(row.costPerPage) },
  { label: '対象枚数', value: (row) => row.pages },
  {
    label: '想定本数',
    value: (row) =>
      row.expectedUnits === null ? null : Number(row.expectedUnits.toFixed(2)),
  },
  { label: '想定金額', value: (row) => csvYen(row.expectedCost) },
  { label: '搬入本数', value: (row) => row.receivedUnits },
  { label: '搬入支出', value: (row) => csvYen(row.receivedCost) },
  { label: '持出本数', value: (row) => row.issuedUnits },
  { label: '持出金額', value: (row) => csvYen(row.issuedCost) },
  {
    // 1 本も持ち出していない品番は差を出さない（画面と同じ扱い）
    label: '差（持出 − 想定）',
    value: (row) =>
      row.issuedUnits === 0 || row.issuedCost === null || row.expectedCost === null
        ? null
        : csvYen(row.issuedCost - row.expectedCost),
  },
];

/**
 * 差を横棒で出す。0 を中心に、左（緑）が想定より安い・右（赤）が高い。
 * 数字だけだと大小を追えないので、幅で並べて見えるようにする
 */
function DiffBar({ value, scale }: { value: number | null; scale: number }) {
  if (value === null || scale <= 0) {
    return <span className="dt-muted">—</span>;
  }

  const ratio = Math.min(Math.abs(value) / scale, 1);
  const width = `${(ratio * 50).toFixed(1)}%`;
  const over = value > 0;

  return (
    <span className="cs-diff">
      <span className="cs-diff-bar" aria-hidden>
        <span
          className={over ? 'cs-diff-fill cs-diff-over' : 'cs-diff-fill cs-diff-under'}
          style={over ? { left: '50%', width } : { right: '50%', width }}
        />
        <span className="cs-diff-zero" />
      </span>
      <span className={over ? 'cs-over' : 'cs-under'}>
        {over ? '+' : '−'}
        {num.format(Math.round(Math.abs(value)))}
      </span>
    </span>
  );
}

export default function CostScreen() {
  const [data, setData] = useState<Costs | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [years, setYears] = useState('5');
  const [sort, setSort] = useState<{ key: PrinterKey; dir: SortDir }>({
    key: 'totalCostPerPage',
    dir: 'desc',
  });
  /** 表ごとの「探す」。取ってある行をこの場で絞るだけで、API は叩かない */
  const [query, setQuery] = useState('');
  const [tonerQuery, setTonerQuery] = useState('');
  const [tonerSort, setTonerSort] = useState<{ key: keyof TonerRow; dir: SortDir }>({
    key: 'expectedCost',
    dir: 'desc',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (years) params.set('years', years);
      const query = params.toString();
      const loaded = await request<Costs>(`/costs${query ? `?${query}` : ''}`);
      setData(loaded);
      // 期間を空で開いたときは、返ってきた既定の範囲を欄に入れて見せる
      setFrom((prev) => prev || loaded.period.from);
      setTo((prev) => prev || loaded.period.to);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, [from, to, years]);

  useEffect(() => {
    void load();
    // 起動時に 1 回だけ。以降は「計算する」を押したときに読み直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(() => {
    if (!data) return [];
    const words = searchWords(query);
    const found = data.printers.filter((row) =>
      hits([row.company, row.no, row.department, row.maker, row.model], words),
    );

    const column = PRINTER_COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      found,
      (row) => pickPrinter(row, sort.key),
      column?.kind ?? 'text',
      sort.dir,
      (row) => data.printers.indexOf(row),
    );
  }, [data, sort, query]);

  const shownToners = useMemo(() => {
    if (!data) return [];
    const words = searchWords(tonerQuery);
    const found = data.toners.filter((row) => hits([row.id, row.name, row.color], words));

    return sortRows(
      found,
      (row) => row[tonerSort.key],
      typeof data.toners[0]?.[tonerSort.key] === 'string' ? 'text' : 'number',
      tonerSort.dir,
      (row) => data.toners.indexOf(row),
    );
  }, [data, tonerSort, tonerQuery]);

  /**
   * 合計。差の棒の目盛りにも使う。
   * **足すのはいま出ている台だけ。** 探す欄で絞ったのに合計が全台のままだと、
   * 表の下の「合計」が並んでいる行の和に見えて食い違う
   */
  const totals = useMemo(() => {
    if (!data) return null;
    const sum = (pick: (row: CostRow) => number | null) =>
      shown.reduce((total, row) => total + (pick(row) ?? 0), 0);

    const diffs = shown
      .map(diffOf)
      .filter((value): value is number => value !== null);

    return {
      pages: sum((row) => row.pages),
      toner: sum((row) => row.catalog.tonerCost),
      body: sum((row) => row.catalog.body),
      maint: sum((row) => row.catalog.maint),
      repair: sum((row) => row.catalog.repairCost),
      total: sum((row) => row.catalog.total),
      actual: shown.some((row) => row.actual !== null)
        ? sum((row) => row.actual?.tonerCost ?? null)
        : null,
      diff: diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) : null,
      /** 棒の目盛り。いちばん大きい差に合わせる */
      scale: diffs.length > 0 ? Math.max(...diffs.map(Math.abs)) : 0,
    };
  }, [data, shown]);

  const cellOf = (row: CostRow, key: PrinterKey) => {
    switch (key) {
      // 全拠点をまとめて出す画面なので、どこの機器かを示す
      case 'company':
        return row.company ?? <span className="dt-muted">—</span>;
      case 'department':
        return row.department ?? <span className="dt-muted">—</span>;
      case 'no':
        return row.no ? `No.${row.no}` : <span className="dt-muted">—</span>;
      case 'model':
        return [row.maker, row.model].filter(Boolean).join(' ') || '—';
      case 'pages':
        if (row.pages === null) {
          return (
            <span className="dt-muted" title="実機と結び付いておらず、枚数の記録がありません">
              —
            </span>
          );
        }
        return (
          <span
            title={
              row.colorPages === null
                ? 'カラーの内訳が取れていないため、トナー代はモノクロ単価だけの下限値です'
                : `うちカラー ${num.format(row.colorPages)} 枚`
            }
          >
            {num.format(row.pages)}
            {row.colorPages !== null && row.colorPages > 0 && (
              <span className="cs-color-pages"> / {num.format(row.colorPages)}</span>
            )}
            {row.colorPages === null && <span className="cs-warn"> ※</span>}
          </span>
        );
      case 'tonerCost':
        return (
          <span
            title={[
              row.catalog.baseCostPerPage === null
                ? 'トナーの単価が出せません（価格か印刷可能枚数が未登録）'
                : `モノクロ 1 枚 ${row.catalog.baseCostPerPage.toFixed(2)} 円`,
              row.catalog.colorCostPerPage === null
                ? null
                : `カラー 1 枚は +${row.catalog.colorCostPerPage.toFixed(2)} 円`,
              row.catalog.missingCost.length > 0
                ? `単価が出せない品番: ${row.catalog.missingCost.join(', ')}`
                : null,
            ]
              .filter(Boolean)
              .join('\n')}
          >
            {money(row.catalog.tonerCost)}
            {row.catalog.missingCost.length > 0 && <span className="cs-warn"> ※</span>}
          </span>
        );
      case 'body':
        return money(row.catalog.body);
      case 'maint':
        return money(row.catalog.maint);
      case 'repairCost':
        return row.catalog.repairKnown === 0 ? (
          <span className="dt-muted">—</span>
        ) : (
          money(row.catalog.repairCost)
        );
      case 'total':
        return money(row.catalog.total);
      case 'totalCostPerPage':
        return perPage(row.catalog.totalCostPerPage);
      case 'actualCost':
        if (row.actual === null) {
          return (
            <span
              className="dt-muted"
              title={
                row.actualReason === 'no-toner'
                  ? 'この台にトナーが登録されていません'
                  : '他の台と共用している品番があり、持ち出しをこの台に割り振れません' +
                    `（${row.sharedToners.join(', ')}）`
              }
            >
              —
            </span>
          );
        }
        return (
          <span
            title={
              row.actual.issues === 0
                ? 'この期間はこの台のトナーを 1 本も持ち出していません'
                : `${row.actual.issues} 本の持ち出し`
            }
          >
            {money(row.actual.tonerCost)}
            {row.actual.issues > 0 && (
              <span className="cs-units"> / {row.actual.issues} 本</span>
            )}
          </span>
        );
      case 'diff':
        return <DiffBar value={diffOf(row)} scale={totals?.scale ?? 0} />;
    }
  };

  const head = (key: PrinterKey, label: string, numeric?: boolean) => (
    <th
      key={key}
      className={numeric ? 'dt-num' : ''}
      aria-sort={
        sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button type="button" onClick={() => setSort(nextSort(sort, key))}>
        {label}
        <span className="dt-arrow" aria-hidden>
          {sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
        </span>
      </button>
    </th>
  );

  const tonerHead = (key: keyof TonerRow, label: string) => (
    <th
      className="dt-num"
      aria-sort={
        tonerSort.key === key
          ? tonerSort.dir === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <button type="button" onClick={() => setTonerSort(nextSort(tonerSort, key))}>
        {label}
        <span className="dt-arrow" aria-hidden>
          {tonerSort.key === key ? (tonerSort.dir === 'asc' ? '▲' : '▼') : ''}
        </span>
      </button>
    </th>
  );

  return (
    <div className="dt cs">
      <header className="dt-head">
        <h1>運用コスト</h1>
        <p>
          カタログ値から見積もった費用と、実際に使ったぶんを同じ期間・同じ枚数で並べます。
          カタログ側はトナーの「価格 ÷ 印刷可能枚数」に、本体の償却・保守・修理を足したもの。
          実績側はトナーの搬入と持ち出しの記録が元になります。右端が差です。
        </p>
      </header>

      <div className="dt-tools">
        <label>
          <span>期間（開始）</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          <span>期間（終了）</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label>
          <span>本体の償却年数</span>
          <select value={years} onChange={(e) => setYears(e.target.value)}>
            {['3', '4', '5', '6', '7'].map((value) => (
              <option key={value} value={value}>
                {value} 年
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => void load()} disabled={busy} type="button">
          {busy ? '計算中…' : '計算する'}
        </button>
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}

      {data && totals && (
        <>
          <dl className="dt-summary">
            <div>
              <dt>期間</dt>
              <dd className="dt-period">
                {data.period.from} 〜 {data.period.to}
              </dd>
            </div>
            <div>
              <dt>印刷枚数</dt>
              <dd>{num.format(totals.pages)} 枚</dd>
            </div>
            <div>
              <dt>カタログ合計</dt>
              <dd>{num.format(Math.round(totals.total))} 円</dd>
            </div>
            <div>
              <dt>実績合計</dt>
              <dd className={totals.actual === null ? 'cs-empty' : undefined}>
                {totals.actual === null
                  ? '—'
                  : `${num.format(Math.round(totals.actual))} 円`}
              </dd>
            </div>
            <div>
              <dt>差</dt>
              <dd className={totals.diff === null ? 'cs-empty' : undefined}>
                {totals.diff === null
                  ? '—'
                  : `${totals.diff > 0 ? '+' : '−'}${num.format(
                      Math.abs(Math.round(totals.diff)),
                    )} 円`}
              </dd>
            </div>
            <div>
              <dt>1 枚あたり（カタログ）</dt>
              <dd>
                {totals.pages > 0 ? (totals.total / totals.pages).toFixed(2) : '—'} 円
              </dd>
            </div>
          </dl>

          <p className="dt-msg cs-msg-note">
            {data.coverage.entries === 0 ? (
              <>
                <b>この期間のトナーの記録が 0 件なので、実績側は空です。</b>{' '}
                持ち出し・搬入を受け付けると入ります。
              </>
            ) : (
              <>
                この期間のトナーの記録は {data.coverage.entries} 件です。
              </>
            )}{' '}
            <b>
              台ごとの実績は、その台だけが使う品番（{data.coverage.attributableAssets} 台）でしか出せません。
            </b>
            持ち出しの記録が品番と人だけで、行き先のプリンターを残していないためです。
            1 種類のトナーを最大 12 台で共用しているので、共用品番は台に割り振れません。
            受付でプリンターを選ぶようにすれば、残りの{' '}
            {data.coverage.assets - data.coverage.attributableAssets} 台も出せます。
          </p>

          <p className="dt-hint">
            差は「実績 − カタログ」です。1 本も持ち出していない期間は、まだ交換していないだけで
            実績が 0 円になるため、差を出しません（ハイフン）。
          </p>

          <p className="dt-legend">
            <span className="cs-swatch cs-swatch-under" aria-hidden />
            実績が見積りより安い
            <span className="cs-swatch cs-swatch-over" aria-hidden />
            実績が見積りより高い
            <span className="dt-legend-note">
              カタログ値は A4・画像面積率 5% が前提です。差の主な正体は実際の面積率と、
              使い切る前の交換です。※ の付いた行は値が欠けており、
              トナー代が過小に出ています（{data.coverage.missingCostAssets} 台は単価の出せない品番あり、
              {data.coverage.unsplitColorAssets} 台はカラーの内訳が取れていません）。
              本体は購入金額を {data.assumptions.years} 年で割り、保守は契約金額を契約年数で割って、
              どちらも期間の {data.period.days} 日ぶんに日割りしています。
            </span>
          </p>

          <div className="dt-section">
            <h2>
              台ごと（{data.coverage.assets} 台）
              <CsvButton
                name="運用コスト_台ごと"
                header={PRINTER_CSV_COLUMNS.map((col) => col.label)}
                rows={() =>
                  shown.map((row) => PRINTER_CSV_COLUMNS.map((col) => col.value(row)))
                }
                count={shown.length}
              />
            </h2>
            <p className="dt-hint">
              枚数が取れているのは {data.coverage.withPages} 台、購入金額があるのは{' '}
              {data.coverage.withPurchasePrice} 台、保守金額があるのは{' '}
              {data.coverage.withMaint} 台です。欠けている項目は 0 として足さず、
              合計を控えめに出します。
              {query.trim() !== '' && (
                <>
                  {' '}
                  <strong>
                    いまは探す欄で絞っているので、上の合計と表の下の合計は
                    出ている {shown.length} 台ぶんです。
                  </strong>
                </>
              )}
            </p>

            <div className="sbx-row">
              <SearchBox
                value={query}
                onChange={setQuery}
                label="探す（台ごと）"
                placeholder="拠点・部署・No.・メーカー・型番"
                count={shown.length}
                total={data.printers.length}
                unit="台"
              />
            </div>

            <TableBox className="dt-wrap" memoryKey="cost.printers">
              <table className="dt-table cs-table">
                <thead>
                  <tr className="dt-group-row">
                    {GROUPS.map((group) => (
                      <th
                        key={group.key}
                        colSpan={group.span}
                        /*
                         * dt-plain が無いと見出しの余白が 0 になり、
                         * 2 段目を 33px 下げている sticky の位置と食い違って文字が重なる
                         */
                        className={
                          group.key === 'asset' ? 'dt-plain' : 'dt-plain dt-group-sep'
                        }
                      >
                        {group.label}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {PRINTER_COLUMNS.map((col) => head(col.key, col.label, col.numeric))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => (
                    <tr key={row.id} className={row.pages === null ? 'dt-down' : undefined}>
                      {PRINTER_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={[
                            col.numeric ? 'dt-num' : '',
                            col.group !== 'asset' &&
                            PRINTER_COLUMNS.find((c) => c.group === col.group)?.key ===
                              col.key
                              ? 'dt-group-sep'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {cellOf(row, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>合計</td>
                    <td className="dt-num">{num.format(totals.pages)}</td>
                    <td className="dt-num dt-group-sep">{money(totals.toner)}</td>
                    <td className="dt-num">{money(totals.body)}</td>
                    <td className="dt-num">{money(totals.maint)}</td>
                    <td className="dt-num">{money(totals.repair)}</td>
                    <td className="dt-num">{money(totals.total)}</td>
                    <td className="dt-num">
                      {perPage(totals.pages > 0 ? totals.total / totals.pages : null)}
                    </td>
                    <td className="dt-num dt-group-sep">{money(totals.actual)}</td>
                    <td className="dt-num dt-group-sep">
                      <DiffBar value={totals.diff} scale={totals.scale} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </TableBox>
          </div>

          <div className="dt-section">
            <h2>
              品番ごと（{data.toners.length} 品番）
              <CsvButton
                name="運用コスト_品番ごと"
                header={TONER_CSV_COLUMNS.map((col) => col.label)}
                rows={() =>
                  shownToners.map((row) =>
                    TONER_CSV_COLUMNS.map((col) => col.value(row)),
                  )
                }
                count={shownToners.length}
              />
            </h2>
            <p className="dt-hint">
              台に割り振らずに突き合わせます。**持ち出しの記録があれば、こちらは今の履歴のままでも差が出ます。**
              「想定」は期間内の枚数をカタログの印刷可能枚数で割った本数、「持出」は実際に棚から出した本数です。
            </p>

            <div className="sbx-row">
              <SearchBox
                value={tonerQuery}
                onChange={setTonerQuery}
                label="探す（品番ごと）"
                placeholder="品番・トナー名・色"
                count={shownToners.length}
                total={data.toners.length}
                unit="品番"
              />
            </div>

            <TableBox className="dt-wrap dt-wrap-short" memoryKey="cost.toners">
              <table className="dt-table cs-table">
                <thead>
                  <tr className="dt-group-row">
                    <th className="dt-plain" colSpan={4}>
                      品番
                    </th>
                    <th className="dt-plain dt-group-sep" colSpan={2}>
                      カタログ値からの想定
                    </th>
                    <th className="dt-plain dt-group-sep" colSpan={4}>
                      実績
                    </th>
                    <th className="dt-plain dt-group-sep">持出 − 想定</th>
                  </tr>
                  <tr>
                    <th className="dt-plain">品番</th>
                    <th className="dt-plain">名前</th>
                    {tonerHead('costPerPage', '円/枚')}
                    {tonerHead('pages', '対象枚数')}
                    {tonerHead('expectedUnits', '本数')}
                    {tonerHead('expectedCost', '金額')}
                    {tonerHead('receivedUnits', '搬入')}
                    {tonerHead('receivedCost', '支出')}
                    {tonerHead('issuedUnits', '持出')}
                    {tonerHead('issuedCost', '金額')}
                    <th className="dt-num dt-plain">差</th>
                  </tr>
                </thead>
                <tbody>
                  {shownToners.map((row) => {
                    const diff =
                      row.issuedCost !== null && row.expectedCost !== null
                        ? row.issuedCost - row.expectedCost
                        : null;
                    return (
                      <tr key={row.id}>
                        <td className="dt-mono">{row.id}</td>
                        <td className="cs-name" title={row.name ?? ''}>
                          {row.name ?? '—'}
                        </td>
                        <td className="dt-num">{perPage(row.costPerPage)}</td>
                        <td className="dt-num">{num.format(row.pages)}</td>
                        <td className="dt-num dt-group-sep">
                          {row.expectedUnits === null ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            row.expectedUnits.toFixed(2)
                          )}
                        </td>
                        <td className="dt-num">{money(row.expectedCost)}</td>
                        <td className="dt-num dt-group-sep">
                          {row.receivedUnits === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            row.receivedUnits
                          )}
                        </td>
                        <td className="dt-num">
                          {row.receivedUnits === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            money(row.receivedCost)
                          )}
                        </td>
                        <td className="dt-num">
                          {row.issuedUnits === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            row.issuedUnits
                          )}
                        </td>
                        <td className="dt-num">
                          {row.issuedUnits === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            money(row.issuedCost)
                          )}
                        </td>
                        <td className="dt-num dt-group-sep">
                          {diff === null || row.issuedUnits === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            <span className={diff > 0 ? 'cs-over' : 'cs-under'}>
                              {diff > 0 ? '+' : '−'}
                              {num.format(Math.abs(Math.round(diff)))}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableBox>
          </div>
        </>
      )}
    </div>
  );
}
