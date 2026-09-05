import { useCallback, useEffect, useMemo, useState } from 'react';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './StockTakeScreen.css';
import { useCompany } from '../lib/company'

/** GET /toner-entries/stock の 1 行 */
type StockRow = {
  id: string;
  name: string | null;
  color: string | null;
  /** データ上の在庫 */
  quantity: number;
  received: number;
  disposed: number;
  updatedAt: string;
};

/** POST /toner-entries/stock-take の戻り */
type TakeResult = {
  tonerId: string;
  name: string | null;
  before: number;
  counted: number;
  diff: number;
  status: 'adjusted' | 'same' | 'unknown';
};

type Mode = 'all' | 'entered' | 'diff';

/**
 * 一覧の列。並べ替えの鍵も兼ねる。
 * counted（実数）と diff（差）は保存値ではなく、入力欄から出した値で並べる
 */
type SortKey =
  | 'id'
  | 'name'
  | 'color'
  | 'quantity'
  | 'counted'
  | 'diff'
  | 'received'
  | 'disposed';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'id', label: 'トナーID', kind: 'text' },
  { key: 'name', label: 'トナー名', kind: 'text' },
  { key: 'color', label: '色', kind: 'text' },
  { key: 'quantity', label: 'データ上の在庫', kind: 'number', numeric: true },
  { key: 'counted', label: '実数', kind: 'number', numeric: true },
  { key: 'diff', label: '差', kind: 'number', numeric: true },
  { key: 'received', label: '搬入累計', kind: 'number', numeric: true },
  { key: 'disposed', label: '廃棄累計', kind: 'number', numeric: true },
];

