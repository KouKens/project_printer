import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { DeliveryCheckRow, EntryRow, OrderRow } from '../api';
import {
  deleteEntry,
  deleteOrder,
  fetchDeliveryCheck,
  fetchEntryHistory,
  fetchHiddenTonerIds,
  fetchOrders,
  orderStatusLabel,
  receiveOrders,
  unreceiveOrder,
} from '../api';
import { num } from '../lib/format';
import { hits, searchWords } from '../lib/search';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import './DataTable.css';
import './DeliveryScreen.css';

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

/*
 * **この画面は全拠点を並べる。** 3 つの表とも、日付の次に「拠点」の列を置く
 * （在庫と受け払いは拠点ごとなので、どこの記録かが無いと読めない）。
 * 拠点名は API が行に添えて返す。画面の拠点一覧は有効なものだけなので、
 * 無効にした拠点の記録でも名前が出るようにするため
 */

type CheckKey =
  | 'date'
  | 'company'
  | 'tonerId'
  | 'ordered'
  | 'received'
  | 'diff'
  | 'status';

const CHECK_COLUMNS: {
  key: CheckKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'date', label: '搬入日', kind: 'date' },
  { key: 'company', label: '拠点', kind: 'text' },
  { key: 'tonerId', label: 'トナーID', kind: 'text' },
  { key: 'ordered', label: '注文', kind: 'number', numeric: true },
  { key: 'received', label: '搬入', kind: 'number', numeric: true },
  { key: 'diff', label: '差', kind: 'number', numeric: true },
  { key: 'status', label: '状態', kind: 'text', numeric: false },
];

type EntryKey =
  | 'createdAt'
  | 'receivedOn'
  | 'company'
  | 'action'
  | 'tonerId'
  | 'quantity'
  | 'balance'
  | 'userId';

const ENTRY_COLUMNS: {
  key: EntryKey;
  label: string;
  kind: CellKind;
  numeric?: boolean;
}[] = [
  { key: 'createdAt', label: '受付日時', kind: 'date' },
  { key: 'receivedOn', label: '搬入日', kind: 'date' },
  { key: 'company', label: '拠点', kind: 'text' },
  { key: 'action', label: '区分', kind: 'text' },
  { key: 'tonerId', label: 'トナーID', kind: 'text' },
  { key: 'quantity', label: '本数', kind: 'number', numeric: true },
  // その拠点の在庫。全拠点の合計ではない
  { key: 'balance', label: '操作後の在庫', kind: 'number', numeric: true },
  { key: 'userId', label: '担当', kind: 'text' },
];

/** 差の符号付き表示。0 は「—」にせず 0 と出す（一致していることが分かるように） */
const signed = (value: number) =>
  value > 0 ? `+${num.format(value)}` : num.format(value);

/**
 * CSV の日時。**画面の `stamp`（月日と時刻だけ）ではなく年まで出す。**
 * ファイルは期間をまたいで並べるので、年が無いと突き合わせられない
 */
const csvStamp = (value: string) => new Date(value).toLocaleString('ja-JP');

/** 突き合わせの CSV。画面の表と同じ列に、トナー名を添える */
const CHECK_CSV_HEADER = [
  '搬入日',
  '拠点',
  'トナーID',
  'トナー名',
  '注文',
  '搬入',
  '差',
  '状態',
  '入荷',
  '注文の件数',
  '搬入の件数',
];

/**
 * 突き合わせの行の入荷の状態。表では札、CSV では文字にする。
 * 注文の無い行（搬入だけ）は注文が無いので出さない
 */
function rowReceipt(row: DeliveryCheckRow): string | null {
  if (row.orders.length === 0) return null;
  if (row.pendingOrderIds.length > 0) return '未入荷あり';
  if (!row.settled) return null;
  return row.orders.some((order) => order.receiveMode === 'MANUAL')
    ? '入荷済み（手動）'
    : '入荷済み';
}

/** 受付の履歴の CSV */
const ENTRY_CSV_HEADER = [
  '受付日時',
  '搬入日',
  '拠点',
  '区分',
  'トナーID',
  'トナー名',
  '色',
  '本数',
  '操作後の在庫',
  '担当',
];

