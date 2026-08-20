import { useCallback, useEffect, useMemo, useState } from 'react';
import { isoDaysAgo, todayIso } from '../lib/date';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './DataTable.css';

/** 1 台 1 日分の記録 */
type DailyCount = {
  id: number;
  printerId: number;
  ipAddress: string;
  model: string | null;
  date: string;
  /** その時点の累計 */
  total: number;
  totalMono: number | null;
  totalColor: number | null;
  /** 期間内の枚数。初回とカウンタ巻き戻しのときは null */
  pages: number | null;
  monoPages: number | null;
  colorPages: number | null;
  spanDays: number;
  capturedAt: string;
};

type SortKey =
  | 'date'
  | 'ipAddress'
  | 'model'
  | 'pages'
  | 'monoPages'
  | 'colorPages'
  | 'total'
  | 'totalMono'
  | 'totalColor'
  | 'capturedAt';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'date', label: '日付', kind: 'date' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip' },
  { key: 'model', label: '機種', kind: 'text' },
  { key: 'pages', label: '印刷枚数', kind: 'number', numeric: true },
  { key: 'monoPages', label: 'モノクロ', kind: 'number', numeric: true },
  { key: 'colorPages', label: 'カラー', kind: 'number', numeric: true },
  { key: 'total', label: '累計', kind: 'number', numeric: true },
  { key: 'totalMono', label: '累計モノクロ', kind: 'number', numeric: true },
  { key: 'totalColor', label: '累計カラー', kind: 'number', numeric: true },
  { key: 'capturedAt', label: '取得時刻', kind: 'date' },
];

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

const num = new Intl.NumberFormat('ja-JP');
const show = (value: number | null) => (value === null ? '—' : num.format(value));

/**
 * 集計表に貼る 1 行分。台帳 1 台につき、
 * split_mono_color が立っていればモノクロ・カラーの 2 行、そうでなければ合計の 1 行になる。
 */
type ExportRow = {
  department: string | null;
  no: string | null;
  kind: 'モノクロ' | 'カラー' | '合計';
  /** 取れていない値は null。貼り付けでは空行にする */
  value: number | null;
};

/** コピー用に台帳から取る分。枚数は保存済みの最新の記録を使う */
type ExportAsset = {
  no: string | null;
  department: string | null;
  /** 集計表でこの機器が占める行。2 行の機器は上下どちらがモノクロかも表ごとに違う */
  countLayout: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
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
  const sorted = [...assets].sort((a, b) =>
    (a.no ?? '').localeCompare(b.no ?? '', 'ja', { numeric: true }),
  );

  const rows: ExportRow[] = [];
  for (const asset of sorted) {
    const base = { department: asset.department, no: asset.no };
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
    else rows.push({ ...base, kind: '合計', value: asset.latest?.total ?? null });
  }
  return rows;
}

/**
 * エクセルの 1 列に貼れる形にする。
 * 区切りは改行だけ。桁区切りを入れると数値として貼れないので入れない
 */
