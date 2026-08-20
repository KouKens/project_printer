import { useCallback, useEffect, useMemo, useState } from 'react';
import { MANUAL_MAINT, maintStatus } from '../lib/maint';

import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './AssetScreen.css';

/** 枚数の集計表でこの機器が占める行 */
type CountLayout = 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';

/** 台帳の手入力項目。こちらは DB に保存する */
type Asset = {
  department: string;
  no: string;
  ipAddress: string;
  maker: string;
  model: string;
  serialNumber: string;
  purchasedOn: string;
  contractNo: string;
  /** 保守の有無の手入力。保守終了日が無いときだけ使う */
  maintContract: string;
  maintStartOn: string;
  maintEndOn: string;
  maintDealOn: string;
  maintFee: string;
  note: string;
  /**
   * 枚数の集計表でこの機器が占める行。画面に入力欄は無いが、
   * 送らないと API が既定の TOTAL に戻してしまうので読み込んだ値を持ち回る
   */
  countLayout: CountLayout;
};

/** API から返る台帳。保存済みの 1 件 */
type SavedAsset = {
  id: number;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
  serialNumber: string | null;
  purchasedOn: string | null;
  contractNo: string | null;
  maintContract: string | null;
  maintStartOn: string | null;
  maintEndOn: string | null;
  maintDealOn: string | null;
  maintFee: number | null;
  note: string | null;
  countLayout: CountLayout;
  updatedAt: string;
};

const EMPTY: Asset = {
  department: '',
  no: '',
  ipAddress: '',
  maker: '',
  model: '',
  serialNumber: '',
  purchasedOn: '',
  contractNo: '',
  maintContract: '',
  maintStartOn: '',
  maintEndOn: '',
  maintDealOn: '',
  maintFee: '',
  note: '',
  countLayout: 'TOTAL',
};

type Supply = {
  supplyIndex: number;
  name: string;
  colorant: string | null;
  level: number;
  maxCapacity: number;
  percent: number | null;
};

/** POST /printers/probe の戻り。保存しないのでレコード id は持たない */
type Probe = {
  ipAddress: string;
  community: string;
  version: string;
  hostName: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  pageCount: number | null;
  polledAt: string;
  supplies: Supply[];
};

/** 一覧の列。ソートの鍵も兼ねる。maintStatus だけは保存値でなく導出値 */
type SortKey = Exclude<keyof SavedAsset, 'id'> | 'maintStatus';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'department', label: '部署', kind: 'text' },
  { key: 'no', label: 'No.', kind: 'text' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip' },
  { key: 'maker', label: 'メーカー', kind: 'text' },
  { key: 'model', label: '型番', kind: 'text' },
  { key: 'serialNumber', label: 'シリアル', kind: 'text' },
  { key: 'purchasedOn', label: '購入日', kind: 'date' },
  { key: 'contractNo', label: '契約 No.', kind: 'text' },
  { key: 'maintStatus', label: '保守', kind: 'text' },
  { key: 'maintStartOn', label: '保守開始', kind: 'date' },
  { key: 'maintEndOn', label: '保守終了', kind: 'date' },
  { key: 'maintDealOn', label: '保守取引', kind: 'date' },
  { key: 'maintFee', label: '保守金額', kind: 'number', numeric: true },
  { key: 'note', label: '備考', kind: 'text' },
  { key: 'updatedAt', label: '更新日', kind: 'date' },
];

/** 空欄は null で送る。API 側で「未入力」として扱われ、更新なら値が消える */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toPayload(asset: Asset) {
  return {
    department: orNull(asset.department),
    no: orNull(asset.no),
    ipAddress: orNull(asset.ipAddress),
    maker: orNull(asset.maker),
    model: orNull(asset.model),
    serialNumber: orNull(asset.serialNumber),
    purchasedOn: orNull(asset.purchasedOn),
    contractNo: orNull(asset.contractNo),
    maintContract: orNull(asset.maintContract),
    maintStartOn: orNull(asset.maintStartOn),
    maintEndOn: orNull(asset.maintEndOn),
    maintDealOn: orNull(asset.maintDealOn),
    maintFee: asset.maintFee.trim() === '' ? null : Number(asset.maintFee),
    note: orNull(asset.note),
    countLayout: asset.countLayout,
  };
}

