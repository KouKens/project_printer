import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TonerCatalogRow } from '../api';
import TonerPickerRow from '../components/TonerPickerRow';
import { todayIso } from '../lib/date';
import { num, orNull } from '../lib/format';
import { request } from '../lib/request';
import './DataTable.css';
import './InvoiceScreen.css';

/** 登録済みの請求書 1 通。突き合わせの画面と同じ形 */
type Invoice = {
  id: number;
  issuedOn: string;
  periodFrom: string;
  periodTo: string;
  invoiceNo: string | null;
  note: string | null;
  checkedAt: string | null;
  checkedBy: string | null;
  lines: {
    id: number;
    tonerId: string;
    name: string | null;
    color: string | null;
    quantity: number;
    unitPrice: number | null;
    amount: number | null;
  }[];
  totalQuantity: number;
  totalAmount: number;
  unpricedLines: number;
};

/** 入力中の明細 1 行。単価は編集できるので文字列で持つ */
type Line = {
  tonerId: string;
  name: string | null;
  color: string | null;
  quantity: string;
  unitPrice: string;
};

/**
 * 請求日から既定の対象期間を作る。**前月の 1 日〜末日。**
 * 月に 1 通、前月ぶんが請求される前提。締めが違うときは画面で直す。
 *
 * 日付は文字列のまま組み立てる。Date にすると JST で前日にずれる
 */
function previousMonth(issuedOn: string): { from: string; to: string } {
  const [year, month] = issuedOn.split('-').map(Number);
  if (!year || !month) return { from: '', to: '' };

  const py = month === 1 ? year - 1 : year;
  const pm = month === 1 ? 12 : month - 1;
  // 当月 0 日 = 前月の末日。UTC で作るので時差でずれない
  const last = new Date(Date.UTC(py, pm, 0)).getUTCDate();
  const mm = String(pm).padStart(2, '0');

  return { from: `${py}-${mm}-01`, to: `${py}-${mm}-${String(last).padStart(2, '0')}` };
}

/** 金額。単価が未入力の行は 0 円ではないのでハイフンにする */
const yen = (value: number | null) =>
  value === null ? <span className="dt-muted">—</span> : <>{num.format(value)}</>;

const emptyLine = (): Line => ({
  tonerId: '',
  name: null,
  color: null,
  quantity: '1',
  unitPrice: '',
});

