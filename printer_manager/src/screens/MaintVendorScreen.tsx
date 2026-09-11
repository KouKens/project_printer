import { useCallback, useEffect, useId, useState } from 'react';
import CsvButton from '../components/CsvButton';
import Modal from '../components/Modal';
import type { CsvValue } from '../lib/csv';
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

/**
 * CSV に出す列。**この画面は表ではなく札（カード）で並べている**ので、
 * 札に出している中身をそのまま列に開く。
 * 台数は「メーカーの既定で見ている台」と「名指しされた台」を分けて出す
 * （合計だけだと、どちらで担当が決まっているのか分からない）
 */
const CSV_COLUMNS: { label: string; value: (vendor: Vendor) => CsvValue }[] = [
  { label: '会社名', value: (vendor) => vendor.name },
  { label: '電話番号', value: (vendor) => vendor.phones.join(' / ') },
  { label: '既定にするメーカー', value: (vendor) => vendor.makers.join('・') },
  { label: 'メーカー既定の台数', value: (vendor) => vendor.makerAssetCount },
  { label: '名指しの台数', value: (vendor) => vendor.assets.length },
  {
    label: '合計台数',
    value: (vendor) => vendor.makerAssetCount + vendor.assets.length,
  },
  {
    label: '名指しの機器',
    value: (vendor) => vendor.assets.map(assetLabel).join(' / '),
  },
  { label: '備考', value: (vendor) => vendor.note },
  {
    label: '更新日時',
    value: (vendor) => new Date(vendor.updatedAt).toLocaleString('ja-JP'),
  },
];

/** 送る形。電話番号の空欄の行は連絡先として持たない */
const toPayload = (form: Form) => ({
  name: form.name.trim(),
  phones: form.phones.map((phone) => phone.trim()).filter(Boolean),
  makers: form.makers,
  note: form.note.trim() === '' ? null : form.note.trim(),
});

/** 保存済みの業者を入力欄の形にする */
const toForm = (vendor: Vendor): Form => ({
  name: vendor.name,
  // 行数が変わるとちらつくので、足りないぶんは空欄で埋める
  phones: Array.from({ length: PHONE_SLOTS }, (_, i) => vendor.phones[i] ?? ''),
  makers: vendor.makers,
  note: vendor.note ?? '',
});

/**
 * 入力欄。新規登録の欄と、編集の小窓で同じものを使う。
 *
 * `autoMakers` のあいだは、会社名を打つとメーカーの印を補う。
 * 印を手で触ったら `onMakersTouched` で知らせ、親は以後 `autoMakers` を落とす。
 * **編集では補わない**（保存済みの印をそのまま使い、会社名から補い直さない）
 */
