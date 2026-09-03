import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { DeliveryCheckRow, EntryRow, OrderRow } from '../api';
import {
  deleteEntry,
  deleteOrder,
  fetchDeliveryCheck,
  fetchEntryHistory,
  fetchOrders,
} from '../api';
import { num } from '../lib/format';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import './DataTable.css';
import './DeliveryScreen.css';
import { useCompany } from '../lib/company'

/** 受付の区分の呼び名。棚卸しの調整も履歴には出てくる */
const ACTION_LABEL: Record<string, string> = {
  REGISTER: '登録',
  RECEIVE: '搬入',
  ISSUE: '持ち出し',
  DISPOSE: '廃棄',
  ADJUST: '棚卸し調整',
};

/** 突き合わせの状態。色と文言はここで一元管理する */
const STATUS: Record<
  DeliveryCheckRow['status'],
  { label: string; className: string; note: string }
> = {
  match: {
    label: '一致',
    className: 'dl-ok',
    note: '注文した本数どおり搬入されています',
  },
  short: {
    label: '不足',
    className: 'dl-short',
    note: '注文より搬入が少ない状態です（未着・欠品）',
  },
  over: {
    label: '超過',
    className: 'dl-over',
    note: '注文より多く搬入されています',
  },
  waiting: {
    label: '搬入待ち',
    className: 'dl-wait',
    note: '次回搬入日がまだ来ていません',
  },
  'no-order': {
    label: '注文なし',
    className: 'dl-noorder',
    note: '注文の記録が無い搬入です',
  },
  undated: {
    label: '日付なし',
    className: 'dl-undated',
    note: '次回搬入日が未入力なので搬入と突き合わせられません',
  },
};

const stamp = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const DAY_CHOICES = [30, 60, 90, 180, 365];

type CheckKey = 'date' | 'tonerId' | 'ordered' | 'received' | 'diff' | 'status';

const CHECK_COLUMNS: {
  key: CheckKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'date', label: '搬入日', kind: 'date' },
  { key: 'tonerId', label: 'トナーID', kind: 'text' },
  { key: 'ordered', label: '注文', kind: 'number', numeric: true },
  { key: 'received', label: '搬入', kind: 'number', numeric: true },
  { key: 'diff', label: '差', kind: 'number', numeric: true },
  { key: 'status', label: '状態', kind: 'text', numeric: false },
];

type EntryKey = 'createdAt' | 'receivedOn' | 'action' | 'tonerId' | 'quantity' | 'balance' | 'userId';

const ENTRY_COLUMNS: {
  key: EntryKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'createdAt', label: '受付日時', kind: 'date' },
  { key: 'receivedOn', label: '搬入日', kind: 'date' },
  { key: 'action', label: '区分', kind: 'text' },
  { key: 'tonerId', label: 'トナーID', kind: 'text' },
  { key: 'quantity', label: '本数', kind: 'number', numeric: true },
  { key: 'balance', label: '操作後の在庫', kind: 'number', numeric: true },
  { key: 'userId', label: '担当', kind: 'text' },
];

/** 差の符号付き表示。0 は「—」にせず 0 と出す（一致していることが分かるように） */
const signed = (value: number) =>
  value > 0 ? `+${num.format(value)}` : num.format(value);

