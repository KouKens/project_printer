import { useCallback, useEffect, useMemo, useState } from 'react';
import { num } from '../lib/format';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './RepairScreen.css';

/**
 * 修理分類。値は API の enum、表示は現場の呼び名。
 * 前半 4 つは元の分類そのまま。後半はこの台数で実際に起きている故障を足した
 */
const CATEGORIES: { value: string; label: string }[] = [
  { value: 'PART_REPLACEMENT', label: 'パーツ交換表示' },
  { value: 'SENSOR_DIRT', label: 'センサー汚れ' },
  { value: 'PAPER_JAM', label: '用紙詰まり' },
  { value: 'PRINT_QUALITY', label: 'インクのかすれ・色合い不調' },
  { value: 'SERVICE_CALL', label: 'サービスコール（SC 表示で停止）' },
  { value: 'FEED_FAILURE', label: '給紙不良（重送・給紙されない）' },
  { value: 'FUSING_FAILURE', label: '定着不良（印字が剥がれる）' },
  { value: 'NETWORK', label: 'ネットワーク・通信不良' },
  { value: 'NOISE_SMELL', label: '異音・異臭' },
  { value: 'NO_POWER', label: '電源が入らない' },
  { value: 'OTHER', label: 'その他' },
];

/** 対応区分。業者を呼んだか、自分たちで直したか */
const HANDLERS: { value: string; label: string }[] = [
  { value: 'IN_HOUSE', label: '自分で対応' },
  { value: 'VENDOR', label: '業者を呼んだ' },
];

/** 状態。対応の進み方の順に並べる */
const STATUSES: { value: string; label: string }[] = [
  { value: 'INVESTIGATING', label: '調査中' },
  { value: 'INQUIRING', label: '問い合わせ中' },
  { value: 'AWAITING_REPLY', label: '連絡待ち' },
  { value: 'QUOTING', label: '見積中' },
  { value: 'SETTLING', label: '決算中' },
  { value: 'SHIPPED', label: '発送済' },
  { value: 'RECEIVED', label: '受取済' },
  { value: 'DONE', label: '完了' },
];

const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;
const handlerLabel = (value: string) =>
  HANDLERS.find((h) => h.value === value)?.label ?? value;
const statusLabel = (value: string) =>
  STATUSES.find((s) => s.value === value)?.label ?? value;

/** 入力欄の状態。日付は <input type="date"> に合わせて文字列で持つ */
type Form = {
  assignee: string;
  printerAssetId: string;
  occurredOn: string;
  category: string;
  handledBy: string;
  detail: string;
  cost: string;
  restoredOn: string;
  status: string;
};

/**
 * 日付は勝手に決めない。入っていた日付をそのまま登録してしまうと、
 * 誰も確かめていない値が履歴に残るため。
 * 修理分類も選ばなければ空のまま登録する
 */
const emptyForm = (): Form => ({
  assignee: '',
  printerAssetId: '',
  occurredOn: '',
  category: '',
  handledBy: 'IN_HOUSE',
  detail: '',
  cost: '',
  restoredOn: '',
  status: 'INVESTIGATING',
});

type Repair = {
  id: number;
  assignee: string | null;
  printerAssetId: number;
  /** 台帳の拠点名。API が添えて返す */
  company: string | null;
  department: string | null;
  no: string | null;
  maker: string | null;
  model: string | null;
  occurredOn: string | null;
  category: string | null;
  handledBy: string;
  detail: string | null;
  cost: number | null;
  restoredOn: string | null;
  status: string;
  updatedAt: string;
};

/** 選択肢に出す台帳の 1 件 */
type Asset = {
  id: number;
  /** 持っている拠点。修理は全拠点まとめて見るので、どこの機器かを呼び名に出す */
  company: { id: number; name: string } | null;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
};

/**
 * トナーマスタの 1 件。使うのは品番・名称と、どの台帳に紐づいているかだけ。
 * 台帳から見たトナー名が要るので、こちらを引いて向きを逆にする
 */
type TonerRow = {
  id: string;
  name: string | null;
  printers: { id: number }[];
};

type SortKey =
  | 'occurredOn'
  | 'restoredOn'
  | 'printer'
  | 'category'
  | 'handledBy'
  | 'status'
  | 'assignee'
  | 'detail'
  | 'cost';

const COLUMNS: { key: SortKey; label: string; kind: CellKind }[] = [
  { key: 'occurredOn', label: '発生日', kind: 'date' },
  { key: 'printer', label: 'プリンター', kind: 'text' },
  { key: 'category', label: '修理分類', kind: 'text' },
  { key: 'handledBy', label: '対応区分', kind: 'text' },
  { key: 'detail', label: '修理内容', kind: 'text' },
  { key: 'cost', label: '費用', kind: 'number' },
  { key: 'restoredOn', label: '復旧日', kind: 'date' },
  { key: 'status', label: '状態', kind: 'text' },
  { key: 'assignee', label: '担当', kind: 'text' },
];