function VendorFields({
  form,
  onChange,
  makers,
  autoMakers,
  onMakersTouched,
}: {
  form: Form;
  onChange: (update: (prev: Form) => Form) => void;
  /** 印を付けられるメーカー。台帳にある分だけ、多い順 */
  makers: string[];
  autoMakers: boolean;
  onMakersTouched?: () => void;
}) {
  // 新規の欄と小窓が同時に並ぶので、datalist の id を欄ごとに分ける
  const makersListId = useId();

  /**
   * 印を並べるメーカー。台帳のメーカーに、**保存済みの印で台帳に無いもの**を足す。
   * 台帳の一覧は有効な機器から作るので、そのメーカーの機器を全部無効にすると
   * 一覧から消えるが、印は業者に残っている。並べないと小窓では見えないまま
   * 保存し直され、画面から外す手段も無くなる。
   *
   * 足す分は**開いた時点の印**で決めて覚えておく。今の下書きから作ると、
   * 印を外した途端に欄ごと消え、押し間違えたときに付け直せない
   */
  const [stray] = useState(() => form.makers.filter((maker) => !makers.includes(maker)));
  const options = [...makers, ...stray.filter((maker) => !makers.includes(maker))];

  const set = (key: 'name' | 'note') => (value: string) =>
    onChange((prev) => {
      const next = { ...prev, [key]: value };
      if (key !== 'name' || !autoMakers) return next;

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
    onChange((prev) => ({
      ...prev,
      phones: prev.phones.map((phone, i) => (i === index ? value : phone)),
    }));

  const toggleMaker = (maker: string) => {
    onMakersTouched?.();
    onChange((prev) => ({
      ...prev,
      makers: prev.makers.includes(maker)
        ? prev.makers.filter((m) => m !== maker)
        : [...prev.makers, maker],
    }));
  };

  return (
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
          list={makersListId}
          value={form.name}
          onChange={(e) => set('name')(e.target.value)}
          placeholder="メーカー名から選ぶか、業者名を入力"
        />
        <datalist id={makersListId}>
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
          {options.length === 0 ? (
            <span className="mv-muted">台帳にメーカーの登録がありません</span>
          ) : (
            options.map((maker) => (
              <label key={maker}>
                <input
                  type="checkbox"
                  checked={form.makers.includes(maker)}
                  onChange={() => toggleMaker(maker)}
                />
                <span>{maker}</span>
                {!makers.includes(maker) && (
                  <span
                    className="mv-muted"
                    title="この表記のメーカーの機器が、有効な台帳にありません（無効にした・表記が違う）。既定から外すときは印を外して更新してください"
                  >
                    （台帳に無し）
                  </span>
                )}
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
  );
}

export default function MaintVendorScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  /** 会社名の候補に出すメーカー名。台帳にある分だけ、多い順に並べる */
  const [makers, setMakers] = useState<string[]>([]);
  /** 新規登録の欄。**新規専用。** 登録済みの業者を直すのは下の小窓 */
  const [form, setForm] = useState<Form>(emptyForm);
  /** 編集の小窓。null なら閉じている。新規の欄とは別に下書きを持つ */
  const [editing, setEditing] = useState<{ id: number; name: string; form: Form } | null>(
    null,
  );
  const [editError, setEditError] = useState<string | null>(null);
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

  const setDraft = (update: (prev: Form) => Form) =>
    setEditing((prev) => prev && { ...prev, form: update(prev.form) });

  /** 新規登録。上の欄は新規専用なので、登録したら空に戻す（続けて押しても二重にならない） */
  const create = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<Vendor>('/maint-vendors', {
        method: 'POST',
        body: JSON.stringify(toPayload(form)),
      });
      setNotice(`${form.name.trim()} を登録しました`);
      setForm(emptyForm());
      setMakersTouched(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 札の「編集」。小窓を開くだけで、上の新規の欄には触らない */
  const edit = (vendor: Vendor) => {
    setEditing({ id: vendor.id, name: vendor.name, form: toForm(vendor) });
    setEditError(null);
    setNotice(null);
  };

  /**
   * 小窓の保存。**失敗したら小窓を開いたまま、中に文面を出す**
   * （閉じると直した値が消え、後ろの知らせ欄は覆われて見えない）
   */
  const update = async () => {
    if (editing === null) return;
    setBusy(true);
    setEditError(null);
    try {
      await request<Vendor>(`/maint-vendors/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(toPayload(editing.form)),
      });
      setNotice(`${editing.form.name.trim()} を更新しました`);
      setEditing(null);
      await load();
    } catch (err) {
      setEditError((err as Error).message);
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
        <h2>新しい保守企業</h2>

        <VendorFields
          form={form}
          onChange={setForm}
          makers={makers}
          autoMakers={!makersTouched}
          onMakersTouched={() => setMakersTouched(true)}
        />

        <div className="mv-actions">
          <button onClick={() => void create()} disabled={busy || !canSave} type="button">
            登録
          </button>
        </div>

        {error && <p className="mv-msg mv-msg-error">{error}</p>}
        {notice && <p className="mv-msg mv-msg-ok">{notice}</p>}
      </section>

      <section className="mv-list">
        <h2>
          登録した保守企業（{vendors.length} 社）
          <CsvButton
            name="保守登録"
            header={CSV_COLUMNS.map((col) => col.label)}
            rows={() =>
              vendors.map((vendor) => CSV_COLUMNS.map((col) => col.value(vendor)))
            }
            count={vendors.length}
          />
        </h2>

        {vendors.length === 0 ? (
          <p className="mv-empty">
            まだ登録がありません。上の欄を入力して登録してください。
          </p>
        ) : (
          <ul className="mv-cards">
            {vendors.map((vendor) => (
              <li
                key={vendor.id}
                className={vendor.id === editing?.id ? 'mv-card mv-card-on' : 'mv-card'}
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

      {editing && (
        <Modal
          title={`${editing.name} を編集`}
          onClose={() => setEditing(null)}
          busy={busy}
          error={editError}
          width={820}
          footer={
            <>
              <button
                className="md-sub"
                type="button"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => void update()}
                disabled={busy || editing.form.name.trim() === ''}
              >
                {busy ? '保存中…' : '更新'}
              </button>
            </>
          }
        >
          <VendorFields
            form={editing.form}
            onChange={setDraft}
            makers={makers}
            autoMakers={false}
          />
        </Modal>
      )}
    </div>
  );
}