const toClipboardText = (rows: ExportRow[]) =>
  rows.map((row) => (row.value === null ? '' : String(row.value))).join('\n');

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
  const [days, setDays] = useState(30);
  /** 日付を直に指定するか。false のときは直近 days 日 */
  const [byDate, setByDate] = useState(false);
  const [from, setFrom] = useState(() => isoDaysAgo(29));
  const [to, setTo] = useState(() => todayIso());
  const [printerId, setPrinterId] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'date',
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
    const query = byDate ? `from=${from}&to=${to}` : `days=${days}`;
    try {
      setError(null);
      setCounts(await request<DailyCount[]>(`/printers/page-counts?${query}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [byDate, days, from, to]);

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

  /** 絞り込みの選択肢。記録のある機器だけ出す */
  const printers = useMemo(() => {
    const seen = new Map<number, string>();
    counts.forEach((row) => {
      if (!seen.has(row.printerId)) {
        seen.set(row.printerId, `${row.ipAddress}${row.model ? ` (${row.model})` : ''}`);
      }
    });
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1], 'ja'));
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

  const rows = useMemo(() => {
    const filtered =
      printerId === 'all' ? counts : counts.filter((row) => row.printerId === printerId);
    const column = COLUMNS.find((c) => c.key === sort.key);

    return sortRows(filtered, (row) => row[sort.key], column?.kind ?? 'text', sort.dir, (row) => row.id);
  }, [counts, printerId, sort]);

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

  /** 見出しに出す期間。指定か直近かで書き分ける */
  const periodLabel = byDate ? `${from} 〜 ${to}` : `直近 ${days} 日`;

  const noteOf = (row: DailyCount) => {
    if (row.pages === null) {
      return firstDate.get(row.printerId) === row.date
        ? '初回の記録。1 日分は次回から出ます'
        : 'カウンタが前回より小さくなっています（機器交換かリセット）';
    }
    return row.spanDays > 1 ? `${row.spanDays} 日分をまとめた値` : '';
  };

  /** 表示中の合計。null（出せなかった日）は足さない */
  const totals = useMemo(() => {
    const sum = (pick: (row: DailyCount) => number | null) =>
      rows.reduce((acc, row) => acc + (pick(row) ?? 0), 0);

    return {
      pages: sum((r) => r.pages),
      mono: sum((r) => r.monoPages),
      color: sum((r) => r.colorPages),
      unknown: rows.filter((r) => r.pages === null).length,
      /** 内訳を返さない機種の分。合計と内訳の差がここに出る */
      noSplit: rows.filter((r) => r.pages !== null && r.monoPages === null).length,
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
        `${exportRows.length - filled} 行）。集計表の先頭の枚数欄に貼り付けてください`,
    );
    // 押したことが分かる状態を少し残す
    window.setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="dt">
      <header className="dt-head">
        <h1>印刷枚数</h1>
        <p>
          毎日 12:00 に各機器の累計を読み、前回との差を 1 日分として記録しています。
          モノクロ・カラーの内訳は RICOH と Canon、およびモノクロ専用機で取得できます。
        </p>
      </header>

      <div className="dt-tools">
        <label>
          <span>期間</span>
          <select
            value={byDate ? 'range' : String(days)}
            onChange={(e) => {
              const value = e.target.value;
              setByDate(value === 'range');
              if (value !== 'range') setDays(Number(value));
            }}
          >
            {DAY_CHOICES.map((d) => (
              <option key={d} value={d}>
                直近 {d} 日
              </option>
            ))}
            <option value="range">日付を指定</option>
          </select>
        </label>

        {byDate && (
          <>
            <label>
              <span>開始日</span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              <span>終了日</span>
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </>
        )}

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
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <section className="dt-chart">
        <h2>日ごとの印刷枚数</h2>
        {printerId === 'all' ? (
          <p className="dt-chart-hint">
            上の「プリンター」で IP アドレスを選ぶと、その機器の折れ線グラフが出ます。
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
          内訳を返さない機種が {totals.noSplit} 件あるため、モノクロ + カラー
          （{num.format(totals.mono + totals.color)} 枚）は合計（{num.format(totals.pages)} 枚）
          と一致しません。差の {num.format(totals.pages - totals.mono - totals.color)} 枚が
          内訳の取れない分です。
        </p>
      )}

      {rows.length === 0 ? (
        <p className="dt-empty">
          この期間の記録がありません。「今すぐ取得」を押すか、12:00 の取得をお待ちください。
          なお 1 日分の枚数は 2 回目の取得から入ります。
        </p>
      ) : (
        <>
          <p className="dt-hint">
            見出しを押すと並べ替わります。内訳を返さない機種のモノクロ・カラーは「—」です。
          </p>

          <div className="dt-wrap">
            <table className="dt-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'dt-num' : undefined}
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
                    <td>{row.date}</td>
                    <td className="dt-mono">{row.ipAddress}</td>
                    <td>{row.model ?? '—'}</td>
                    <td className="dt-num">{show(row.pages)}</td>
                    <td className="dt-num">{show(row.monoPages)}</td>
                    <td className="dt-num">{show(row.colorPages)}</td>
                    <td className="dt-num">{num.format(row.total)}</td>
                    <td className="dt-num">{show(row.totalMono)}</td>
                    <td className="dt-num">{show(row.totalColor)}</td>
                    <td>{new Date(row.capturedAt).toLocaleString('ja-JP')}</td>
                    <td>{noteOf(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
