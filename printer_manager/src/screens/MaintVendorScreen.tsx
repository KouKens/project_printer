import { useCallback, useEffect, useState } from 'react';
import { foldKey } from '../lib/fold';
import { request } from '../lib/request';
import './MaintVendorScreen.css';

/** 電話番号の入力欄の数。代表・担当・夜間くらいで足りる */
const PHONE_SLOTS = 3;

/** 入力欄の状態。電話番号は空欄の行も持ち、送るときに落とす */
type Form = {
  name: string;
  phones: string[];
  /** この業者を既定にするメーカー。台帳に指定の無い機器がここに割り当たる */
  makers: string[];
  note: string;
};

const emptyForm = (): Form => ({
  name: '',
  phones: Array<string>(PHONE_SLOTS).fill(''),
  makers: [],
  note: '',
});

/** その業者が見ている機器。台帳から引いて添えてある */
type VendorAsset = {
  id: number;
  department: string | null;
  no: string | null;
  maker: string | null;
  model: string | null;
};

/** 台帳の 1 台。メーカー名を候補に出すために読む */
type Asset = { maker: string | null };

type Vendor = {
  id: number;
  name: string;
  phones: string[];
  makers: string[];
  note: string | null;
  /** メーカーの既定として見ている台数（台帳で業者を指定していない機器） */
  makerAssetCount: number;
  /** この業者を名指しで指定している機器 */
  assets: VendorAsset[];
  updatedAt: string;
};

/** 担当している機器の呼び名。部署と No. で人が識別できるようにする */
const assetLabel = (asset: VendorAsset) =>
  [asset.department ?? '（部署なし）', asset.no ? `No.${asset.no}` : null]
    .filter(Boolean)
    .join(' ');