export default function InvoiceScreen() {
  const [catalog, setCatalog] = useState<TonerCatalogRow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [issuedOn, setIssuedOn] = useState(todayIso);
  const [periodFrom, setPeriodFrom] = useState(() => previousMonth(todayIso()).from);
  const [periodTo, setPeriodTo] = useState(() => previousMonth(todayIso()).to);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [note, setNote] = useState('');

  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState<Line>(emptyLine);
  const [search, setSearch] = useState('');
  /** 単価をマスタから入れている最中か。取りに行っているあいだ欄を触らせない */
  const [pricing, setPricing] = useState(false);

  /** 編集中の請求書。null なら新規登録 */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      const [tonerRows, invoiceRows] = await Promise.all([
        request<TonerCatalogRow[]>('/toners'),
        request<Invoice[]>('/toner-invoices'),
      ]);
      setCatalog(tonerRows);
      setInvoices(invoiceRows);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 請求日を変えたら対象期間を前月に入れ直す。
   * 締めが月末でないときは、そのあとに期間だけ直す
   */
  const changeIssuedOn = (value: string) => {
    setIssuedOn(value);
    const period = previousMonth(value);
    if (period.from) {
      setPeriodFrom(period.from);
      setPeriodTo(period.to);
    }
  };

  /**
   * トナーを選んだら単価をマスタから入れる。
   *
   * **対象期間の終わりの日に有効だった価格を引く。** 今日の価格ではないのは、
   * 先月ぶんの請求書を入れているあいだに値上げがあると、
   * 請求書に無い新しい単価が既定で入ってしまうため
   */
  const pickToner = async (row: TonerCatalogRow) => {
    setDraft((prev) => ({
      ...prev,
      tonerId: row.id,
      name: row.name,
      color: row.color,
    }));
    setSearch(row.id);

    setPricing(true);
    try {
      const at = periodTo || todayIso();
      const found = await request<{ price: number | null }>(
        `/toners/${encodeURIComponent(row.id)}/price-at?date=${at}`,
      );
      setDraft((prev) =>
        prev.tonerId === row.id
          ? { ...prev, unitPrice: found.price === null ? '' : String(found.price) }
          : prev,
      );
    } catch {
      // 価格が引けなくても入力は続けられる。単価は手で入れてもらう
      setDraft((prev) => (prev.tonerId === row.id ? { ...prev, unitPrice: '' } : prev));
    } finally {
      setPricing(false);
    }
  };

  const addLine = () => {
    const tonerId = draft.tonerId.trim();
    if (tonerId === '') {
      setError('トナーを選んでください');
      return;
    }
    if (lines.some((line) => line.tonerId === tonerId)) {
      setError(`${tonerId} はすでに明細にあります。本数をまとめて 1 行にしてください`);
      return;
    }
    const quantity = Number(draft.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('本数は 1 以上の整数で入力してください');
      return;
    }

    setLines((prev) => [...prev, { ...draft, tonerId }]);
    setDraft(emptyLine());
    setSearch('');
    setError(null);
    searchRef.current?.focus();
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setEditingId(null);
    setLines([]);
    setDraft(emptyLine());
    setSearch('');
    setInvoiceNo('');
    setNote('');
    changeIssuedOn(todayIso());
    setError(null);
    setNotice(null);
  };

  /** 一覧から読み込んで編集する。訂正請求はこれで直す */
  const editInvoice = (invoice: Invoice) => {
    setEditingId(invoice.id);
    setIssuedOn(invoice.issuedOn);
    setPeriodFrom(invoice.periodFrom);
    setPeriodTo(invoice.periodTo);
    setInvoiceNo(invoice.invoiceNo ?? '');
    setNote(invoice.note ?? '');
    setLines(
      invoice.lines.map((line) => ({
        tonerId: line.tonerId,
        name: line.name,
        color: line.color,
        quantity: String(line.quantity),
        unitPrice: line.unitPrice === null ? '' : String(line.unitPrice),
      })),
    );
    setDraft(emptyLine());
    setSearch('');
    setError(null);
    setNotice(`ID ${invoice.id} の請求書を読み込みました。直して「更新する」を押してください`);
  };

  const submit = async () => {
    // 入力欄に残っている行も送る。「明細に追加」の押し忘れで 1 行落ちるのを防ぐ
    const all = draft.tonerId.trim() ? [...lines, draft] : lines;

    if (all.length === 0) {
      setError('明細がありません。トナーを選んで「明細に追加」を押してください');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        issuedOn,
        periodFrom,
        periodTo,
        invoiceNo: orNull(invoiceNo),
        note: orNull(note),
        lines: all.map((line) => ({
          tonerId: line.tonerId,
          quantity: Number(line.quantity),
          unitPrice: line.unitPrice.trim() === '' ? null : Number(line.unitPrice),
        })),
      };

      const saved =
        editingId === null
          ? await request<Invoice>('/toner-invoices', {
              method: 'POST',
              body: JSON.stringify(payload),
            })
          : await request<Invoice>(`/toner-invoices/${editingId}`, {
              method: 'PATCH',
              body: JSON.stringify(payload),
            });

      setNotice(
        `${saved.periodFrom} 〜 ${saved.periodTo} の請求書を${
          editingId === null ? '登録' : '更新'
        }しました（${saved.lines.length} 件・合計 ${num.format(saved.totalAmount)} 円）`,
      );
      clearForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const removeInvoice = async (invoice: Invoice) => {
    setBusy(true);
    setError(null);
    try {
      await request(`/toner-invoices/${invoice.id}`, { method: 'DELETE' });
      setNotice(`${invoice.periodFrom} 〜 ${invoice.periodTo} の請求書を削除しました`);
      if (editingId === invoice.id) clearForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 入力中の明細の合計。入力欄に残っている行も数える */
  const totals = useMemo(() => {
    const all = draft.tonerId.trim() ? [...lines, draft] : lines;
    return {
      count: all.length,
      quantity: all.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0),
      amount: all.reduce(
        (sum, line) =>
          sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
        0,
      ),
      unpriced: all.filter((line) => line.unitPrice.trim() === '').length,
    };
  }, [lines, draft]);

  return (
    <div className="dt iv">
      <header className="dt-head">
        <h1>請求書入力</h1>
        <p>
          月に 1 通届く請求書の中身を入れます。トナーを選ぶと、
          <strong>対象期間の終わりの日に有効だった単価</strong>がマスタから入ります。
          請求書の数字が違っていればその場で直してください。差は「請求書状況」で確かめます。
        </p>
      </header>

      {error && (
        <p className="dt-msg dt-msg-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="dt-msg dt-msg-ok">{notice}</p>}

      <section className="dt-section">
        <h2>{editingId === null ? '新しい請求書' : `請求書を編集（ID ${editingId}）`}</h2>

        <div className="iv-head">
          <label>
            <span>請求日</span>
            <input
              type="date"
              value={issuedOn}
              disabled={busy}
              onChange={(e) => changeIssuedOn(e.target.value)}
            />
          </label>
          <label>
            <span>対象期間（開始）</span>
            <input
              type="date"
              value={periodFrom}
              disabled={busy}
              onChange={(e) => setPeriodFrom(e.target.value)}
            />
          </label>
          <label>
            <span>対象期間（終了）</span>
            <input
              type="date"
              value={periodTo}
              disabled={busy}
              onChange={(e) => setPeriodTo(e.target.value)}
            />
          </label>
          <label>
            <span>請求書番号</span>
            <input
              type="text"
              value={invoiceNo}
              disabled={busy}
              placeholder="任意"
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </label>
          <label className="iv-note">
            <span>備考</span>
            <input
              type="text"
              value={note}
              disabled={busy}
              placeholder="任意（訂正請求の経緯など）"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        <p className="dt-hint">
          対象期間は請求日から「前月 1 日〜末日」を入れています。この期間の搬入と突き合わせるので、
          締め日が違うときは直してください。
        </p>
      </section>

      <section className="dt-section">
        <h2>明細を足す</h2>

        <div className="iv-entry">
          <TonerPickerRow
            active
            catalog={catalog}
            disabled={busy}
            idPrefix="iv"
            inputRef={(el) => {
              searchRef.current = el;
            }}
            no="＋"
            onEnter={() => addLine()}
            onFocus={() => undefined}
            onPick={(row) => void pickToner(row)}
            onSearch={setSearch}
            rowRef={() => undefined}
            search={search}
            value={draft.tonerId}
          />

          <div className="iv-fields">
            <label>
              <span>本数</span>
              <input
                type="number"
                min={1}
                max={9999}
                inputMode="numeric"
                value={draft.quantity}
                disabled={busy}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </label>
            <label>
              <span>単価（税別・円）</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.unitPrice}
                disabled={busy || pricing}
                placeholder={pricing ? '取得中…' : 'マスタから自動で入ります'}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, unitPrice: e.target.value }))
                }
              />
            </label>
            <p className="iv-amount">
              金額{' '}
              <strong>
                {num.format(
                  (Number(draft.quantity) || 0) * (Number(draft.unitPrice) || 0),
                )}
              </strong>{' '}
              円
            </p>
            <button
              className="iv-add"
              type="button"
              disabled={busy}
              onClick={addLine}
            >
              明細に追加
            </button>
          </div>
        </div>

        {draft.tonerId && draft.unitPrice.trim() === '' && !pricing && (
          <p className="dt-hint">
            {draft.tonerId} はこの期間の価格がマスタに登録されていません。
            請求書の単価を手で入れてください（「トナー登録」で価格を足すこともできます）。
          </p>
        )}
      </section>

      <section className="dt-section">
        <h2>
          明細
          <span className="iv-count">{totals.count} 件</span>
          <span className="iv-count">{num.format(totals.quantity)} 本</span>
          <span className="iv-count">合計 {num.format(totals.amount)} 円（税別）</span>
        </h2>

        {lines.length === 0 ? (
          <p className="dt-empty">
            まだ明細がありません。上でトナーを選び、本数を入れて「明細に追加」を押します。
          </p>
        ) : (
          <div className="dt-wrap">
            <table>
              <thead>
                <tr>
                  <th>トナーID</th>
                  <th>名称</th>
                  <th className="dt-num">本数</th>
                  <th className="dt-num">単価</th>
                  <th className="dt-num">金額</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={line.tonerId}>
                    <td className="dt-mono">{line.tonerId}</td>
                    <td>
                      {line.name ?? <span className="dt-muted">—</span>}
                      {line.color ? `／${line.color}` : ''}
                    </td>
                    <td className="dt-num">
                      <input
                        className="iv-cell"
                        type="number"
                        min={1}
                        max={9999}
                        value={line.quantity}
                        disabled={busy}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((row, i) =>
                              i === index ? { ...row, quantity: e.target.value } : row,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="dt-num">
                      <input
                        className="iv-cell"
                        type="number"
                        min={0}
                        value={line.unitPrice}
                        disabled={busy}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((row, i) =>
                              i === index ? { ...row, unitPrice: e.target.value } : row,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="dt-num">
                      {line.unitPrice.trim() === '' ? (
                        <span className="dt-muted">—</span>
                      ) : (
                        num.format(
                          (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
                        )
                      )}
                    </td>
                    <td>
                      <button
                        className="iv-remove"
                        type="button"
                        disabled={busy}
                        onClick={() => removeLine(index)}
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

        {totals.unpriced > 0 && (
          <p className="dt-hint">
            単価が未入力の明細が {totals.unpriced} 件あります。その行は合計に入りません。
          </p>
        )}

        <div className="iv-actions">
          <button
            className="iv-submit"
            type="button"
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? '処理中…' : editingId === null ? '登録する' : '更新する'}
          </button>
          <button className="iv-ghost" type="button" disabled={busy} onClick={clearForm}>
            {editingId === null ? 'クリア' : '編集をやめる'}
          </button>
        </div>
      </section>

      <section className="dt-section">
        <h2>
          登録済みの請求書
          <span className="iv-count">{invoices.length} 通</span>
        </h2>

        {invoices.length === 0 ? (
          <p className="dt-empty">まだ登録がありません。</p>
        ) : (
          <div className="dt-wrap">
            <table>
              <thead>
                <tr>
                  <th>対象期間</th>
                  <th>請求日</th>
                  <th>請求書番号</th>
                  <th className="dt-num">明細</th>
                  <th className="dt-num">本数</th>
                  <th className="dt-num">合計（税別）</th>
                  <th>突合せ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      {invoice.periodFrom} 〜 {invoice.periodTo}
                    </td>
                    <td>{invoice.issuedOn}</td>
                    <td>
                      {invoice.invoiceNo ?? <span className="dt-muted">—</span>}
                    </td>
                    <td className="dt-num">{invoice.lines.length}</td>
                    <td className="dt-num">{num.format(invoice.totalQuantity)}</td>
                    <td className="dt-num">{yen(invoice.totalAmount)}</td>
                    <td>
                      {invoice.checkedAt ? (
                        <span className="iv-checked">確認済み</span>
                      ) : (
                        <span className="dt-muted">未確認</span>
                      )}
                    </td>
                    <td className="iv-row-actions">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => editInvoice(invoice)}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeInvoice(invoice)}
                      >
                        削除
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