export default function StockTakeScreen() {
  // 数える対象も書き戻す先も、右上で選んでいる拠点の在庫
  const { companyId } = useCompany()
  const [rows, setRows] = useState<StockRow[]>([]);
  /** 数えた本数。キーはトナーID、値は入力欄の文字列。未入力の行は持たない */
  const [counted, setCounted] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState('');
  const [filter, setFilter] = useState('');
  const [mode, setMode] = useState<Mode>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'id',
    dir: 'asc',
  });
  const [results, setResults] = useState<TakeResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    // 拠点が決まるまで待つ。決まる前に叩くと API が 400 で断る
    if (companyId === null) return;
    try {
      setRows(
        await request<StockRow[]>(`/toner-entries/stock?companyId=${companyId}`),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 入力済みの行だけを数値にして返す。空欄と数値でない入力は数えない */
  const entered = useMemo(() => {
    const map = new Map<string, number>();
    for (const [id, value] of Object.entries(counted)) {
      if (value.trim() === '') continue;
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed >= 0) map.set(id, parsed);
    }
    return map;
  }, [counted]);

  /** 実数 − データ上の在庫。未入力の行は null */
  const diffOf = useCallback(
    (row: StockRow): number | null => {
      const value = entered.get(row.id);
      return value === undefined ? null : value - row.quantity;
    },
    [entered],
  );

  /** 並べ替えの鍵。入力欄から出す値（実数・差）はここで拾う */
  const pick = useCallback(
    (row: StockRow, key: SortKey): unknown => {
      switch (key) {
        case 'counted':
          return entered.get(row.id) ?? null;
        case 'diff':
          return diffOf(row);
        default:
          return row[key];
      }
    },
    [entered, diffOf],
  );

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (needle && !`${row.id} ${row.name ?? ''} ${row.color ?? ''}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (mode === 'entered') return entered.has(row.id);
      if (mode === 'diff') {
        const diff = diffOf(row);
        return diff !== null && diff !== 0;
      }
      return true;
    });

    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      filtered,
      (row) => pick(row, sort.key),
      column?.kind ?? 'text',
      sort.dir,
      // 値が並んだときは API が返した順（品番順）で安定させる
      (row) => rows.indexOf(row),
    );
  }, [rows, filter, mode, entered, diffOf, sort, pick]);

  const summary = useMemo(() => {
    let diffRows = 0;
    let plus = 0;
    let minus = 0;
    for (const row of rows) {
      const diff = diffOf(row);
      if (diff === null || diff === 0) continue;
      diffRows += 1;
      if (diff > 0) plus += diff;
      else minus += -diff;
    }
    return { entered: entered.size, diffRows, plus, minus };
  }, [rows, entered, diffOf]);

  /** 数えた本数で在庫を上書きする。差の無い行は送っても記録されない */
  const submit = async () => {
    if (entered.size === 0) {
      setError('実数を 1 件以上入力してください');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await request<TakeResult[]>('/toner-entries/stock-take', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId.trim(),
          // 数えた結果を書き戻す先。右上で選んでいる拠点の在庫
          companyId,
          counts: [...entered.entries()].map(([tonerId, count]) => ({
            tonerId,
            counted: count,
          })),
        }),
      });

      const adjusted = result.filter((row) => row.status === 'adjusted');
      setResults(adjusted);
      setNotice(
        `${result.length} 件を照合し、${adjusted.length} 件の在庫を調整しました` +
          `（差の無かった ${result.filter((r) => r.status === 'same').length} 件は記録していません）`,
      );
      setCounted({});
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 表示中の行の実数欄に、データ上の在庫をそのまま入れる */
  const fillWithStock = () =>
    setCounted((prev) => {
      const next = { ...prev };
      for (const row of shown) next[row.id] = String(row.quantity);
      return next;
    });

  const clear = () => {
    setCounted({});
    setResults([]);
    setError(null);
    setNotice(null);
  };

  return (
    <div className="st">
      <header className="st-head">
        <h1>棚卸し</h1>
        <p>
          棚で数えた本数を入れると、データ上の在庫との差を出して置き換えます。
          差のあった行だけを履歴（調整）に残すので、あとから差の出た品番と日付をたどれます。
          ユーザーIDは未入力でも構いません（履歴には「ゲスト」として残ります）。
          搬入累計と廃棄累計は「何本入れて何本捨てたか」の記録なので、ここでは動かしません。
        </p>
      </header>

      <div className="st-tools">
        <label>
          <span>ユーザーID（未入力可）</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="職員証を読み取る"
          />
        </label>

        <label>
          <span>絞り込み</span>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="品番・トナー名・色"
          />
        </label>

        <label>
          <span>表示</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="all">すべて（{rows.length} 件）</option>
            <option value="entered">入力済み（{summary.entered} 件）</option>
            <option value="diff">差のある行（{summary.diffRows} 件）</option>
          </select>
        </label>

        <button className="st-sub" onClick={fillWithStock} disabled={busy} type="button">
          表示中に在庫値を入れる
        </button>
        <button onClick={() => void submit()} disabled={busy || summary.entered === 0}>
          {busy ? '反映中…' : `実数を反映（${summary.diffRows} 件調整）`}
        </button>
        <button className="st-sub" onClick={clear} disabled={busy} type="button">
          入力をクリア
        </button>
      </div>

      {error && <p className="st-msg st-msg-error">{error}</p>}
      {notice && <p className="st-msg st-msg-ok">{notice}</p>}

      <dl className="st-summary">
        <div>
          <dt>入力済み</dt>
          <dd>{summary.entered} 件</dd>
        </div>
        <div>
          <dt>差のある行</dt>
          <dd>{summary.diffRows} 件</dd>
        </div>
        <div>
          <dt>棚のほうが多い</dt>
          <dd>+{summary.plus} 本</dd>
        </div>
        <div>
          <dt>棚のほうが少ない</dt>
          <dd>−{summary.minus} 本</dd>
        </div>
      </dl>

      {results.length > 0 && (
        <section className="st-result">
          <h2>直前の調整（{results.length} 件）</h2>
          <ul>
            {results.map((row) => (
              <li key={row.tonerId}>
                <span className="st-rid">{row.tonerId}</span>
                <span className="st-rname">{row.name ?? '—'}</span>
                <span>
                  {row.before} → {row.counted} 本
                </span>
                <span className={row.diff > 0 ? 'st-plus' : 'st-minus'}>
                  {row.diff > 0 ? `+${row.diff}` : row.diff}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shown.length === 0 ? (
        <p className="st-empty">表示できる行がありません。</p>
      ) : (
        <div className="st-table-wrap">
          <table className="st-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={col.numeric ? 'st-num' : undefined}
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
                      <span className="st-arrow" aria-hidden>
                        {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const diff = diffOf(row);
                return (
                  <tr key={row.id} className={diff !== null && diff !== 0 ? 'st-row-diff' : undefined}>
                    <td className="st-mono">{row.id}</td>
                    <td>{row.name ?? '—'}</td>
                    <td>{row.color ?? '—'}</td>
                    <td className="st-num">{row.quantity}</td>
                    <td className="st-num">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={counted[row.id] ?? ''}
                        onChange={(e) =>
                          setCounted((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                        placeholder="—"
                      />
                    </td>
                    <td className="st-num">
                      {diff === null ? (
                        ''
                      ) : diff === 0 ? (
                        <span className="st-same">±0</span>
                      ) : (
                        <span className={diff > 0 ? 'st-plus' : 'st-minus'}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td className="st-num st-muted">{row.received}</td>
                    <td className="st-num st-muted">{row.disposed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