/** 空欄は「入力されなかった」ので null で送る */
const blankToNull = (value: string) => (value.trim() === '' ? null : value);

/** 項目の区切りに使う全角空白。狭い空白だと部署と No. がくっついて読めない */
const WIDE_SPACE = '　';

/** 台帳の呼び名。部署と No. で人が識別できるようにする */
const assetLabel = (asset: {
  /** 台帳は { id, name }、修理履歴は拠点名の文字列で持っている */
  company: { name: string } | string | null
  department: string | null
  no: string | null
  maker: string | null
  model: string | null
}) =>
  [
    typeof asset.company === 'string' ? asset.company : (asset.company?.name ?? null),
    asset.department ?? '（部署なし）',
    asset.no ? `No.${asset.no}` : null,
    [asset.maker, asset.model].filter(Boolean).join(' ') || null,
  ]
    .filter(Boolean)
    .join(WIDE_SPACE);

/**
 * 検索に当てる文字列。部署・No.・IP・メーカー・型番に、
 * その機器が使うトナーの品番と名称を足す。
 * 「予約外来」でも「172.31.13.216」でも「IP04KA」でも同じ 1 台に行き着くようにする
 */
const haystack = (asset: Asset, toners: string[]) =>
  [
    asset.company?.name ?? null,
    asset.department,
    asset.no ? `No.${asset.no}` : null,
    asset.ipAddress,
    asset.maker,
    asset.model,
    ...toners,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/**
 * 空白区切りの語がすべて含まれる台帳を返す。
 * 「予約外来 Ricoh」のように場所とメーカーを並べて絞れるようにするため。
 * 何も打っていないうちは候補を出さない（受付のトナーを探す欄と同じ）
 */
function matchAssets(
  assets: Asset[],
  query: string,
  textOf: (asset: Asset) => string,
): Asset[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return assets.filter((asset) => {
    const text = textOf(asset);
    return words.every((word) => text.includes(word));
  });
}

/** 候補に出す一覧で、候補として出す最大の件数 */
const SHOW_MAX = 8;

export default function RepairScreen() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [toners, setToners] = useState<TonerRow[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  /** プリンターを探す欄の入力。選んだ機器そのものは form.printerAssetId が持つ */
  const [assetQuery, setAssetQuery] = useState('');
  /** 編集中の履歴。null なら新規 */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'occurredOn',
    dir: 'desc',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      // トナーは検索のために引く。台帳にはトナー名が無く、紐づけはトナー側が持つ
      const [rows, ledger, catalog] = await Promise.all([
        request<Repair[]>('/repairs'),
        request<Asset[]>('/printer-assets'),
        request<TonerRow[]>('/toners'),
      ]);
      setRepairs(rows);
      setAssets(ledger);
      setToners(catalog);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: keyof Form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(emptyForm());
    setAssetQuery('');
    setEditingId(null);
    setNotice(null);
  };

  /** 台帳 1 台につくトナー。紐づけはトナー側が持つので、向きを逆にして引き直す */
  const tonersByAsset = useMemo(() => {
    const map = new Map<number, TonerRow[]>();
    for (const toner of toners) {
      for (const printer of toner.printers) {
        const list = map.get(printer.id) ?? [];
        list.push(toner);
        map.set(printer.id, list);
      }
    }
    return map;
  }, [toners]);

  /** 打つたびに作り直さないよう、検索文字列は台帳ごとに 1 度だけ作る */
  const searchText = useMemo(() => {
    const text = new Map<number, string>();
    for (const asset of assets) {
      const names = (tonersByAsset.get(asset.id) ?? []).map(
        (toner) => `${toner.id} ${toner.name ?? ''}`,
      );
      text.set(asset.id, haystack(asset, names));
    }
    return text;
  }, [assets, tonersByAsset]);

  const candidates = useMemo(
    () => matchAssets(assets, assetQuery, (asset) => searchText.get(asset.id) ?? ''),
    [assets, assetQuery, searchText],
  );

  /** 選んでいる 1 台。まだなら null */
  const chosenAsset =
    assets.find((asset) => String(asset.id) === form.printerAssetId) ?? null;

  const pickAsset = (asset: Asset) => {
    set('printerAssetId')(String(asset.id));
    setAssetQuery('');
  };

  /** 候補に添えるトナー。品番だけで十分見分けがつくので名称は出さない */
  const tonerIdsOf = (asset: Asset) => {
    const list = tonersByAsset.get(asset.id) ?? [];
    const heads = list.slice(0, 3).map((toner) => toner.id);
    return list.length > 3 ? `${heads.join('・')} ほか` : heads.join('・');
  };

  const edit = (row: Repair) => {
    setForm({
      // 任意の欄は未入力なら空文字に戻す。<input> は null を受け取れない
      assignee: row.assignee ?? '',
      printerAssetId: String(row.printerAssetId),
      occurredOn: row.occurredOn ?? '',
      category: row.category ?? '',
      handledBy: row.handledBy,
      detail: row.detail ?? '',
      cost: row.cost === null ? '' : String(row.cost),
      restoredOn: row.restoredOn ?? '',
      status: row.status,
    });
    setAssetQuery('');
    setEditingId(row.id);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      // 任意の欄は空欄のまま登録できる。API は未入力を null で受ける
      const body = JSON.stringify({
        assignee: blankToNull(form.assignee),
        printerAssetId: Number(form.printerAssetId),
        occurredOn: blankToNull(form.occurredOn),
        category: blankToNull(form.category),
        handledBy: form.handledBy,
        detail: blankToNull(form.detail),
        // 空欄は「まだ分からない」。0 円（保守で無償）とは区別する
        cost: form.cost.trim() === '' ? null : Number(form.cost),
        restoredOn: blankToNull(form.restoredOn),
        status: form.status,
      });

      if (editingId === null) {
        await request<Repair>('/repairs', { method: 'POST', body });
        setNotice('修理履歴を登録しました');
      } else {
        await request<Repair>(`/repairs/${editingId}`, { method: 'PATCH', body });
        setNotice('修理履歴を更新しました');
      }
      setForm(emptyForm());
      setAssetQuery('');
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: Repair) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request(`/repairs/${row.id}`, { method: 'DELETE' });
      setNotice(`${row.occurredOn} の履歴を削除しました`);
      if (editingId === row.id) reset();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 並べ替えの鍵。表示している文字で並べたいものは文字にして返す */
  const pick = (row: Repair, key: SortKey): unknown => {
    switch (key) {
      case 'printer':
        return assetLabel(row);
      case 'category':
        // 未選択は空欄として末尾に送りたいので null のまま返す
        return row.category === null ? null : categoryLabel(row.category);
      case 'handledBy':
        return handlerLabel(row.handledBy);
      case 'status':
        // 対応の進み方の順に並べたいので、選択肢の位置で並べる
        return STATUSES.findIndex((s) => s.value === row.status);
      default:
        return row[key];
    }
  };

  const shown = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(repairs, (row) => pick(row, sort.key), column?.kind ?? 'text', sort.dir, (row) => row.id);
  }, [repairs, sort]);

  const counts = useMemo(
    () => ({
      total: repairs.length,
      open: repairs.filter((r) => r.status !== 'DONE').length,
    }),
    [repairs],
  );

  /** 必須はプリンター名と対応区分の 2 つだけ。残りは空欄のままでも登録できる */
  const canSave = form.printerAssetId !== '' && form.handledBy !== '';

  return (
    <div className="rp">
      <header className="rp-head">
        <h1>修理履歴</h1>
        <p>
          不具合の発生から復旧までを 1 件ずつ残します。プリンターは端末台帳から選びます。
          必須はプリンター名と対応区分の 2 つだけです。発生日・復旧日・担当などは
          分かる範囲で埋めてください。あとから一覧の「編集」で足せます。
        </p>
      </header>

      <section className="rp-form">
        <h2>{editingId === null ? '新しい履歴' : `履歴を編集（ID ${editingId}）`}</h2>

        <div className="rp-grid">
          <label>
            <span>担当</span>
            <input
              value={form.assignee}
              onChange={(e) => set('assignee')(e.target.value)}
              placeholder="対応した人"
            />
          </label>

          <label>
            <span>
              対応区分<b className="rp-req">必須</b>
            </span>
            <select value={form.handledBy} onChange={(e) => set('handledBy')(e.target.value)}>
              {HANDLERS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>

          {/* 62 台を選択欄から探すのは無理があるので、絞り込んで 1 台を選ぶ */}
          <div className="rp-wide rp-find">
            <label htmlFor="rp-asset">
              プリンター名<b className="rp-req">必須</b>
            </label>

            {chosenAsset ? (
              <div className="rp-find-picked">
                <span>
                  {[assetLabel(chosenAsset), chosenAsset.ipAddress]
                    .filter(Boolean)
                    .join(WIDE_SPACE)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    set('printerAssetId')('');
                    setAssetQuery('');
                  }}
                >
                  選び直す
                </button>
              </div>
            ) : (
              <>
                <input
                  id="rp-asset"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={assetQuery}
                  onChange={(e) => setAssetQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    if (candidates.length > 0) pickAsset(candidates[0]);
                  }}
                  placeholder="部署名・No.・IP・型番・トナー名で検索"
                />

                <p className="rp-find-hint">
                  部署名（予約外来 など）・No.・IP・型番・トナー名で探せます。
                  空白で区切ると絞り込めます（例: 予約外来 Ricoh）。Enter で先頭を選びます。
                </p>

                {/* 打ち始めるまで候補は出さない。62 台が最初から並ぶと読めない */}
                {assetQuery.trim().length > 0 &&
                  (candidates.length === 0 ? (
                    <p className="rp-find-empty">該当する機器がありません</p>
                  ) : (
                    <ul className="rp-find-list">
                      {candidates.slice(0, SHOW_MAX).map((asset) => (
                        <li key={asset.id}>
                          <button
                            type="button"
                            className="rp-find-item"
                            onClick={() => pickAsset(asset)}
                          >
                            <span className="rp-find-name">{assetLabel(asset)}</span>
                            <span className="rp-find-sub">
                              {asset.ipAddress ?? 'IP なし'}
                            </span>
                            <span className="rp-find-sub">{tonerIdsOf(asset)}</span>
                          </button>
                        </li>
                      ))}
                      {candidates.length > SHOW_MAX && (
                        <li className="rp-find-more">
                          ほか {candidates.length - SHOW_MAX} 台。語を足すと絞れます
                        </li>
                      )}
                    </ul>
                  ))}
              </>
            )}
          </div>

          <label>
            <span>発生日</span>
            <input
              type="date"
              value={form.occurredOn}
              onChange={(e) => set('occurredOn')(e.target.value)}
            />
          </label>

          <label>
            <span>復旧日</span>
            <input
              type="date"
              value={form.restoredOn}
              onChange={(e) => set('restoredOn')(e.target.value)}
            />
          </label>

          <label>
            <span>修理分類</span>
            <select value={form.category} onChange={(e) => set('category')(e.target.value)}>
              <option value="">選ばない</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>状態</span>
            <select value={form.status} onChange={(e) => set('status')(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>費用（円・税別）</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.cost}
              onChange={(e) => set('cost')(e.target.value)}
              placeholder="保守で無償なら 0"
            />
          </label>

          <label className="rp-wide">
            <span>修理内容</span>
            <textarea
              rows={3}
              value={form.detail}
              onChange={(e) => set('detail')(e.target.value)}
              placeholder="何が起きて、何をしたか"
            />
          </label>
        </div>

        <div className="rp-actions">
          <button onClick={() => void save()} disabled={busy || !canSave} type="button">
            {editingId === null ? '登録' : '更新'}
          </button>
          {editingId !== null && (
            <button className="rp-plain" onClick={reset} disabled={busy} type="button">
              編集をやめる
            </button>
          )}
        </div>

        {error && <p className="rp-msg rp-msg-error">{error}</p>}
        {notice && <p className="rp-msg rp-msg-ok">{notice}</p>}
      </section>

      <section className="rp-list">
        <h2>
          過去の履歴（{counts.total} 件・対応中 {counts.open} 件）
        </h2>
        <p className="rp-hint">見出しを押すと並べ替わります。既定は発生日の新しい順です。</p>

        {shown.length === 0 ? (
          <p className="rp-empty">まだ履歴がありません。上の欄を入力して登録してください。</p>
        ) : (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
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
                        <span className="rp-arrow" aria-hidden>
                          {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      [
                        row.id === editingId ? 'rp-row-on' : '',
                        // 復旧していないものは目に入るようにする
                        row.status === 'DONE' ? '' : 'rp-row-open',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    <td>{row.occurredOn ?? '—'}</td>
                    <td>{assetLabel(row)}</td>
                    <td>{row.category === null ? '—' : categoryLabel(row.category)}</td>
                    <td>
                      <span
                        className={
                          row.handledBy === 'VENDOR'
                            ? 'rp-badge rp-badge-vendor'
                            : 'rp-badge rp-badge-inhouse'
                        }
                      >
                        {handlerLabel(row.handledBy)}
                      </span>
                    </td>
                    <td className="rp-detail">{row.detail ?? '—'}</td>
                    <td className="rp-num">
                      {row.cost === null ? '—' : `${num.format(row.cost)} 円`}
                    </td>
                    <td>{row.restoredOn ?? '—'}</td>
                    <td>
                      <span
                        className={
                          row.status === 'DONE' ? 'rp-badge rp-badge-done' : 'rp-badge'
                        }
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td>{row.assignee ?? '—'}</td>
                    <td className="rp-ops">
                      <button onClick={() => edit(row)} disabled={busy} type="button">
                        編集
                      </button>
                      <button
                        className="rp-del"
                        onClick={() => void remove(row)}
                        disabled={busy}
                        type="button"
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
