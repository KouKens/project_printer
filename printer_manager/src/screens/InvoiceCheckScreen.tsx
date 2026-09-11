import { useCallback, useEffect, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import { num } from '../lib/format';
import { request } from '../lib/request';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import './DataTable.css';
import './InvoiceCheckScreen.css';

type Invoice = {
  id: number;
  issuedOn: string;
  periodFrom: string;
  periodTo: string;
  invoiceNo: string | null;
  note: string | null;
  checkedAt: string | null;
  checkedBy: string | null;
  lines: { id: number }[];
  totalQuantity: number;
  totalAmount: number;
  unpricedLines: number;
};

type CheckStatus =
  | 'match'
  | 'qty-diff'
  | 'price-diff'
  | 'not-received'
  | 'not-invoiced'
  | 'unknown-price';

type CheckRow = {
  tonerId: string;
  name: string | null;
  color: string | null;
  onInvoice: boolean;
  invoiceQty: number;
  unitPrice: number | null;
  invoiceAmount: number | null;
  receivedQty: number;
  dataAmount: number | null;
  qtyDiff: number;
  amountDiff: number | null;
  nearbyQty: number;
  status: CheckStatus;
};

type Check = {
  invoice: Invoice;
  rows: CheckRow[];
  totals: {
    invoiceQty: number;
    receivedQty: number;
    invoiceAmount: number;
    dataAmount: number;
    amountDiff: number;
    unknownAmount: number;
  };
  mismatches: number;
};

/** 状態の色と文言。ここで一元管理する（入出状況の画面と同じ作り） */
const STATUS: Record<CheckStatus, { label: string; className: string; note: string }> = {
  match: {
    label: '一致',
    className: 'ic-ok',
    note: '本数も金額も搬入の記録どおりです',
  },
  'qty-diff': {
    label: '本数違い',
    className: 'ic-qty',
    note: '請求された本数が、期間内の搬入と合いません',
  },
  'price-diff': {
    label: '金額違い',
    className: 'ic-price',
    note: '本数は合っていますが金額が違います。単価の食い違いです',
  },
  'not-received': {
    label: '搬入なし',
    className: 'ic-none',
    note: '請求されていますが、この期間の搬入の記録がありません',
  },
  'not-invoiced': {
    label: '請求なし',
    className: 'ic-none',
    note: '搬入はありますが、請求書に明細がありません',
  },
  'unknown-price': {
    label: '金額不明',
    className: 'ic-unknown',
    note: '単価が分からないので金額を比べられません（マスタの価格が未登録）',
  },
};

type Key =
  | 'tonerId'
  | 'invoiceQty'
  | 'receivedQty'
  | 'qtyDiff'
  | 'invoiceAmount'
  | 'dataAmount'
  | 'amountDiff'
  | 'status';

const COLUMNS: { key: Key; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'tonerId', label: 'トナーID', kind: 'text' },
  { key: 'invoiceQty', label: '請求 本数', kind: 'number', numeric: true },
  { key: 'receivedQty', label: '搬入 本数', kind: 'number', numeric: true },
  { key: 'qtyDiff', label: '差', kind: 'number', numeric: true },
  { key: 'invoiceAmount', label: '請求 金額', kind: 'number', numeric: true },
  { key: 'dataAmount', label: 'データ 金額', kind: 'number', numeric: true },
  { key: 'amountDiff', label: '差', kind: 'number', numeric: true },
  { key: 'status', label: '状態', kind: 'text' },
];

/**
 * CSV の見出し。**どの請求書の突き合わせかを頭 3 列に添える。**
 * 1 通ぶんだけのファイルになるので、対象期間が入っていないと後から分からない
 */
const CSV_HEADER = [
  '対象期間（開始）',
  '対象期間（終了）',
  '請求書番号',
  'トナーID',
  'トナー名',
  '色',
  '請求 本数',
  '搬入 本数',
  '差（本数）',
  '請求 金額',
  'データ 金額',
  '差（金額）',
  '状態',
  '期間外の搬入',
];

/** 差は符号を付ける。0 は「—」にせず 0 と出す（合っていることが分かるように） */
const signed = (value: number) =>
  value > 0 ? `+${num.format(value)}` : num.format(value);