/** 注文の一覧の CSV */
const ORDER_CSV_HEADER = [
  '注文日時',
  '次回搬入日',
  '拠点',
  'トナーID',
  'トナー名',
  '本数',
  '状態',
  '注文した人',
];

export default function DeliveryScreen() {
  /*
   * API から届いたままの行。**画面が使うのは下の checks / entries / orders**
   * （他の画面に出さない品番の行を落としたもの）
   */
  const [allChecks, setChecks] = useState<DeliveryCheckRow[]>([]);
  const [allEntries, setEntries] = useState<EntryRow[]>([]);
  /**
   * 履歴が上限で切れたか。切れているのに黙って出すと、
   * 並んだものがその期間の全部だと読めてしまう
   */
  const [truncated, setTruncated] = useState<{ limit: number } | null>(null);
  const [allOrders, setOrders] = useState<OrderRow[]>([]);
  /** トナー登録で「表示」を外した品番。無効にしたものも入る */
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  /** 表示を外した品番の記録も出すか。既定は出さない（トナー登録の印に従う） */
  const [showHidden, setShowHidden] = useState(false);
  const [days, setDays] = useState(90);
  const [action, setAction] = useState<'' | 'RECEIVE' | 'ISSUE' | 'DISPOSE'>('');
  /** 突き合わせを問題のある行だけに絞る */
  const [onlyIssues, setOnlyIssues] = useState(false);
  /** 明細を開いている行 */
  const [open, setOpen] = useState<string | null>(null);
  /*
   * 表ごとの「探す」。**表が 3 つあるので文字も 3 つ持つ。**
   * どれも取ってある行をこの場で絞るだけで、API は叩かない
   */
  const [checkQuery, setCheckQuery] = useState('');
  const [entryQuery, setEntryQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
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

  /*
   * 他の画面に出さない品番の行を落とす。**黙っては落とさない** ——
   * 落とした件数を上に出し、「表示を外した品番も出す」で戻せるようにする
   * （実際に使った品番の表示を外すと、その記録が見えなくなるため）。
   * 上の集計・探す欄・CSV はどれも落としたあとの行から作る
   */
  const visible = useCallback(
    (row: { tonerId: string }) => showHidden || !hiddenIds.has(row.tonerId),
    [hiddenIds, showHidden],
  );
  const checks = useMemo(() => allChecks.filter(visible), [allChecks, visible]);
  const entries = useMemo(() => allEntries.filter(visible), [allEntries, visible]);
  const orders = useMemo(() => allOrders.filter(visible), [allOrders, visible]);
  /** 表示を外した品番の行の数。印を外していても数える（戻したときに何件出るか分かるように） */
  const hiddenRows = useMemo(() => {
    const isHidden = (row: { tonerId: string }) => hiddenIds.has(row.tonerId);
    return (
      allChecks.filter(isHidden).length +
      allEntries.filter(isHidden).length +
      allOrders.filter(isHidden).length
    );
  }, [allChecks, allEntries, allOrders, hiddenIds]);

  const load = useCallback(async () => {
    // 全拠点を取る。拠点は行ごとに列で出す（上の集計も全拠点の合計）
    try {
      const [check, history, orderRows, hidden] = await Promise.all([
        fetchDeliveryCheck(days),
        fetchEntryHistory(days, action || undefined),
        fetchOrders(),
        // 隠す品番は補助。取れなくても記録はそのまま全部出す
        fetchHiddenTonerIds().catch(() => [] as string[]),
      ]);
      setChecks(check);
      setEntries(history.rows);
      setTruncated(history.truncated ? { limit: history.limit } : null);
      setOrders(orderRows);
      setHiddenIds(new Set(hidden));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [days, action]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 受付の記録を取り消す。**在庫も操作の逆で戻る**ので、確認を挟む。
   * 戻せないもの（棚卸しの調整、すでに持ち出した搬入）は API 側で断られ、
   * 理由がそのまま画面に出る
   */
  const removeEntry = async (row: EntryRow) => {
    // 全拠点が並ぶので、どの拠点の記録（どの拠点の在庫が戻るか）を必ず添える
    const label =
      `${row.companyName}の${ACTION_LABEL[row.action] ?? row.action} ` +
      `${row.tonerId} ${row.quantity} 本`;
    if (!window.confirm(`${label} の記録を取り消します。在庫も戻ります。よろしいですか。`)) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await deleteEntry(row.id);
      setNotice(
        `${label} を取り消しました（${row.companyName}の ${row.tonerId} の在庫 ${result.stock} 本）`,
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 一致しなかった行の注文を、手動で入荷済みにする。
   *
   * 一致した行は搬入を受け付けた時点で自動で入荷済みになっているので、ここは
   * 数が合わないまま「届いた」とするとき（残りを業者が取り消した、搬入日を違う日で
   * 受け付けた、次回搬入日を入れずに注文した、など）。在庫は動かない
   */
  const receiveRow = async (row: DeliveryCheckRow) => {
    const pending = row.orders.filter((order) => order.status === 'PENDING');
    const bottles = pending.reduce((sum, order) => sum + order.quantity, 0);
    const label =
      `${row.companyName}の ${row.tonerId}（搬入日 ${row.date ?? '未定'}）の注文 ` +
      `${pending.length} 件・${bottles} 本`;
    if (
      !window.confirm(
        `${label}を入荷済みにします。\n\n` +
          `注文 ${row.ordered} 本に対して、搬入の記録は ${row.received} 本です` +
          `（${STATUS[row.status].label}）。数が合わないまま手動で入荷済みにします。\n` +
          '在庫は動きません。間違えたときは注文の一覧の「未入荷に戻す」で戻せます。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await receiveOrders(row.pendingOrderIds);
      setNotice(`${label}を入荷済み（手動）にしました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 注文の一覧から 1 件だけ手動で入荷済みにする */
  const receiveOne = async (row: OrderRow) => {
    const label = `${row.companyName}の ${row.tonerId} ${row.quantity} 本の注文`;
    if (
      !window.confirm(
        `${label}を入荷済み（手動）にします。在庫は動きません。\n` +
          '搬入の記録と本数が合っていれば、搬入を受け付けた時点で自動で入荷済みになります。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await receiveOrders([row.id]);
      setNotice(`${label}を入荷済み（手動）にしました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 手動で入荷済みにした注文を未入荷に戻す。押し間違えの後始末。
   * 戻したあとで搬入と本数が合っていれば、API が自動の入荷済みに決め直すので、
   * 戻り値の状態をそのまま知らせる
   */
  const unreceive = async (row: OrderRow) => {
    const label = `${row.companyName}の ${row.tonerId} ${row.quantity} 本の注文`;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await unreceiveOrder(row.id);
      setNotice(
        result.status === 'PENDING'
          ? `${label}を未入荷に戻しました`
          : `${label}は搬入の記録と本数が一致しているので、入荷済み（自動）になりました`,
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 注文を取り消す。在庫は動いていないので、消えるのは注文の記録だけ */
  const removeOrder = async (row: OrderRow) => {
    const label = `${row.companyName}の ${row.tonerId} ${row.quantity} 本の注文`;
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
      // 手動で入荷済みにした行は、人が確かめたものとして数えない
      mismatch: checks.filter(
        (row) => (row.status === 'short' || row.status === 'over') && !row.settled,
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

  /**
   * 「数の合わない行だけ」を当てたあとの行。**「探す」の分母はここ。**
   * この期間の全件のまま出すと、チェックを入れてから探したときに、
   * チェックが落とした行まで探した結果に見える
   */
  const baseChecks = useMemo(
    () =>
      checks.filter(
        (row) =>
          !onlyIssues ||
          // 手動で入荷済みにした行は片付いたものとして外す
          ((row.status === 'short' || row.status === 'over') && !row.settled) ||
          row.status === 'no-order',
      ),
    [checks, onlyIssues],
  );

  const shownChecks = useMemo(() => {
    const words = searchWords(checkQuery);
    const filtered = baseChecks.filter((row) =>
      hits([row.companyName, row.tonerId, row.name, row.color, row.date], words),
    );

    const column = CHECK_COLUMNS.find((c) => c.key === checkSort.key);
    return sortRows(
      filtered,
      (row) =>
        checkSort.key === 'status'
          ? STATUS[row.status].label
          : checkSort.key === 'company'
            ? row.companyName
            : row[checkSort.key],
      column?.kind ?? 'text',
      checkSort.dir,
      (row) => checks.indexOf(row),
    );
  }, [checks, baseChecks, checkSort, checkQuery]);

  const shownEntries = useMemo(() => {
    const words = searchWords(entryQuery);
    const found = entries.filter((row) =>
      hits(
        [
          row.companyName,
          row.tonerId,
          row.name,
          row.color,
          row.userId,
          ACTION_LABEL[row.action] ?? row.action,
          row.receivedOn,
          row.createdAt.slice(0, 10),
        ],
        words,
      ),
    );

    const column = ENTRY_COLUMNS.find((c) => c.key === entrySort.key);
    return sortRows(
      found,
      (row) =>
        entrySort.key === 'action'
          ? ACTION_LABEL[row.action]
          : entrySort.key === 'company'
            ? row.companyName
            : row[entrySort.key],
      column?.kind ?? 'text',
      entrySort.dir,
      (row) => row.id,
    );
  }, [entries, entrySort, entryQuery]);

  /** 注文の一覧。並べ替えは持たないので、絞るだけ（API が返した順のまま） */
  const shownOrders = useMemo(() => {
    const words = searchWords(orderQuery);
    return orders.filter((row) =>
      hits(
        [
          row.companyName,
          row.tonerId,
          row.name,
          row.userId,
          orderStatusLabel(row),
          row.deliveryOn,
          row.orderedAt.slice(0, 10),
        ],
        words,
      ),
    );
  }, [orders, orderQuery]);

  return (
    <div className="dt dl">
      <header className="dt-head">
        <h1>入出庫</h1>
        <p>
          <strong>全拠点</strong>の注文した本数と、実際に搬入された本数を突き合わせます。
          突き合わせの鍵は<strong>「拠点 ＋ 品番 ＋ 日付」</strong>で、同じ拠点の注文の
          「次回搬入日」と受付の「搬入日」が同じものを 1 行にまとめて数を比べます
          （別の拠点の搬入は混ざりません）。数が合わない行には色が付きます。
          下に受付の履歴（搬入・持ち出し・廃棄）と注文の一覧を並べています。
          拠点ごとに見るときは、探す欄に拠点名を入れてください。
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

        {hiddenIds.size > 0 && (
          <label
            className="dl-check"
            title="トナー登録で「表示」を外した品番の記録です。印を付けるとこの画面にも出します"
          >
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            <span>表示を外した品番も出す</span>
          </label>
        )}

        <button onClick={() => void load()} type="button">
          読み直す
        </button>
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}
      {!showHidden && hiddenRows > 0 && (
        <p className="dt-msg dt-msg-warn">
          トナー登録で「表示」を外した品番の記録 {hiddenRows} 件を出していません
          （上の集計にも入っていません）。出すときは「表示を外した品番も出す」に印を付けてください。
        </p>
      )}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}
      {truncated && (
        <p className="dt-msg dt-msg-warn">
          履歴が多いため、新しい順に {truncated.limit} 件までを出しています。
          これより前の分は表示していません。日数を短くするか区分で絞ってください
        </p>
      )}

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
          <strong>「一致」した注文は、搬入を受け付けた時点で自動で入荷済みになります。</strong>
          一致しない行は「入荷済みにする」で手動で入荷済みにでき、「数が合わない」からも外れます。
          搬入の記録を取り消して一致しなくなると、自動で入荷済みにした注文は未入荷に戻ります
          （手動のものは戻りません）。未入荷の注文は、プリンター状況の毎日チェックに「注文中」として出ます。
        </span>
      </p>

      <section className="dt-section">
        <h2>
          注文と搬入の突き合わせ（{shownChecks.length} 件）
          <CsvButton
            name="トナー入出状況_突き合わせ"
            header={CHECK_CSV_HEADER}
            rows={() =>
              shownChecks.map((row) => [
                row.date,
                row.companyName,
                row.tonerId,
                row.name,
                row.ordered,
                row.received,
                // 注文が無い行の差は画面でもハイフン。数として意味を持たない
                row.ordered === 0 ? null : row.diff,
                STATUS[row.status].label,
                rowReceipt(row),
                row.orders.length,
                row.entries.length,
              ])
            }
            count={shownChecks.length}
          />
        </h2>

        <div className="sbx-row">
          <SearchBox
            value={checkQuery}
            onChange={setCheckQuery}
            label="探す（突き合わせ）"
            placeholder="拠点・品番・トナー名・色・日付"
            count={shownChecks.length}
            total={baseChecks.length}
          />
        </div>

        {shownChecks.length === 0 ? (
          <p className="dt-empty">
            {checkQuery.trim() !== ''
              ? `「${checkQuery}」に当てはまる行がありません（この期間は ${checks.length} 件）。`
              : onlyIssues
                ? 'この期間に数の合わない行はありません。'
                : 'この期間に注文も搬入もありません。'}
          </p>
        ) : (
          <TableBox className="dt-wrap dt-wrap-short" memoryKey="delivery.check">
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
                  <th className="dt-plain">入荷</th>
                  <th className="dt-plain">トナー名</th>
                </tr>
              </thead>
              <tbody>
                {shownChecks.map((row) => {
                  const state = STATUS[row.status];
                  const expanded = open === row.key;

                  return (
                    <Fragment key={row.key}>
                      <tr
                        className={[
                          `dl-row-${row.status}`,
                          // 一致以外で片付いた行（手動で入荷済み）は色を弱める
                          row.settled && row.status !== 'match' ? 'dl-row-settled' : '',
                          expanded ? 'dl-row-open' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
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
                        <td>{row.companyName}</td>
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
                        <td className="dl-receipt">
                          {/*
                            * 一致した行は自動で入荷済みになっているので、ボタンが出るのは
                            * 一致しないまま未入荷の注文が残っている行だけ
                            */}
                          {row.pendingOrderIds.length > 0 && row.status !== 'match' ? (
                            <button
                              className="dl-receive"
                              disabled={busy}
                              onClick={() => void receiveRow(row)}
                              title="数が合わないまま、この行の未入荷の注文を入荷済みにします（在庫は動きません）"
                              type="button"
                            >
                              入荷済みにする
                            </button>
                          ) : rowReceipt(row) ? (
                            <span
                              className={
                                rowReceipt(row) === '入荷済み（手動）'
                                  ? 'dl-badge dl-received-manual'
                                  : 'dl-badge dl-received'
                              }
                              title={
                                rowReceipt(row) === '入荷済み（手動）'
                                  ? '数が合わないまま、手動で入荷済みにしました'
                                  : '搬入の記録と本数が一致したので、自動で入荷済みにしました'
                              }
                            >
                              {rowReceipt(row)}
                            </span>
                          ) : (
                            <span className="dt-muted">—</span>
                          )}
                        </td>
                        <td>{row.name ?? <span className="dt-muted">—</span>}</td>
                      </tr>

                      {expanded && (
                        <tr className="dl-detail">
                          <td colSpan={CHECK_COLUMNS.length + 3}>
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
                                        <span className="dt-muted">
                                          {orderStatusLabel(order)}
                                          {order.receivedAt
                                            ? `（${stamp.format(new Date(order.receivedAt))}）`
                                            : ''}
                                        </span>
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
          </TableBox>
        )}
      </section>

      <section className="dt-section">
        <h2>
          受付の履歴（{shownEntries.length} 件）
          <CsvButton
            name="トナー入出状況_受付の履歴"
            header={ENTRY_CSV_HEADER}
            rows={() =>
              shownEntries.map((row) => [
                csvStamp(row.createdAt),
                row.receivedOn,
                row.companyName,
                ACTION_LABEL[row.action] ?? row.action,
                row.tonerId,
                row.name,
                row.color,
                row.quantity,
                row.balance,
                row.userId,
              ])
            }
            count={shownEntries.length}
            title={
              truncated
                ? `いま出ている ${shownEntries.length} 件を保存します。履歴は上限で切れているので、これが期間の全部ではありません`
                : undefined
            }
          />
        </h2>
        <p className="dt-hint">
          搬入・持ち出し・廃棄の記録です。搬入日が入るのは搬入だけで、
          それ以外はハイフンになります。操作後の在庫はその拠点の在庫です（全拠点の合計ではありません）。
        </p>

        <div className="sbx-row">
          <SearchBox
            value={entryQuery}
            onChange={setEntryQuery}
            label="探す（受付の履歴）"
            placeholder="拠点・品番・トナー名・区分・ユーザーID・日付"
            count={shownEntries.length}
            total={entries.length}
          />
        </div>

        {shownEntries.length === 0 ? (
          <p className="dt-empty">
            {entryQuery.trim() !== ''
              ? `「${entryQuery}」に当てはまる記録がありません（この期間は ${entries.length} 件）。`
              : 'この期間の記録がありません。'}
          </p>
        ) : (
          <TableBox className="dt-wrap dt-wrap-short" memoryKey="delivery.entries">
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
                    <td>{row.companyName}</td>
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
          </TableBox>
        )}
      </section>

      <section className="dt-section">
        <h2>
          注文の一覧（直近 {orders.length} 件 / 未入荷 {counts.pending} 件）
          <CsvButton
            name="トナー入出状況_注文"
            header={ORDER_CSV_HEADER}
            rows={() =>
              shownOrders.map((order) => [
                csvStamp(order.orderedAt),
                order.deliveryOn,
                order.companyName,
                order.tonerId,
                order.name,
                order.quantity,
                orderStatusLabel(order),
                order.userId,
              ])
            }
            count={shownOrders.length}
          />
        </h2>

        <div className="sbx-row">
          <SearchBox
            value={orderQuery}
            onChange={setOrderQuery}
            label="探す（注文）"
            placeholder="拠点・品番・トナー名・状態・ユーザーID・日付"
            count={shownOrders.length}
            total={orders.length}
          />
        </div>

        {orders.length === 0 ? (
          <p className="dt-empty">注文の記録がありません。</p>
        ) : shownOrders.length === 0 ? (
          <p className="dt-empty">
            「{orderQuery}」に当てはまる注文がありません（直近 {orders.length} 件）。
          </p>
        ) : (
          <TableBox className="dt-wrap dt-wrap-short" memoryKey="delivery.orders">
            <table className="dt-table">
              <thead>
                <tr>
                  <th className="dt-plain">注文日時</th>
                  <th className="dt-plain">次回搬入日</th>
                  <th className="dt-plain">拠点</th>
                  <th className="dt-plain">トナーID</th>
                  <th className="dt-plain dt-num">本数</th>
                  <th className="dt-plain">状態</th>
                  <th className="dt-plain">トナー名</th>
                  <th className="dt-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {shownOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{stamp.format(new Date(order.orderedAt))}</td>
                    <td>
                      {order.deliveryOn ?? <span className="dt-muted">未定</span>}
                    </td>
                    <td>{order.companyName}</td>
                    <td className="dt-mono">{order.tonerId}</td>
                    <td className="dt-num">{num.format(order.quantity)}</td>
                    <td>
                      <span
                        className={
                          order.status === 'PENDING'
                            ? 'dl-badge dl-pending'
                            : order.status === 'RECEIVED'
                              ? order.receiveMode === 'MANUAL'
                                ? 'dl-badge dl-received-manual'
                                : 'dl-badge dl-received'
                              : 'dt-muted'
                        }
                        title={
                          order.receivedAt
                            ? `${new Date(order.receivedAt).toLocaleString('ja-JP')} に入荷済みにしました`
                            : undefined
                        }
                      >
                        {orderStatusLabel(order)}
                      </span>
                    </td>
                    <td>{order.name ?? <span className="dt-muted">—</span>}</td>
                    <td className="dt-ops">
                      {order.status === 'PENDING' && (
                        <button
                          disabled={busy}
                          onClick={() => void receiveOne(order)}
                          title="この注文を手動で入荷済みにします。在庫は動きません"
                          type="button"
                        >
                          入荷済み
                        </button>
                      )}
                      {/* 自動のものは搬入と合っているので戻せない（搬入を取り消せば戻る） */}
                      {order.status === 'RECEIVED' && order.receiveMode === 'MANUAL' && (
                        <button
                          disabled={busy}
                          onClick={() => void unreceive(order)}
                          title="手動で入荷済みにしたものを未入荷に戻します"
                          type="button"
                        >
                          未入荷に戻す
                        </button>
                      )}
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
          </TableBox>
        )}
      </section>
    </div>
  );
}