export default function MaintVendorScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  /** 会社名の候補に出すメーカー名。台帳にある分だけ、多い順に並べる */
  const [makers, setMakers] = useState<string[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  /** 編集中の業者。null なら新規 */
  const [editingId, setEditingId] = useState<number | null>(null);
  /**
   * メーカーの印を手で触ったか。
   * 触るまでは会社名から自動で補うが、触った後は口を出さない
   */
  const [makersTouched, setMakersTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [rows, assets] = await Promise.all([
        request<Vendor[]>('/maint-vendors'),
        request<Asset[]>('/printer-assets'),
      ]);
      setVendors(rows);

      // 保守はメーカー系列に頼むことが多いので、台帳のメーカーを候補にする。
      // 台数の多いメーカーを上に置くと、たいてい 1 つ目か 2 つ目で当たる
      const count = new Map<string, number>();
      for (const asset of assets) {
        const maker = asset.maker?.trim();
        if (maker) count.set(maker, (count.get(maker) ?? 0) + 1);
      }
      setMakers(
        [...count.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([maker]) => maker),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: 'name' | 'note') => (value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key !== 'name' || makersTouched) return next;

      /*
       * 会社名にメーカー名をそのまま入れる使い方が多い。
       * 「会社名 = メーカー名」なら、そのメーカーの既定にしたいはずなので印を付ける。
       * 手でチェックを触った後は触らない
       */
      // API 側の makerKey と同じ畳み方にする（ＲＩＣＯＨ でも Ricoh に当たる）
      const hit = makers.find((maker) => foldKey(maker) === foldKey(value));
      next.makers = hit ? [hit] : [];
      return next;
    });

  /** 電話番号は複数行あるので、位置を指定して 1 行だけ差し替える */
  const setPhone = (index: number) => (value: string) =>
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.map((phone, i) => (i === index ? value : phone)),
    }));

  const toggleMaker = (maker: string) => {
    setMakersTouched(true);
    setForm((prev) => ({
      ...prev,
      makers: prev.makers.includes(maker)
        ? prev.makers.filter((m) => m !== maker)
        : [...prev.makers, maker],
    }));
  };

  const reset = () => {
    setForm(emptyForm());
    setMakersTouched(false);
    setEditingId(null);
    setNotice(null);
  };

  const edit = (vendor: Vendor) => {
    setForm({
      name: vendor.name,
      // 行数が変わるとちらつくので、足りないぶんは空欄で埋める
      phones: Array.from(
        { length: PHONE_SLOTS },
        (_, i) => vendor.phones[i] ?? '',
      ),
      makers: vendor.makers,
      note: vendor.note ?? '',
    });
    // 保存済みの印をそのまま使う。会社名から補い直さない
    setMakersTouched(true);
    setEditingId(vendor.id);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const body = JSON.stringify({
        name: form.name.trim(),
        // 空欄の行は連絡先として持たない
        phones: form.phones.map((phone) => phone.trim()).filter(Boolean),
        makers: form.makers,
        note: form.note.trim() === '' ? null : form.note.trim(),
      });

      if (editingId === null) {
        await request<Vendor>('/maint-vendors', { method: 'POST', body });
        setNotice(`${form.name.trim()} を登録しました`);
      } else {
        await request<Vendor>(`/maint-vendors/${editingId}`, {
          method: 'PATCH',
          body,
        });
        setNotice(`${form.name.trim()} を更新しました`);
      }
      setForm(emptyForm());
      setMakersTouched(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 消しても台帳は消えない。担当していた機器の保守業者が未設定に戻る。
   * 台数があるときは、戻る台数を見せてから消す
   */
  const remove = async (vendor: Vendor) => {
    if (
      vendor.assets.length > 0 &&
      !window.confirm(
        `${vendor.name} を削除すると、担当している ${vendor.assets.length} 台の` +
          '保守業者が未設定に戻ります。よろしいですか。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await request<{ clearedAssets: number }>(
        `/maint-vendors/${vendor.id}`,
        { method: 'DELETE' },
      );
      setNotice(
        result.clearedAssets > 0
          ? `${vendor.name} を削除しました（${result.clearedAssets} 台が未設定に戻りました）`
          : `${vendor.name} を削除しました`,
      );
      if (editingId === vendor.id) reset();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const canSave = form.name.trim() !== '';

  return (
    <div className="mv">
      <header className="mv-head">
        <h1>保守企業</h1>
        <p>
          保守を頼んでいる業者と連絡先をここにまとめます。端末情報の画面では、
          ここに登録した業者から選びます。番号が変わったときはこの 1 か所を直せば、
          その業者が見ている機器すべてに反映されます。
        </p>
      </header>

      <section className="mv-form">
        <h2>{editingId === null ? '新しい保守企業' : `編集（ID ${editingId}）`}</h2>

        <div className="mv-grid">
          <label>
            <span>
              会社名<b className="mv-req">必須</b>
            </span>
            {/*
              メーカー名から選べるようにしつつ、選択肢に無い業者
              （地元の事務機屋など）もそのまま打てるよう datalist にする
            */}
            <input
              list="mv-makers"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder="メーカー名から選ぶか、業者名を入力"
            />
            <datalist id="mv-makers">
              {makers.map((maker) => (
                <option key={maker} value={maker} />
              ))}
            </datalist>
          </label>

          <div className="mv-phones">
            <span>電話番号（{PHONE_SLOTS} 件まで）</span>
            {form.phones.map((phone, index) => (
              <input
                key={index}
                type="text"
                value={phone}
                onChange={(e) => setPhone(index)(e.target.value)}
                placeholder={
                  index === 0
                    ? '0942-00-0000（代表）'
                    : '担当者・夜間など（任意）'
                }
              />
            ))}
          </div>

          <div className="mv-wide mv-makers">
            <span>このメーカーの既定にする（任意）</span>
            <p className="mv-makers-hint">
              <b>ここに印を付けないと、機器には反映されません。</b>
              印を付けたメーカーの機器は、端末情報で業者を指定していなければ
              この業者に頼んでいるものとして扱います。1 台だけ別の業者に頼むときは、
              端末情報でその機器だけ選び直してください（そちらが優先されます）。
            </p>
            <div className="mv-makers-list">
              {makers.length === 0 ? (
                <span className="mv-muted">台帳にメーカーの登録がありません</span>
              ) : (
                makers.map((maker) => (
                  <label key={maker}>
                    <input
                      type="checkbox"
                      checked={form.makers.includes(maker)}
                      onChange={() => toggleMaker(maker)}
                    />
                    <span>{maker}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="mv-wide">
            <span>備考</span>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => set('note')(e.target.value)}
              placeholder="担当者名、訪問できる曜日、契約の覚書など"
            />
          </label>
        </div>

        <div className="mv-actions">
          <button onClick={() => void save()} disabled={busy || !canSave} type="button">
            {editingId === null ? '登録' : '更新'}
          </button>
          {editingId !== null && (
            <button className="mv-plain" onClick={reset} disabled={busy} type="button">
              編集をやめる
            </button>
          )}
        </div>

        {error && <p className="mv-msg mv-msg-error">{error}</p>}
        {notice && <p className="mv-msg mv-msg-ok">{notice}</p>}
      </section>

      <section className="mv-list">
        <h2>登録した保守企業（{vendors.length} 社）</h2>

        {vendors.length === 0 ? (
          <p className="mv-empty">
            まだ登録がありません。上の欄を入力して登録してください。
          </p>
        ) : (
          <ul className="mv-cards">
            {vendors.map((vendor) => (
              <li
                key={vendor.id}
                className={vendor.id === editingId ? 'mv-card mv-card-on' : 'mv-card'}
              >
                <div className="mv-card-head">
                  <h3>{vendor.name}</h3>
                  <span
                    className="mv-count"
                    title={
                      `メーカーの既定 ${vendor.makerAssetCount} 台 / ` +
                      `この業者を指定 ${vendor.assets.length} 台`
                    }
                  >
                    {vendor.makerAssetCount + vendor.assets.length} 台
                  </span>
                </div>

                {vendor.phones.length === 0 ? (
                  <p className="mv-muted">電話番号は未登録です</p>
                ) : (
                  <ul className="mv-phone-list">
                    {vendor.phones.map((phone, index) => (
                      <li key={index}>{phone}</li>
                    ))}
                  </ul>
                )}

                {vendor.makers.length > 0 && (
                  <p className="mv-maker-chips">
                    {vendor.makers.map((maker) => (
                      <span className="mv-chip" key={maker}>
                        {maker}
                      </span>
                    ))}
                    <span className="mv-muted">の既定</span>
                  </p>
                )}

                {vendor.note && <p className="mv-note">{vendor.note}</p>}

                <p className="mv-assets-sum">
                  メーカー既定 {vendor.makerAssetCount} 台・名指し{' '}
                  {vendor.assets.length} 台
                </p>

                {vendor.assets.length > 0 && (
                  <p
                    className="mv-assets"
                    title={vendor.assets.map(assetLabel).join('\n')}
                  >
                    名指し: {vendor.assets.slice(0, 4).map(assetLabel).join('、')}
                    {vendor.assets.length > 4 &&
                      ` ほか ${vendor.assets.length - 4} 台`}
                  </p>
                )}

                <div className="mv-ops">
                  <button onClick={() => edit(vendor)} disabled={busy} type="button">
                    編集
                  </button>
                  <button
                    className="mv-del"
                    onClick={() => void remove(vendor)}
                    disabled={busy}
                    type="button"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