const cell = (value: number | null) =>
  value === null ? <span className="dt-muted">—</span> : <>{num.format(value)}</>;

export default function InvoiceCheckScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [check, setCheck] = useState<Check | null>(null);
  const [onlyIssues, setOnlyIssues] = useState(false);
  /*
   * 既定は状態の降順。合わない行（本数違い → 金額違い → 搬入なし → 請求なし）が
   * 先に並び、一致は末尾になる。見たいのは合わない行なので、そこから読ませる
   */
  const [sort, setSort] = useState<{ key: Key; dir: SortDir }>({
    key: 'status',
    dir: 'desc',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      const rows = await request<Invoice[]>('/toner-invoices');
      setInvoices(rows);
      // 既定はいちばん新しい請求書。毎月これを見るのが主な使い方
      setSelected((prev) => prev ?? rows[0]?.id ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const loadCheck = useCallback(async (id: number) => {
    try {
      setError(null);
      setCheck(await request<Check>(`/toner-invoices/${id}/check`));
    } catch (err) {
      setError((err as Error).message);
      setCheck(null);
    }
  }, []);

  useEffect(() => {
    if (selected !== null) void loadCheck(selected);
  }, [selected, loadCheck]);

  const markChecked = async () => {
    if (selected === null) return;
    setBusy(true);
    setError(null);
    try {
      await request(`/toner-invoices/${selected}/checked`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setNotice('確認済みにしました');
      await loadInvoices();
      await loadCheck(selected);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const shown = useMemo(() => {
    if (!check) return [];
    const rows = onlyIssues
      ? check.rows.filter((row) => row.status !== 'match')
      : check.rows;
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(
      rows,
      (row) => row[sort.key],
      column?.kind ?? 'text',
      sort.dir,
      // 同じ値のときは品番の並びで安定させる
      (row) => row.tonerId.charCodeAt(0),
    );
  }, [check, onlyIssues, sort]);

  const head = (key: Key, label: string, numeric?: boolean) => (
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

  const current = invoices.find((invoice) => invoice.id === selected) ?? null;

  return (
    <div className="dt ic">
      <header className="dt-head">
        <h1>請求書状況</h1>
        <p>
          請求書の本数・金額と、対象期間に受け付けた<strong>搬入</strong>の記録を並べます。
          データ側の金額は、搬入 1 件ずつ<strong>その搬入日に有効だった単価</strong>で計算しています。
          注文ではなく搬入と比べるのは、払うのが実際に届いたぶんだからです。
        </p>
      </header>

      {error && (
        <p className="dt-msg dt-msg-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <div className="dt-tools">
        <label>
          <span>請求書</span>
          <select
            value={selected ?? ''}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {invoices.length === 0 && <option value="">登録がありません</option>}
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.periodFrom} 〜 {invoice.periodTo}
                {invoice.checkedAt ? '（確認済み）' : ''}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={onlyIssues}
            onChange={(e) => setOnlyIssues(e.target.checked)}
          />
          <span>合わない行だけ</span>
        </label>

        <button
          type="button"
          disabled={busy || selected === null || check === null}
          onClick={() => void markChecked()}
        >
          確認済みにする
        </button>

        <CsvButton
          name="請求書状況"
          header={CSV_HEADER}
          rows={() =>
            check === null
              ? []
              : shown.map((row) => [
                  check.invoice.periodFrom,
                  check.invoice.periodTo,
                  check.invoice.invoiceNo,
                  row.tonerId,
                  row.name,
                  row.color,
                  // 請求書に明細が無い品番は 0 本ではないので空欄にする
                  row.onInvoice ? row.invoiceQty : null,
                  row.receivedQty,
                  row.qtyDiff,
                  row.invoiceAmount,
                  row.dataAmount,
                  row.amountDiff,
                  STATUS[row.status].label,
                  row.nearbyQty,
                ])
          }
          count={shown.length}
        />
      </div>

      {check === null ? (
        <p className="dt-empty">
          {invoices.length === 0
            ? '請求書がまだ登録されていません。「請求書入力」から入れてください。'
            : '読み込み中です。'}
        </p>
      ) : (
        <>
          <dl className="dt-summary">
            <div>
              <dt>対象期間</dt>
              <dd className="dt-period">
                {check.invoice.periodFrom} 〜 {check.invoice.periodTo}
              </dd>
            </div>
            <div>
              <dt>請求 合計</dt>
              <dd>{num.format(check.totals.invoiceAmount)} 円</dd>
            </div>
            <div>
              <dt>データ 合計</dt>
              <dd>{num.format(check.totals.dataAmount)} 円</dd>
            </div>
            <div>
              <dt>差</dt>
              <dd className={check.totals.amountDiff === 0 ? 'ic-ok' : 'ic-price'}>
                {signed(check.totals.amountDiff)} 円
              </dd>
            </div>
            <div>
              <dt>合わない行</dt>
              <dd className={check.mismatches === 0 ? 'ic-ok' : 'ic-qty'}>
                {check.mismatches} 件
              </dd>
            </div>
          </dl>

          {check.mismatches === 0 ? (
            <p className="dt-msg dt-msg-ok">
              請求書の本数・金額は、この期間の搬入の記録と一致しています。
            </p>
          ) : (
            <p className="dt-hint">
              本数の違いを先に見てください。本数がずれていれば金額も当然ずれます。
              月末に入ったぶんが翌月の請求に回ることがあるので、
              「期間外の搬入」の列に本数が出ている行は期ずれの可能性があります。
            </p>
          )}

          {check.totals.unknownAmount > 0 && (
            <p className="dt-hint">
              金額を出せなかった行が {check.totals.unknownAmount} 件あります（単価が未登録）。
              その行は合計に入っていません。
            </p>
          )}

          <div className="dt-wrap">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => head(column.key, column.label, column.numeric))}
                  <th className="dt-num">期間外の搬入</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => {
                  const status = STATUS[row.status];
                  return (
                    <tr key={row.tonerId}>
                      <td className="dt-mono" title={row.name ?? ''}>
                        {row.tonerId}
                        {row.color ? (
                          <span className="ic-color">／{row.color}</span>
                        ) : null}
                      </td>
                      <td className="dt-num">
                        {row.onInvoice ? (
                          num.format(row.invoiceQty)
                        ) : (
                          <span className="dt-muted">—</span>
                        )}
                      </td>
                      <td className="dt-num">{num.format(row.receivedQty)}</td>
                      <td className={`dt-num${row.qtyDiff === 0 ? '' : ' ic-qty'}`}>
                        {signed(row.qtyDiff)}
                      </td>
                      <td className="dt-num">{cell(row.invoiceAmount)}</td>
                      <td className="dt-num">{cell(row.dataAmount)}</td>
                      <td
                        className={`dt-num${
                          row.amountDiff === null || row.amountDiff === 0
                            ? ''
                            : ' ic-price'
                        }`}
                      >
                        {row.amountDiff === null ? (
                          <span className="dt-muted">—</span>
                        ) : (
                          signed(row.amountDiff)
                        )}
                      </td>
                      <td>
                        <span className={status.className} title={status.note}>
                          {status.label}
                        </span>
                      </td>
                      <td className="dt-num">
                        {row.nearbyQty > 0 ? (
                          <span
                            className="ic-nearby"
                            title="対象期間の前後 1 か月にあった搬入です。期ずれで請求月が動いた可能性があります"
                          >
                            {num.format(row.nearbyQty)}
                          </span>
                        ) : (
                          <span className="dt-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th>合計</th>
                  <td className="dt-num">{num.format(check.totals.invoiceQty)}</td>
                  <td className="dt-num">{num.format(check.totals.receivedQty)}</td>
                  <td className="dt-num">
                    {signed(check.totals.invoiceQty - check.totals.receivedQty)}
                  </td>
                  <td className="dt-num">{num.format(check.totals.invoiceAmount)}</td>
                  <td className="dt-num">{num.format(check.totals.dataAmount)}</td>
                  <td className="dt-num">{signed(check.totals.amountDiff)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {current?.checkedAt && (
            <p className="dt-hint">
              {new Date(current.checkedAt).toLocaleString('ja-JP')} に確認済みにしました。
            </p>
          )}
        </>
      )}
    </div>
  );
}