export default function DeliveryScreen() {
  // 入出庫は会社ごとに見る
  const { companyId } = useCompany()
  const [checks, setChecks] = useState<DeliveryCheckRow[]>([]);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [days, setDays] = useState(90);
  const [action, setAction] = useState<'' | 'RECEIVE' | 'ISSUE' | 'DISPOSE'>('');
  /** 突き合わせを問題のある行だけに絞る */
  const [onlyIssues, setOnlyIssues] = useState(false);
  /** 明細を開いている行 */
  const [open, setOpen] = useState<string | null>(null);
  const [checkSort, setCheckSort] = useState<{ key: CheckKey; dir: SortDir }>({
    key: 'date',
    dir: 'desc',
  });
  const [entrySort, setEntrySort] = useState<{ key: EntryKey; dir: SortDir }>({
    key: 'createdAt',
    dir: 'desc',
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [check, history, orderRows] = await Promise.all([
        fetchDeliveryCheck(days),
        fetchEntryHistory(days, action || undefined, companyId ?? undefined),
        companyId === null ? Promise.resolve([]) : fetchOrders(companyId),
      ]);
      setChecks(check);
      setEntries(history);
      setOrders(orderRows);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [days, action, companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 受付の記録を取り消す。**在庫も操作の逆で戻る**ので、確認を挟む。
   * 戻せないもの（棚卸しの調整、すでに持ち出した搬入）は API 側で断られ、
   * 理由がそのまま画面に出る
   */
  const removeEntry = async (row: EntryRow) => {
    const label = `${ACTION_LABEL[row.action] ?? row.action} ${row.tonerId} ${row.quantity} 本`;
    if (!window.confirm(`${label} の記録を取り消します。在庫も戻ります。よろしいですか。`)) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await deleteEntry(row.id);
      setNotice(`${label} を取り消しました（${row.tonerId} の在庫 ${result.stock} 本）`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 注文を取り消す。在庫は動いていないので、消えるのは注文の記録だけ */
  const removeOrder = async (row: OrderRow) => {
    const label = `${row.tonerId} ${row.quantity} 本の注文`;
    if (!window.confirm(`${label} を取り消します。よろしいですか。`)) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await deleteOrder(row.id);
      setNotice(`${label} を取り消しました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(
    () => ({
      mismatch: checks.filter(
        (row) => row.status === 'short' || row.status === 'over',
      ).length,
      waiting: checks.filter((row) => row.status === 'waiting').length,
      noOrder: checks.filter((row) => row.status === 'no-order').length,
      undated: checks.filter((row) => row.status === 'undated').length,
      received: entries
        .filter((row) => row.action === 'RECEIVE')
        .reduce((sum, row) => sum + row.quantity, 0),
      issued: entries
        .filter((row) => row.action === 'ISSUE')
        .reduce((sum, row) => sum + row.quantity, 0),
      disposed: entries
        .filter((row) => row.action === 'DISPOSE')
        .reduce((sum, row) => sum + row.quantity, 0),
      pending: orders.filter((row) => row.status === 'PENDING').length,
    }),
    [checks, entries, orders],
  );

  const shownChecks = useMemo(() => {
    const filtered = onlyIssues
      ? checks.filter(
          (row) =>
            row.status === 'short' ||
            row.status === 'over' ||
            row.status === 'no-order',
        )
      : checks;

    const column = CHECK_COLUMNS.find((c) => c.key === checkSort.key);
    return sortRows(
      filtered,
      (row) => (checkSort.key === 'status' ? STATUS[row.status].label : row[checkSort.key]),
      column?.kind ?? 'text',
      checkSort.dir,
      (row) => checks.indexOf(row),
    );
  }, [checks, checkSort, onlyIssues]);

  const shownEntries = useMemo(() => {
    const column = ENTRY_COLUMNS.find((c) => c.key === entrySort.key);
    return sortRows(
      entries,
      (row) => (entrySort.key === 'action' ? ACTION_LABEL[row.action] : row[entrySort.key]),
      column?.kind ?? 'text',
      entrySort.dir,
      (row) => row.id,
    );
  }, [entries, entrySort]);

  return (
    <div className="dt dl">
      <header className="dt-head">
        <h1>入出庫</h1>
        <p>
          注文した本数と、実際に搬入された本数を突き合わせます。突き合わせの鍵は
          <strong>「品番 ＋ 日付」</strong>で、注文の「次回搬入日」と受付の「搬入日」が
          同じものを 1 行にまとめて数を比べます。数が合わない行には色が付きます。
          下に受付の履歴（搬入・持ち出し・廃棄）と注文の一覧を並べています。
        </p>
      </header>

      <div className="dt-tools">
        <label>
          <span>期間</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {DAY_CHOICES.map((d) => (
              <option key={d} value={d}>
                直近 {d} 日
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>履歴の区分</span>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as typeof action)}
          >
            <option value="">すべて</option>
            <option value="RECEIVE">搬入だけ</option>
            <option value="ISSUE">持ち出しだけ</option>
            <option value="DISPOSE">廃棄だけ</option>
          </select>
        </label>

        <label className="dl-check">
          <input
            type="checkbox"
            checked={onlyIssues}
            onChange={(e) => setOnlyIssues(e.target.checked)}
          />
          <span>数が合わない行だけ出す</span>
        </label>

        <button onClick={() => void load()} type="button">
          読み直す
        </button>
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <dl className="dt-summary">
        <div>
          <dt>数が合わない</dt>
          <dd className={counts.mismatch > 0 ? 'dl-alert' : undefined}>
            {counts.mismatch} 件
          </dd>
        </div>
        <div>
          <dt>搬入待ち</dt>
          <dd>{counts.waiting} 件</dd>
        </div>
        <div>
          <dt>注文なしの搬入</dt>
          <dd>{counts.noOrder} 件</dd>
        </div>
        <div>
          <dt>搬入（期間内）</dt>
          <dd>{num.format(counts.received)} 本</dd>
        </div>
        <div>
          <dt>持ち出し（期間内）</dt>
          <dd>{num.format(counts.issued)} 本</dd>
        </div>
        <div>
          <dt>廃棄（期間内）</dt>
          <dd>{num.format(counts.disposed)} 本</dd>
        </div>
      </dl>

      <p className="dt-legend">
        {(['short', 'over', 'no-order', 'waiting', 'undated'] as const).map((key) => (
          <span className={`dl-badge ${STATUS[key].className}`} key={key} title={STATUS[key].note}>
            {STATUS[key].label}
          </span>
        ))}
        <span className="dt-legend-note">
          注文を取り消した行（CANCELED）は本数に数えません。次回搬入日を入れていない注文は
          突き合わせられないので「日付なし」にまとめます（{counts.undated} 件）。
          行を押すと、その注文と搬入の明細が出ます。
        </span>
      </p>

      <section className="dt-section">
        <h2>注文と搬入の突き合わせ（{shownChecks.length} 件）</h2>

        {shownChecks.length === 0 ? (
          <p className="dt-empty">
            {onlyIssues
              ? 'この期間に数の合わない行はありません。'
              : 'この期間に注文も搬入もありません。'}
          </p>
        ) : (
          <div className="dt-wrap dt-wrap-short">
            <table className="dt-table">
              <thead>
                <tr>
                  <th className="dt-plain dl-toggle-head" aria-label="明細" />
                  {CHECK_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'dt-num' : undefined}
                      aria-sort={
                        checkSort.key === col.key
                          ? checkSort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setCheckSort(nextSort(checkSort, col.key))}
                      >
                        {col.label}
                        <span className="dt-arrow" aria-hidden>
                          {checkSort.key === col.key
                            ? checkSort.dir === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="dt-plain">トナー名</th>
                </tr>
              </thead>
              <tbody>
                {shownChecks.map((row) => {
                  const state = STATUS[row.status];
                  const expanded = open === row.key;

                  return (
                    <Fragment key={row.key}>
                      <tr className={`dl-row-${row.status}${expanded ? ' dl-row-open' : ''}`}>
                        <td className="dl-toggle">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            title="注文と搬入の明細"
                            onClick={() => setOpen(expanded ? null : row.key)}
                          >
                            {expanded ? '▾' : '▸'}
                          </button>
                        </td>
                        <td>{row.date ?? <span className="dt-muted">未定</span>}</td>
                        <td className="dt-mono">{row.tonerId}</td>
                        <td className="dt-num">{num.format(row.ordered)}</td>
                        <td className="dt-num">{num.format(row.received)}</td>
                        <td className="dt-num">
                          {row.ordered === 0 ? (
                            <span className="dt-muted">—</span>
                          ) : (
                            <span className={row.diff === 0 ? undefined : 'dl-diff'}>
                              {signed(row.diff)}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`dl-badge ${state.className}`} title={state.note}>
                            {state.label}
                          </span>
                        </td>
                        <td>{row.name ?? <span className="dt-muted">—</span>}</td>
                      </tr>

                      {expanded && (
                        <tr className="dl-detail">
                          <td colSpan={CHECK_COLUMNS.length + 2}>
                            <div className="dl-detail-grid">
                              <div>
                                <h3>注文（{row.orders.length} 件）</h3>
                                {row.orders.length === 0 ? (
                                  <p className="dt-muted">注文の記録がありません</p>
                                ) : (
                                  <ul>
                                    {row.orders.map((order) => (
                                      <li key={order.id}>
                                        <span className="dl-when">
                                          {stamp.format(new Date(order.orderedAt))}
                                        </span>
                                        <span className="dl-qty">{order.quantity} 本</span>
                                        <span className="dt-muted">{order.status}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              <div>
                                <h3>搬入（{row.entries.length} 件）</h3>
                                {row.entries.length === 0 ? (
                                  <p className="dt-muted">まだ搬入されていません</p>
                                ) : (
                                  <ul>
                                    {row.entries.map((entry) => (
                                      <li key={entry.id}>
                                        <span className="dl-when">
                                          {stamp.format(new Date(entry.createdAt))}
                                        </span>
                                        <span className="dl-qty">{entry.quantity} 本</span>
                                        <span className="dt-muted">{entry.userId}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dt-section">
        <h2>受付の履歴（{shownEntries.length} 件）</h2>
        <p className="dt-hint">
          搬入・持ち出し・廃棄の記録です。搬入日が入るのは搬入だけで、
          それ以外はハイフンになります。
        </p>

        {shownEntries.length === 0 ? (
          <p className="dt-empty">この期間の記録がありません。</p>
        ) : (
          <div className="dt-wrap dt-wrap-short">
            <table className="dt-table">
              <thead>
                <tr>
                  {ENTRY_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'dt-num' : undefined}
                      aria-sort={
                        entrySort.key === col.key
                          ? entrySort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setEntrySort(nextSort(entrySort, col.key))}
                      >
                        {col.label}
                        <span className="dt-arrow" aria-hidden>
                          {entrySort.key === col.key
                            ? entrySort.dir === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="dt-plain">トナー名</th>
                  <th className="dt-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {shownEntries.map((row) => (
                  <tr key={row.id}>
                    <td>{stamp.format(new Date(row.createdAt))}</td>
                    <td>{row.receivedOn ?? <span className="dt-muted">—</span>}</td>
                    <td>
                      <span className={`dl-action dl-action-${row.action.toLowerCase()}`}>
                        {ACTION_LABEL[row.action] ?? row.action}
                      </span>
                    </td>
                    <td className="dt-mono">{row.tonerId}</td>
                    <td className="dt-num">{num.format(row.quantity)}</td>
                    <td className="dt-num">{num.format(row.balance)}</td>
                    <td>{row.userId}</td>
                    <td>{row.name ?? <span className="dt-muted">—</span>}</td>
                    <td className="dt-ops">
                      <button
                        className="dl-danger"
                        disabled={busy || row.action === 'ADJUST'}
                        onClick={() => void removeEntry(row)}
                        title={
                          row.action === 'ADJUST'
                            ? '棚卸しの調整は取り消せません'
                            : '記録を取り消し、在庫も戻します'
                        }
                        type="button"
                      >
                        取消
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dt-section">
        <h2>注文の一覧（直近 {orders.length} 件 / 未入荷 {counts.pending} 件）</h2>

        {orders.length === 0 ? (
          <p className="dt-empty">注文の記録がありません。</p>
        ) : (
          <div className="dt-wrap dt-wrap-short">
            <table className="dt-table">
              <thead>
                <tr>
                  <th className="dt-plain">注文日時</th>
                  <th className="dt-plain">次回搬入日</th>
                  <th className="dt-plain">トナーID</th>
                  <th className="dt-plain dt-num">本数</th>
                  <th className="dt-plain">状態</th>
                  <th className="dt-plain">トナー名</th>
                  <th className="dt-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{stamp.format(new Date(order.orderedAt))}</td>
                    <td>
                      {order.deliveryOn ?? <span className="dt-muted">未定</span>}
                    </td>
                    <td className="dt-mono">{order.tonerId}</td>
                    <td className="dt-num">{num.format(order.quantity)}</td>
                    <td>{order.status}</td>
                    <td>{order.name ?? <span className="dt-muted">—</span>}</td>
                    <td className="dt-ops">
                      <button
                        className="dl-danger"
                        disabled={busy}
                        onClick={() => void removeOrder(order)}
                        title="注文の記録を取り消します。在庫は動きません"
                        type="button"
                      >
                        取消
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
