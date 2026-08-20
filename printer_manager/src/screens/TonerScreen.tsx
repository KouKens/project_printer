import { useCallback, useEffect, useMemo, useState } from 'react';
import { todayIso } from '../lib/date';
import { ipToNumber } from '../lib/table';
import { request } from '../lib/request';
import './TonerScreen.css';

/** 手入力の項目。プリンターは端末情報（printer_assets）の主キーで持つ */
type Form = {
  id: string;
  name: string;
  color: string;
  recycled: boolean;
  price: string;
  effectiveFrom: string;
  /** 端末情報（台帳）の主キー */
  printerAssetIds: number[];
};

/** API から返るマスタ 1 件 */
type SavedToner = {
  id: string;
  name: string | null;
  color: string | null;
  recycled: boolean;
  /** 今日の時点で有効な税別価格。まだ登録が無ければ null */
  price: number | null;
  priceFrom: string | null;
  priceCount: number;
  stock: number;
  printers: Printer[];
  createdAt: string;
  updatedAt: string;
};

type PriceRow = {
  id: number;
  price: number;
  effectiveFrom: string;
  note: string | null;
  createdAt: string;
};

/** 端末情報の 1 台。台帳なので IP が未入力のこともある */
type Printer = {
  id: number;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
};

/** 添付の一覧に出てくる色。ここに無いものも自由に入力できる */
const COLORS = [
  'ブラック',
  'シアン',
  'マゼンタ',
  'イエロー',
  'ライトシアン',
  'ライトマゼンタ',
  '4色パック',
  '6色パック',
];

const EMPTY: Form = {
  id: '',
  name: '',
  color: '',
  recycled: false,
  price: '',
  effectiveFrom: todayIso(),
  printerAssetIds: [],
};

/** 空欄は null で送る。API 側で「未入力」として扱われる */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const yen = new Intl.NumberFormat('ja-JP');

/** 一覧のツールチップに出す機器の呼び名 */
const printerLabel = (printer: Printer) =>
  [
    printer.no ? `No.${printer.no}` : null,
    printer.department,
    printer.ipAddress,
    printer.model,
  ]
    .filter(Boolean)
    .join(' / ');

/** 一覧の狭いセルに出す短い呼び名。IP 未入力の台帳もあるので No. で代替する */
const printerShort = (printer: Printer) =>
  printer.ipAddress ?? (printer.no ? `No.${printer.no}` : `ID ${printer.id}`);