function toForm(saved: SavedAsset): Asset {
  return {
    department: saved.department ?? '',
    no: saved.no ?? '',
    ipAddress: saved.ipAddress ?? '',
    maker: saved.maker ?? '',
    model: saved.model ?? '',
    serialNumber: saved.serialNumber ?? '',
    purchasedOn: saved.purchasedOn ?? '',
    contractNo: saved.contractNo ?? '',
    maintContract: saved.maintContract ?? '',
    maintStartOn: saved.maintStartOn ?? '',
    maintEndOn: saved.maintEndOn ?? '',
    maintDealOn: saved.maintDealOn ?? '',
    maintFee: saved.maintFee === null ? '' : String(saved.maintFee),
    note: saved.note ?? '',
    countLayout: saved.countLayout,
  };
}

/** 台帳の値と実機の値を突き合わせる。どちらか空なら判定しない */
function compare(input: string, actual: string | null): 'same' | 'diff' | null {
  const a = input.trim().toLowerCase();
  const b = (actual ?? '').trim().toLowerCase();
  if (!a || !b) return null;
  return a === b ? 'same' : 'diff';
}

const yen = new Intl.NumberFormat('ja-JP');

export default function AssetScreen() {
  const [asset, setAsset] = useState<Asset>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedAsset[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'department',
    dir: 'asc',
  });
  const [community, setCommunity] = useState('public');
  const [probe, setProbe] = useState<Probe | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSaved(await request<SavedAsset[]>('/printer-assets'));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(
      saved,
      (row) =>
        sort.key === 'maintStatus'
          ? maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract)
          : row[sort.key],
      column?.kind ?? 'text',
      sort.dir,
      (row) => row.id,
    );
  }, [saved, sort]);

  /** 凡例に出す台数。行の色分けと同じ判定を使う */
  const maintCounts = useMemo(() => {
    const counts = { expired: 0, none: 0, bad: 0 };
    for (const row of saved) {
      const status = maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract);
      if (status === '不整合') counts.bad++;
      else if (status === '×') counts.expired++;
      else if (status === null) counts.none++;
    }
    return counts;
  }, [saved]);

  const set = (key: keyof Asset) => (value: string) =>
    setAsset((prev) => ({ ...prev, [key]: value }));

  /** 実機に問い合わせて表示するだけ。DB には保存しない */
  const fetchLive = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    setProbe(null);
    try {
      setProbe(
        await request<Probe>('/printers/probe', {
          method: 'POST',
          body: JSON.stringify({
            ipAddress: asset.ipAddress.trim(),
            community: community.trim() || undefined,
          }),
        }),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 手入力の台帳を保存する */
  const save = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const body = JSON.stringify(toPayload(asset));
      const result =
        editingId === null
          ? await request<SavedAsset>('/printer-assets', { method: 'POST', body })
          : await request<SavedAsset>(`/printer-assets/${editingId}`, {
              method: 'PATCH',
              body,
            });

      setNotice(
        `${result.department ?? '部署未設定'} No.${result.no ?? '—'} を${
          editingId === null ? '登録' : '更新'
        }しました`,
      );
      setEditingId(result.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 中身は変えず、更新日だけ現在時刻に進める */
  const touch = async (row: SavedAsset) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await request<SavedAsset>(`/printer-assets/${row.id}/touch`, {
        method: 'POST',
      });
      setNotice(
        `${result.department ?? '部署未設定'} No.${result.no ?? '—'} の更新日を ` +
          `${new Date(result.updatedAt).toLocaleString('ja-JP')} にしました`,
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (row: SavedAsset) => {
    setAsset(toForm(row));
    setEditingId(row.id);
    setProbe(null);
    setError(null);
    setNotice(null);
  };

  const remove = async (row: SavedAsset) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;
    if (!window.confirm(`${label} を削除します。よろしいですか。`)) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<{ id: number }>(`/printer-assets/${row.id}`, { method: 'DELETE' });
      setNotice(`${label} を削除しました`);
      if (editingId === row.id) {
        setAsset(EMPTY);
        setEditingId(null);
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setAsset(EMPTY);
    setEditingId(null);
    setProbe(null);
    setError(null);
    setNotice(null);
  };

  const serialMatch = probe ? compare(asset.serialNumber, probe.serialNumber) : null;
  const makerMatch =
    probe && asset.maker.trim() && probe.model
      ? probe.model.toLowerCase().includes(asset.maker.trim().toLowerCase())
        ? 'same'
        : 'diff'
      : null;

  const cellOf = (row: SavedAsset, key: SortKey) => {
    if (key === 'maintStatus')
      return maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract) ?? '—';
    if (key === 'maintFee') {
      return row.maintFee === null ? '—' : `${yen.format(row.maintFee)} 円`;
    }
    if (key === 'updatedAt') return new Date(row.updatedAt).toLocaleString('ja-JP');
    return row[key] ?? '—';
  };

  return (
    <div className="as">
      <header className="as-head">
        <h1>端末情報</h1>
        <p>
          台帳の項目を入力して保存します。IP アドレスから実機の今の状態を取得できますが、
          そちらは表示のみで保存しません。
        </p>
      </header>

      <section className="as-form">
        <label>
          <span>部署</span>
          <input value={asset.department} onChange={(e) => set('department')(e.target.value)} />
        </label>

        <label>
          <span>No.</span>
          <input value={asset.no} onChange={(e) => set('no')(e.target.value)} />
        </label>

        <label>
          <span>IP アドレス</span>
          <input
            value={asset.ipAddress}
            onChange={(e) => set('ipAddress')(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !busy && asset.ipAddress.trim() && void fetchLive()
            }
            placeholder="172.31.13.211"
            inputMode="decimal"
          />
        </label>

        <label>
          <span>メーカー</span>
          <input
            value={asset.maker}
            onChange={(e) => set('maker')(e.target.value)}
            placeholder="Ricoh"
          />
        </label>

        <label>
          <span>型番</span>
          <input
            value={asset.model}
            onChange={(e) => set('model')(e.target.value)}
            placeholder="P501"
          />
        </label>

        <label>
          <span>シリアル</span>
          <input
            value={asset.serialNumber}
            onChange={(e) => set('serialNumber')(e.target.value)}
            placeholder="48PM-122682"
          />
        </label>

        <label>
          <span>購入日</span>
          <input
            type="date"
            value={asset.purchasedOn}
            onChange={(e) => set('purchasedOn')(e.target.value)}
          />
        </label>

        <label>
          <span>契約 No.</span>
          <input value={asset.contractNo} onChange={(e) => set('contractNo')(e.target.value)} />
        </label>

        {/*
          保守終了日があれば日付から判定する。無いときだけ手で選べるようにする。
          日付を入れたあとも手入力の値は消さずに持っておき、日付を消せばまた効く
        */}
        {asset.maintEndOn.trim() === '' ? (
          <label>
            <span>保守（保守終了日が無いので手動）</span>
            <select
              value={asset.maintContract}
              onChange={(e) => set('maintContract')(e.target.value)}
            >
              <option value="">—（未設定）</option>
              {MANUAL_MAINT.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="as-derived">
            <span>保守（保守終了日から自動判定）</span>
            <p>
              {maintStatus(
                orNull(asset.maintEndOn),
                orNull(asset.maintStartOn),
                orNull(asset.maintContract),
              ) ?? '—'}
            </p>
          </div>
        )}

        <label>
          <span>保守開始日</span>
          <input
            type="date"
            value={asset.maintStartOn}
            onChange={(e) => set('maintStartOn')(e.target.value)}
          />
        </label>

        <label>
          <span>保守終了日</span>
          <input
            type="date"
            value={asset.maintEndOn}
            onChange={(e) => set('maintEndOn')(e.target.value)}
          />
        </label>

        <label>
          <span>保守取引日</span>
          <input
            type="date"
            value={asset.maintDealOn}
            onChange={(e) => set('maintDealOn')(e.target.value)}
          />
        </label>

        <label>
          <span>保守金額（円）</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={asset.maintFee}
            onChange={(e) => set('maintFee')(e.target.value)}
            placeholder="0"
          />
        </label>

        <label className="as-wide">
          <span>備考</span>
          <input
            value={asset.note}
            onChange={(e) => set('note')(e.target.value)}
            placeholder="リース / USB接続 など"
          />
        </label>

        <label>
          <span>コミュニティ名（取得用・保存しません）</span>
          <input value={community} onChange={(e) => setCommunity(e.target.value)} />
        </label>

        <div className="as-actions">
          <button onClick={() => void save()} disabled={busy}>
            {editingId === null ? '台帳に保存' : '台帳を更新'}
          </button>
          <button
            className="as-sub"
            onClick={() => void fetchLive()}
            disabled={busy || !asset.ipAddress.trim()}
            type="button"
          >
            {busy ? '取得中…' : '実機情報を取得'}
          </button>
          <button className="as-sub" onClick={clear} disabled={busy} type="button">
            クリア
          </button>
          {editingId !== null && <span className="as-editing">ID {editingId} を編集中</span>}
        </div>
      </section>

      {error && <p className="as-msg as-msg-error">{error}</p>}
      {notice && <p className="as-msg as-msg-ok">{notice}</p>}

      {probe && (
        <section className="as-result">
          <div className="as-result-head">
            <span className="as-ip-label">{probe.ipAddress}</span>
            <span className="as-model">
              {probe.model ?? probe.hostName ?? '機種名を取得できませんでした'}
            </span>
            <span className="as-badge">SNMP v{probe.version}</span>
          </div>

          <dl className="as-meta">
            <div>
              <dt>ホスト名</dt>
              <dd>{probe.hostName ?? '—'}</dd>
            </div>
            <div>
              <dt>シリアル（実機）</dt>
              <dd>
                {probe.serialNumber ?? '—'}
                {serialMatch === 'same' && <span className="as-chip as-chip-ok">台帳と一致</span>}
                {serialMatch === 'diff' && <span className="as-chip as-chip-ng">台帳と不一致</span>}
              </dd>
            </div>
            <div>
              <dt>メーカー・機種</dt>
              <dd>
                {probe.model ?? '—'}
                {makerMatch === 'diff' && <span className="as-chip as-chip-ng">台帳と不一致</span>}
              </dd>
            </div>
            <div>
              <dt>MAC</dt>
              <dd>{probe.macAddress ?? '—'}</dd>
            </div>
            <div>
              <dt>累計印刷</dt>
              <dd>{probe.pageCount?.toLocaleString() ?? '—'} 枚</dd>
            </div>
            <div>
              <dt>取得時刻</dt>
              <dd>{new Date(probe.polledAt).toLocaleString('ja-JP')}</dd>
            </div>
          </dl>

          {probe.supplies.length > 0 && (
            <ul className="as-supplies">
              {probe.supplies.map((s) => (
                <li key={s.supplyIndex}>
                  <span className="as-supply-name">{s.name}</span>
                  <span className="as-bar" aria-hidden>
                    <span className="as-bar-fill" style={{ width: `${s.percent ?? 0}%` }} />
                  </span>
                  <span className="as-supply-pct">
                    {s.percent !== null ? `${s.percent}%` : s.level === -3 ? '残量あり' : '不明'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="as-note">この取得結果は表示のみで、DB には保存していません。</p>
        </section>
      )}

      <section className="as-list">
        <h2>登録した端末（{saved.length} 台）</h2>

        <p className="as-legend">
          <span className="as-legend-item">
            <span className="as-swatch as-swatch-expired" aria-hidden />
            保守切れ（{maintCounts.expired} 台）保守終了日が過ぎています
          </span>
          <span className="as-legend-item">
            <span className="as-swatch as-swatch-none" aria-hidden />
            保守なし（{maintCounts.none} 台）保守終了日も手動の指定も入っていません
          </span>
          <span className="as-legend-item">
            <span className="as-swatch as-swatch-bad" aria-hidden />
            不整合（{maintCounts.bad} 台）保守終了日が保守開始日より前です
          </span>
          <span className="as-legend-note">
            色の付いていない行は保守有です。保守の欄は保守開始日と保守終了日から判定します。
            保守終了日が入っていない機器だけ、入力欄で「有」「×」を選べます。
            日付を入れると日付の判定が優先されます（手動の指定は消えず、日付を消せばまた効きます）。
          </span>
        </p>

        <p className="as-hint">見出しを押すと並べ替わります。空欄の行は向きによらず末尾に置きます。</p>

        {saved.length === 0 ? (
          <p className="as-empty">まだ登録がありません。上の欄を入力して保存してください。</p>
        ) : (
          <div className="as-table-wrap">
            <table className="as-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'as-num' : undefined}
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
                        <span className="as-arrow" aria-hidden>
                          {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const status = maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract);

                  return (
                  <tr
                    key={row.id}
                    className={
                      [
                        // 編集中の強調は残したいので、期限切れの色と重ねる
                        row.id === editingId ? 'as-row-on' : '',
                        status === '不整合'
                          ? 'as-row-bad'
                          : status === '×'
                            ? 'as-row-expired'
                            : status === null
                              ? 'as-row-none'
                              : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={
                          col.numeric
                            ? 'as-num'
                            : col.key === 'ipAddress' || col.key === 'serialNumber'
                              ? 'as-mono'
                              : undefined
                        }
                      >
                        {cellOf(row, col.key)}
                      </td>
                    ))}
                    <td className="as-ops">
                      <button onClick={() => void touch(row)} disabled={busy} type="button">
                        更新
                      </button>
                      <button onClick={() => edit(row)} disabled={busy} type="button">
                        編集
                      </button>
                      <button
                        className="as-del"
                        onClick={() => void remove(row)}
                        disabled={busy}
                        type="button"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
