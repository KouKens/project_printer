import { useCallback, useEffect, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import { isMeterUnit } from '../lib/counter';
import { isoDaysAgo, todayIso } from '../lib/date';
import { num } from '../lib/format';
import { request } from '../lib/request';
import { ipToNumber, nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import './DataTable.css';
import './LabelMeterScreen.css';

/**
 * ラベルプリンターの印字状況。
 *
 * **枚数ではなく長さ（メートル）で数える。** SATO の HC4-LX は
 * prtMarkerCounterUnit に 17（メートル）を返し、累計カウンタは印字した長さになる。
 * ラベル 1 枚の長さを機器が持っていないので、枚数には換算できない。
 * 「印刷状況」の画面と分けてあるのは、長さと枚数を混ぜて合計しないため
 */

type DailyCount = {
  id: number;
  printerId: number;
  ipAddress: string;
  model: string | null;
  department: string | null;
  no: string | null;
  counterUnit: number | null;
  date: string;
  /** その時点の累計印字長（m） */
  total: number;
  /** 期間内の印字長（m）。初回とカウンタ巻き戻しのときは null */
  pages: number | null;
  spanDays: number;
  capturedAt: string;
};

/** 機器ごとの合計 */
type PrinterTotal = {
  printerId: number;
  label: string;
  ipAddress: string;
  /** 期間内の印字長（m）。出せなかった日は足さない */
  meters: number;
  /** 最新の累計（m） */
  total: number;
  /** 出せなかった日数。初回とカウンタ巻き戻し */
  unknownDays: number;
  days: number;
};

const DAY_CHOICES = [7, 30, 60, 90, 180];

const show = (value: number | null) =>
  value === null ? <span className="dt-muted">—</span> : <>{num.format(value)}</>;

/** 台の呼び名。部署が引けない台帳もあるので No.・IP で代替する */
function labelOf(row: DailyCount): string {
  return (
    [row.department, row.no ? `No.${row.no}` : null].filter(Boolean).join(' ') ||
    row.ipAddress
  );
}

/**
 * 機器ごとにまとめる。
 * 累計は期間内で最も新しい日の値を採る（日付の降順で来ている前提にしない）
 */
function totalsByPrinter(rows: DailyCount[]): PrinterTotal[] {
  const map = new Map<number, PrinterTotal & { latest: string }>();

  for (const row of rows) {
    const found = map.get(row.printerId);
    const slot = found ?? {
      printerId: row.printerId,
      label: labelOf(row),
      ipAddress: row.ipAddress,
      meters: 0,
      total: row.total,
      unknownDays: 0,
      days: 0,
      latest: row.date,
    };

    if (row.pages === null) slot.unknownDays += 1;
    else slot.meters += row.pages;
    slot.days += 1;

    if (row.date >= slot.latest) {
      slot.latest = row.date;
      slot.total = row.total;
    }

    map.set(row.printerId, slot);
  }

  // latest は「どの日の累計を採るか」を決めるためだけの作業用なので落とす
  return [...map.values()].map((slot) => ({
    printerId: slot.printerId,
    label: slot.label,
    ipAddress: slot.ipAddress,
    meters: slot.meters,
    total: slot.total,
    unknownDays: slot.unknownDays,
    days: slot.days,
  }));
}

type TotalKey = 'label' | 'ipAddress' | 'meters' | 'total' | 'days';
type DailyKey = 'date' | 'label' | 'pages' | 'total' | 'spanDays';

const TOTAL_COLUMNS: {
  key: TotalKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'label', label: '設置場所', kind: 'text' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip' },
  { key: 'meters', label: '期間内の印字長（m）', kind: 'number', numeric: true },
  { key: 'total', label: '累計（m）', kind: 'number', numeric: true },
  { key: 'days', label: '記録日数', kind: 'number', numeric: true },
];

const DAILY_COLUMNS: {
  key: DailyKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'date', label: '日付', kind: 'date' },
  { key: 'label', label: '設置場所', kind: 'text' },
  { key: 'pages', label: '印字長（m）', kind: 'number', numeric: true },
  { key: 'total', label: '累計（m）', kind: 'number', numeric: true },
  { key: 'spanDays', label: '日数', kind: 'number', numeric: true },
];

/**
 * CSV の見出し。**単位（m）を列の名前に入れておく。**
 * この画面だけ長さで数えるので、枚数の CSV と並べたときに取り違えない
 */
const TOTAL_CSV_HEADER = [
  '設置場所',
  'IP アドレス',
  '期間内の印字長（m）',
  '累計（m）',
  '記録日数',
  '出せなかった日数',
];

const DAILY_CSV_HEADER = [
  '日付',
  '設置場所',
  'IP アドレス',
  '印字長（m）',
  '累計（m）',
  '日数',
];

export default function LabelMeterScreen() {
  const [counts, setCounts] = useState<DailyCount[]>([]);
  const [days, setDays] = useState(30);
  const [byDate, setByDate] = useState(false);
  const [from, setFrom] = useState(() => isoDaysAgo(29));
  const [to, setTo] = useState(() => todayIso());
  const [printerId, setPrinterId] = useState<number | 'all'>('all');
  const [totalSort, setTotalSort] = useState<{ key: TotalKey; dir: SortDir }>({
    key: 'meters',
    dir: 'desc',
  });
  const [dailySort, setDailySort] = useState<{ key: DailyKey; dir: SortDir }>({
    key: 'date',
    dir: 'desc',
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const query = byDate ? `from=${from}&to=${to}` : `days=${days}`;
    try {
      setError(null);
      const rows = await request<DailyCount[]>(`/printers/page-counts?${query}`);
      // 長さで数える機器だけ。枚で数える機器は「印刷状況」の担当
      setCounts(rows.filter((row) => isMeterUnit(row.counterUnit)));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [byDate, days, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 絞り込みの選択肢。記録のある機器だけ、設置場所の順に出す */
  const printers = useMemo(() => {
    const seen = new Map<number, { label: string; ip: string }>();
    for (const row of counts) {
      if (!seen.has(row.printerId)) {
        seen.set(row.printerId, { label: labelOf(row), ip: row.ipAddress });
      }
    }
    return [...seen.entries()]
      .sort(
        (a, b) =>
          a[1].label.localeCompare(b[1].label, 'ja') ||
          ipToNumber(a[1].ip) - ipToNumber(b[1].ip),
      )
      .map(([id, item]) => [id, item.label] as [number, string]);
  }, [counts]);

  const shown = useMemo(
    () =>
      printerId === 'all'
        ? counts
        : counts.filter((row) => row.printerId === printerId),
    [counts, printerId],
  );

  const totals = useMemo(() => {
    const column = TOTAL_COLUMNS.find((c) => c.key === totalSort.key);
    return sortRows(
      totalsByPrinter(shown),
      (row) => row[totalSort.key],
      column?.kind ?? 'text',
      totalSort.dir,
      (row) => row.printerId,
    );
  }, [shown, totalSort]);

  const daily = useMemo(() => {
    const rows = shown.map((row) => ({ ...row, label: labelOf(row) }));
    const column = DAILY_COLUMNS.find((c) => c.key === dailySort.key);
    return sortRows(
      rows,
      (row) => row[dailySort.key],
      column?.kind ?? 'text',
      dailySort.dir,
      (row) => row.id,
    );
  }, [shown, dailySort]);

  /** 表示中の合計。出せなかった日は足さない */
  const sum = useMemo(
    () => ({
      meters: shown.reduce((acc, row) => acc + (row.pages ?? 0), 0),
      unknown: shown.filter((row) => row.pages === null).length,
      printers: new Set(shown.map((row) => row.printerId)).size,
    }),
    [shown],
  );

  const periodLabel = byDate ? `${from} 〜 ${to}` : `直近 ${days} 日`;

  const head = <K extends string>(
    key: K,
    label: string,
    numeric: boolean | undefined,
    sort: { key: K; dir: SortDir },
    setSort: (next: { key: K; dir: SortDir }) => void,
  ) => (
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

  return (
    <div className="dt lm">
      <header className="dt-head">
        <h1>ラベル印字状況</h1>
        <p>
          SATO のラベルプリンター（HC4-LX）の印字量です。この機種は
          <strong>枚数ではなく印字した長さ（メートル）</strong>をカウンタに持つため、
          「印刷状況」とは分けています。ラベル 1 枚の長さは機器が持っていないので、
          枚数には換算できません。
        </p>
      </header>

      {error && (
        <p className="dt-msg dt-msg-error" role="alert">
          {error}
        </p>
      )}

      <div className="dt-tools">
        <label>
          <input
            type="checkbox"
            checked={byDate}
            onChange={(e) => setByDate(e.target.checked)}
          />
          <span>日付で指定</span>
        </label>

        {byDate ? (
          <>
            <label>
              <span>開始</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label>
              <span>終了</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        ) : (
          <label>
            <span>期間</span>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {DAY_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                  直近 {choice} 日
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span>プリンター</span>
          <select
            value={printerId}
            onChange={(e) =>
              setPrinterId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">すべて</option>
            {printers.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="dt-summary">
        <div>
          <dt>期間</dt>
          <dd className="dt-period">{periodLabel}</dd>
        </div>
        <div>
          <dt>台数</dt>
          <dd>{sum.printers} 台</dd>
        </div>
        <div>
          <dt>印字長の合計</dt>
          <dd>{num.format(sum.meters)} m</dd>
        </div>
      </dl>

      {sum.unknown > 0 && (
        <p className="dt-hint">
          出せなかった日が {sum.unknown} 件あります（初回の記録か、カウンタが前回より
          小さくなった日）。合計には入れていません。
        </p>
      )}

      {counts.length === 0 ? (
        <p className="dt-empty">
          この期間に記録がありません。日次の記録は毎日 12 時に取られます。
        </p>
      ) : (
        <>
          <section className="dt-section">
            <h2>
              機器ごとの合計
              <CsvButton
                name="ラベル印字状況_機器ごと"
                header={TOTAL_CSV_HEADER}
                rows={() =>
                  totals.map((row) => [
                    row.label,
                    row.ipAddress,
                    row.meters,
                    row.total,
                    row.days,
                    row.unknownDays,
                  ])
                }
                count={totals.length}
              />
            </h2>
            <div className="dt-wrap">
              <table>
                <thead>
                  <tr>
                    {TOTAL_COLUMNS.map((c) =>
                      head(c.key, c.label, c.numeric, totalSort, setTotalSort),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {totals.map((row) => (
                    <tr key={row.printerId}>
                      <td>{row.label}</td>
                      <td className="dt-mono">{row.ipAddress}</td>
                      <td className="dt-num lm-meters">{num.format(row.meters)}</td>
                      <td className="dt-num">{num.format(row.total)}</td>
                      <td className="dt-num">
                        {row.days}
                        {row.unknownDays > 0 && (
                          <span className="dt-muted"> （{row.unknownDays} 日は不明）</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2}>合計</th>
                    <td className="dt-num lm-meters">{num.format(sum.meters)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="dt-section">
            <h2>
              日ごと
              <CsvButton
                name="ラベル印字状況_日ごと"
                header={DAILY_CSV_HEADER}
                rows={() =>
                  daily.map((row) => [
                    row.date,
                    row.label,
                    row.ipAddress,
                    // 出せなかった日（初回・カウンタ巻き戻し）は 0 m ではないので空欄
                    row.pages,
                    row.total,
                    row.spanDays,
                  ])
                }
                count={daily.length}
              />
            </h2>
            <div className="dt-wrap">
              <table>
                <thead>
                  <tr>
                    {DAILY_COLUMNS.map((c) =>
                      head(c.key, c.label, c.numeric, dailySort, setDailySort),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {daily.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.label}</td>
                      <td className="dt-num lm-meters">{show(row.pages)}</td>
                      <td className="dt-num">{num.format(row.total)}</td>
                      <td className="dt-num">
                        {row.spanDays > 1 ? (
                          <span title={`${row.spanDays} 日分をまとめた値`}>
                            {row.spanDays}
                          </span>
                        ) : (
                          row.spanDays
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