export default function TonerScreen() {
  const [form, setForm] = useState<Form>(EMPTY);
  /** 編集中のトナーID。null なら新規登録 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toners, setToners] = useState<SavedToner[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [tonerRows, printerRows] = await Promise.all([
        request<SavedToner[]>('/toners'),
        // 実機マスタではなく端末情報。SNMP に応答しない機器も選べるようにする
        request<Printer[]>('/printer-assets'),
      ]);
      setToners(tonerRows);
      setPrinters(
        [...printerRows].sort(
          (a, b) =>
            // IP 未入力の台帳は末尾に置く
            ipToNumber(a.ipAddress ?? '') - ipToNumber(b.ipAddress ?? ''),
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof Form>(key: K) => (value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const shownPrinters = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return printers;
    return printers.filter((printer) =>
      `${printer.ipAddress ?? ''} ${printer.no ?? ''} ${printer.department ?? ''} ${
        printer.maker ?? ''
      } ${printer.model ?? ''}`
        .toLowerCase()
        .includes(needle),
    );
  }, [printers, filter]);

  const togglePrinter = (id: number) =>
    setForm((prev) => ({
      ...prev,
      printerAssetIds: prev.printerAssetIds.includes(id)
        ? prev.printerAssetIds.filter((x) => x !== id)
        : [...prev.printerAssetIds, id],
    }));

  /** マスタ登録。対応機器と初回価格も一緒に送る */
  const create = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await request<SavedToner>('/toners', {
        method: 'POST',
        body: JSON.stringify({
          id: form.id.trim(),
          name: orNull(form.name),
          color: orNull(form.color),
          recycled: form.recycled,
          printerAssetIds: form.printerAssetIds,
          price: form.price.trim() === '' ? null : Number(form.price),
          effectiveFrom: form.price.trim() === '' ? null : form.effectiveFrom,
        }),
      });
      setNotice(`${saved.name ?? saved.id} を登録しました`);
      await edit(saved.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 名前・色・リサイクル区分・対応機器の更新。価格はここでは変えない */
  const update = async () => {
    if (editingId === null) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await request<SavedToner>(`/toners/${encodeURIComponent(editingId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: orNull(form.name),
          color: orNull(form.color),
          recycled: form.recycled,
          printerAssetIds: form.printerAssetIds,
        }),
      });
      setNotice(`${saved.name ?? saved.id} を更新しました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 価格改定。過去の価格は残したまま、適用開始日を持つ行を足す */
  const addPrice = async () => {
    if (editingId === null) return;
    if (form.price.trim() === '') {
      setError('価格を入力してください');
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<SavedToner>(`/toners/${encodeURIComponent(editingId)}/prices`, {
        method: 'POST',
        body: JSON.stringify({
          price: Number(form.price),
          effectiveFrom: form.effectiveFrom,
        }),
      });
      setNotice(
        `${form.effectiveFrom} から ${yen.format(Number(form.price))} 円（税別）にしました`,
      );
      await edit(editingId);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 一覧の行を編集に載せる。価格の履歴もここで読む */
  const edit = async (id: string) => {
    try {
      const [toner, history] = await Promise.all([
        request<SavedToner>(`/toners/${encodeURIComponent(id)}`),
        request<PriceRow[]>(`/toners/${encodeURIComponent(id)}/prices`),
      ]);

      setForm({
        id: toner.id,
        name: toner.name ?? '',
        color: toner.color ?? '',
        recycled: toner.recycled,
        price: toner.price === null ? '' : String(toner.price),
        effectiveFrom: toner.priceFrom ?? todayIso(),
        printerAssetIds: toner.printers.map((printer) => printer.id),
      });
      setEditingId(toner.id);
      setPrices(history);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const clear = () => {
    setForm(EMPTY);
    setEditingId(null);
    setPrices([]);
    setError(null);
    setNotice(null);
  };

  return (
    <div className="tn">
      <header className="tn-head">
        <h1>トナー登録</h1>
        <p>
          トナーの品番ごとに、対応する機器・色・リサイクル品かどうか・税別価格を登録します。
          対応する機器は端末情報の台帳から選ぶので、1 種類のトナーを複数台で共用していても
          登録は 1 件で済みます。価格は上書きせず履歴として積み、統計はその日に有効だった
          価格で計算できます。
        </p>
      </header>

      <section className="tn-form">
        <label>
          <span>トナーID（品番・バーコード）</span>
          <input
            type="text"
            value={form.id}
            onChange={(e) => set('id')(e.target.value)}
            disabled={editingId !== null}
            placeholder="P500H"
          />
        </label>

        <label>
          <span>トナー名</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            placeholder="トナーカートリッジ P500H"
          />
        </label>

        <label>
          <span>色</span>
          <input
            type="text"
            list="tn-colors"
            value={form.color}
            onChange={(e) => set('color')(e.target.value)}
            placeholder="ブラック"
          />
          <datalist id="tn-colors">
            {COLORS.map((color) => (
              <option key={color} value={color} />
            ))}
          </datalist>
        </label>

        <label>
          <span>価格（税別・円）</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => set('price')(e.target.value)}
            placeholder="7200"
          />
        </label>

        <label>
          <span>この価格の適用開始日</span>
          <input
            type="date"
            value={form.effectiveFrom}
            onChange={(e) => set('effectiveFrom')(e.target.value)}
          />
        </label>

        <label className="tn-check">
          <input
            type="checkbox"
            checked={form.recycled}
            onChange={(e) => set('recycled')(e.target.checked)}
          />
          <span>リサイクル品・互換品</span>
        </label>

        <div className="tn-printers">
          <div className="tn-printers-head">
            <span>対応するプリンター（{form.printerAssetIds.length} 台選択中）</span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="IP・No.・部署・機種で絞り込み"
            />
            <button type="button" onClick={() => set('printerAssetIds')([])}>
              選択を外す
            </button>
          </div>

          <div className="tn-printer-list">
            {shownPrinters.length === 0 ? (
              <span className="tn-muted">該当する機器がありません</span>
            ) : (
              shownPrinters.map((printer) => (
                <label key={printer.id}>
                  <input
                    type="checkbox"
                    checked={form.printerAssetIds.includes(printer.id)}
                    onChange={() => togglePrinter(printer.id)}
                  />
                  <span className="tn-ip">{printer.ipAddress ?? '—'}</span>
                  <span className="tn-no">{printer.no ? `No.${printer.no}` : ''}</span>
                  <span className="tn-model">
                    {[printer.department, printer.model].filter(Boolean).join(' / ') || '—'}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="tn-actions">
          {editingId === null ? (
            <button onClick={() => void create()} disabled={busy || !form.id.trim()}>
              登録
            </button>
          ) : (
            <>
              <button onClick={() => void update()} disabled={busy}>
                更新
              </button>
              <button className="tn-sub" onClick={() => void addPrice()} disabled={busy} type="button">
                この価格で改定
              </button>
            </>
          )}
          <button className="tn-sub" onClick={clear} disabled={busy} type="button">
            クリア
          </button>
          {editingId !== null && <span className="tn-editing">{editingId} を編集中</span>}
        </div>
      </section>

      {error && <p className="tn-msg tn-msg-error">{error}</p>}
      {notice && <p className="tn-msg tn-msg-ok">{notice}</p>}

      {editingId !== null && prices.length > 0 && (
        <section className="tn-history">
          <h2>価格の履歴（{prices.length} 件）</h2>
          <ol>
            {prices.map((row, index) => (
              <li key={row.id}>
                <span className="tn-from">{row.effectiveFrom} 〜</span>
                <span>{yen.format(row.price)} 円</span>
                {index === 0 && row.effectiveFrom <= todayIso() && (
                  <span className="tn-now">現在</span>
                )}
                {row.note && <span className="tn-note">{row.note}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="tn-list">
        <h2>登録したトナー（{toners.length} 件）</h2>
        <p className="tn-hint">
          価格は今日の時点で有効なものです。「編集」で読み込むと履歴も見られます。
        </p>

        {toners.length === 0 ? (
          <p className="tn-empty">まだ登録がありません。上の欄を入力して登録してください。</p>
        ) : (
          <div className="tn-table-wrap">
            <table className="tn-table">
              <thead>
                <tr>
                  <th>トナーID</th>
                  <th>トナー名</th>
                  <th>色</th>
                  <th>リサイクル</th>
                  <th className="tn-num">価格（税別）</th>
                  <th>適用開始</th>
                  <th className="tn-num">改定</th>
                  <th>対応プリンター</th>
                  <th className="tn-num">在庫</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {toners.map((toner) => (
                  <tr key={toner.id} className={toner.id === editingId ? 'tn-row-on' : undefined}>
                    <td className="tn-mono">{toner.id}</td>
                    <td>{toner.name ?? '—'}</td>
                    <td>{toner.color ?? '—'}</td>
                    <td>{toner.recycled ? '○' : '—'}</td>
                    <td className="tn-num">
                      {toner.price === null ? '—' : `${yen.format(toner.price)} 円`}
                    </td>
                    <td className="tn-mono">{toner.priceFrom ?? '—'}</td>
                    <td className="tn-num">{toner.priceCount}</td>
                    <td
                      className="tn-printers-cell"
                      title={toner.printers.map(printerLabel).join('\n')}
                    >
                      {toner.printers.length === 0 ? (
                        <span className="tn-muted">—</span>
                      ) : (
                        <>
                          <span className="tn-chip">{toner.printers.length} 台</span>{' '}
                          {toner.printers.map(printerShort).join(', ')}
                        </>
                      )}
                    </td>
                    <td className="tn-num">{toner.stock}</td>
                    <td className="tn-ops">
                      <button onClick={() => void edit(toner.id)} disabled={busy} type="button">
                        編集
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
