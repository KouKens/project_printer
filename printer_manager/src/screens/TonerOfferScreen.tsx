import { useEffect, useId, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import Modal from '../components/Modal';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { CsvValue } from '../lib/csv';
import { todayIso } from '../lib/date';
import { num } from '../lib/format';
import {
  guessPart,
  isExpired,
  KIND_LABELS,
  KIND_ORDER,
  PART_HINTS,
  PART_LABELS,
  PART_ORDER,
  perPageBreakdown,
  perPageOf,
  PURCHASE_LABELS,
  PURCHASE_ORDER,
  takesBackLabel,
} from '../lib/offer';
import type {
  LedgerModel,
  Offer,
  OfferKind,
  OfferList,
  PurchaseType,
  SupplyPart,
} from '../lib/offer';
import { request } from '../lib/request';
import { hits, searchWords } from '../lib/search';
import { suggestions } from '../lib/suggest';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import './DataTable.css';
import './TonerOfferScreen.css';

/**
 * 比較用トナー登録。**価格を比べるためだけの情報**を、販売店 × 買い方ごとに 1 件ずつ入れる。
 * コード上の名前は TonerOffer / `/toner-offers` のまま（以前の画面名は「トナー情報登録」）。
 *
 * ここに入れたものは**トナー価格比較にだけ出る。** 受付・注文・在庫・棚卸・請求書・
 * 運用コストはトナー登録（実際に使っているトナー）しか見ない。
 * 使える機種は台帳の 1 台ではなく機種につなぐので、同じ機種を増やしても付け直さずに済む。
 */

/** 選んだ機種。保存するのは表記（メーカー・型番）で、key は画面の中で照らし合わせる用 */
type PickedModel = { maker: string | null; model: string; key: string };

/** 入力欄の状態。数値も文字列で持ち、送るときに直す */
type Form = {
  code: string;
  name: string;
  brand: string;
  kind: OfferKind;
  part: SupplyPart;
  color: string;
  yieldPages: string;
  packQuantity: string;
  seller: string;
  purchaseType: PurchaseType;
  price: string;
  pagePrice: string;
  monthlyFee: string;
  shippingFee: string;
  minOrder: string;
  leadTime: string;
  warranty: string;
  /** 使用済みの回収。'' は未確認 */
  takesBack: '' | 'yes' | 'no';
  payment: string;
  quotedOn: string;
  validUntil: string;
  reference: string;
  url: string;
  contact: string;
  note: string;
  models: PickedModel[];
};

/** 価格を確かめた日は今日から始める（見たその場で入れることが多い） */
const emptyForm = (): Form => ({
  code: '',
  name: '',
  brand: '',
  kind: 'GENUINE',
  part: 'TONER',
  color: '',
  yieldPages: '',
  packQuantity: '1',
  seller: '',
  purchaseType: 'SPOT',
  price: '',
  pagePrice: '',
  monthlyFee: '',
  shippingFee: '',
  minOrder: '',
  leadTime: '',
  warranty: '',
  takesBack: '',
  payment: '',
  quotedOn: todayIso(),
  validUntil: '',
  reference: '',
  url: '',
  contact: '',
  note: '',
  models: [],
});

const textOrNull = (value: string) => (value.trim() === '' ? null : value.trim());
const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));

/**
 * 送る形。**戻り値の型を `Record<keyof Form, …>` にして、欄の送り忘れをコンパイルで止める**
 * （更新は送らなかった項目に触らないので、送り忘れると直したつもりの値が残る）。
 * 空欄は null で送り、値を消す
 */
const toPayload = (form: Form): Record<keyof Form, unknown> => ({
  code: form.code.trim(),
  name: textOrNull(form.name),
  brand: textOrNull(form.brand),
  kind: form.kind,
  part: form.part,
  color: textOrNull(form.color),
  yieldPages: numberOrNull(form.yieldPages),
  packQuantity: numberOrNull(form.packQuantity) ?? 1,
  seller: form.seller.trim(),
  purchaseType: form.purchaseType,
  price: numberOrNull(form.price),
  pagePrice: numberOrNull(form.pagePrice),
  monthlyFee: numberOrNull(form.monthlyFee),
  shippingFee: numberOrNull(form.shippingFee),
  minOrder: numberOrNull(form.minOrder),
  leadTime: textOrNull(form.leadTime),
  warranty: textOrNull(form.warranty),
  takesBack: form.takesBack === '' ? null : form.takesBack === 'yes',
  payment: textOrNull(form.payment),
  quotedOn: textOrNull(form.quotedOn),
  validUntil: textOrNull(form.validUntil),
  reference: textOrNull(form.reference),
  url: textOrNull(form.url),
  contact: textOrNull(form.contact),
  note: textOrNull(form.note),
  models: form.models.map(({ maker, model }) => ({ maker, model })),
});

const str = (value: string | number | null) => (value === null ? '' : String(value));

/** 保存済みの 1 件を入力欄の形に */
const toForm = (offer: Offer): Form => ({
  code: offer.code,
  name: str(offer.name),
  brand: str(offer.brand),
  kind: offer.kind,
  part: offer.part,
  color: str(offer.color),
  yieldPages: str(offer.yieldPages),
  packQuantity: String(offer.packQuantity),
  seller: offer.seller,
  purchaseType: offer.purchaseType,
  price: str(offer.price),
  pagePrice: str(offer.pagePrice),
  monthlyFee: str(offer.monthlyFee),
  shippingFee: str(offer.shippingFee),
  minOrder: str(offer.minOrder),
  leadTime: str(offer.leadTime),
  warranty: str(offer.warranty),
  takesBack: offer.takesBack === null ? '' : offer.takesBack ? 'yes' : 'no',
  payment: str(offer.payment),
  quotedOn: str(offer.quotedOn),
  validUntil: str(offer.validUntil),
  reference: str(offer.reference),
  url: str(offer.url),
  contact: str(offer.contact),
  note: str(offer.note),
  models: offer.models.map(({ maker, model, key }) => ({ maker, model, key })),
});

const yen = (value: number | null) => (value === null ? null : `${num.format(Math.round(value))} 円`);
const perPage = (value: number | null) => (value === null ? null : `${value.toFixed(2)} 円`);

/**
 * 入力中の値から 1 本あたり・1 枚あたりを出す（`perPageOf`。API の costPerPageOf と同じ決め方）。
 * 月額はこの画面では割れない（台の枚数が要る）ので、足さずに断りを添える
 */
function previewOf(form: Form) {
  const price = numberOrNull(form.price);
  const pack = numberOrNull(form.packQuantity) ?? 1;
  const cost = perPageOf({
    price,
    packQuantity: pack,
    yieldPages: numberOrNull(form.yieldPages),
    pagePrice: numberOrNull(form.pagePrice),
    shippingFee: numberOrNull(form.shippingFee),
    minOrder: numberOrNull(form.minOrder),
    monthlyFee: numberOrNull(form.monthlyFee),
  });
  return {
    unit: price !== null && pack > 0 ? price / pack : null,
    cost,
    byCounter: form.pagePrice.trim() !== '',
    monthlyFee: numberOrNull(form.monthlyFee),
  };
}

/** 機種の呼び名を並べる。多いときは件数でまとめる */
function modelsText(labels: string[]): string {
  return labels.length > 2
    ? `${labels.slice(0, 2).join('、')} ほか ${labels.length - 2}`
    : labels.join('、');
}

/**
 * 入力欄。新規登録の欄と、編集・複製の小窓で同じものを使う
 * （**欄を足すときはここに 1 回足せば両方に出る**。送る形は toPayload / toForm）
 */
function OfferFields({
  form,
  onChange,
  ledgerModels,
  sellers,
  brands,
  colors,
  autoPart,
  onPartTouched,
}: {
  form: Form;
  onChange: (update: (prev: Form) => Form) => void;
  /** 有効な台帳の機種。チェックの選択肢 */
  ledgerModels: LedgerModel[];
  sellers: string[];
  brands: string[];
  colors: string[];
  /**
   * 品番・商品名を打つたびに種類を推し量って選び直すか（`guessPart`）。
   * **新規の欄で、種類を手で選ぶまでだけ。** 編集と複製では保存済み・写した値を動かさない
   */
  autoPart: boolean;
  /** 種類を手で選んだ。親は以後 `autoPart` を落とす */
  onPartTouched?: () => void;
}) {
  // 新規の欄と小窓が同時に並ぶので、datalist の id を欄ごとに分ける
  const sellerList = useId();
  const brandList = useId();
  const colorList = useId();
  const [modelQuery, setModelQuery] = useState('');

  /**
   * チェックに並べる機種。台帳の機種に、**保存済みで台帳に無いもの**を足す
   * （入れ替えて無効にした・表記が違う）。並べないと「N 機種選択中」に数えられるのに
   * 見えず、外す手段も無くなる。足す分は開いた時点で決める
   * （今の下書きから作ると、外した途端に消えて付け直せない）
   */
  const [stray] = useState(() =>
    form.models.filter((picked) => !ledgerModels.some((model) => model.key === picked.key)),
  );
  const options = [
    ...ledgerModels.map((model) => ({ ...model, inLedger: true })),
    ...stray.map((picked) => ({
      key: picked.key,
      maker: picked.maker,
      model: picked.model,
      label: [picked.maker, picked.model].filter(Boolean).join(' '),
      assetCount: 0,
      inLedger: false,
    })),
  ];
  const words = searchWords(modelQuery);
  const visible = options.filter((option) => hits([option.label], words));
  const picked = new Set(form.models.map((model) => model.key));

  const set =
    <K extends keyof Form>(key: K) =>
    (value: Form[K]) =>
      onChange((prev) => {
        const next = { ...prev, [key]: value };
        // 「ドラムユニット …」と打てばドラムに。手で選んだ後は口を出さない
        if (autoPart && (key === 'code' || key === 'name')) {
          next.part = guessPart(next.code, next.name || null);
        }
        return next;
      });

  const toggle = (option: (typeof options)[number]) =>
    onChange((prev) => ({
      ...prev,
      models: prev.models.some((model) => model.key === option.key)
        ? prev.models.filter((model) => model.key !== option.key)
        : [...prev.models, { maker: option.maker, model: option.model, key: option.key }],
    }));

  /** 絞り込んで出ている機種をまとめて付ける（「C3520」で探して色違いの型番を一度に付ける） */
  const pickVisible = () =>
    onChange((prev) => {
      const have = new Set(prev.models.map((model) => model.key));
      return {
        ...prev,
        models: [
          ...prev.models,
          ...visible
            .filter((option) => !have.has(option.key))
            .map((option) => ({ maker: option.maker, model: option.model, key: option.key })),
        ],
      };
    });

  const preview = previewOf(form);

  return (
    <div className="to-fields">
      <fieldset className="to-set">
        <legend>トナー</legend>
        <div className="to-grid">
          <label>
            <span>
              品番<b className="to-req">必須</b>
            </span>
            <input
              value={form.code}
              onChange={(e) => set('code')(e.target.value)}
              placeholder="P500H-R（販売店の表記のまま）"
            />
          </label>
          <label className="to-span2">
            <span>商品名</span>
            <input
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder="リサイクルトナー P500H 互換"
            />
          </label>
          <label>
            <span>区分</span>
            <select value={form.kind} onChange={(e) => set('kind')(e.target.value as OfferKind)}>
              {KIND_ORDER.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>種類</span>
            <select
              value={form.part}
              onChange={(e) => {
                onPartTouched?.();
                set('part')(e.target.value as SupplyPart);
              }}
              title={`${PART_HINTS[form.part]}。トナー価格比較は種類と色が同じものどうしで比べます`}
            >
              {PART_ORDER.map((part) => (
                <option key={part} value={part} title={PART_HINTS[part]}>
                  {PART_LABELS[part]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>色</span>
            <input
              list={colorList}
              value={form.color}
              onChange={(e) => set('color')(e.target.value)}
              placeholder="ブラック"
              title="トナー登録と同じ表記にすると、トナー価格比較で同じ色どうしが並びます"
            />
            <datalist id={colorList}>
              {colors.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>
          </label>
          <label>
            <span>製造元・ブランド</span>
            <input
              list={brandList}
              value={form.brand}
              onChange={(e) => set('brand')(e.target.value)}
              placeholder="純正ならメーカー、リサイクル品なら再生業者"
            />
            <datalist id={brandList}>
              {brands.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </label>
          <label>
            <span>印刷可能枚数（1 本）</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.yieldPages}
              onChange={(e) => set('yieldPages')(e.target.value)}
              placeholder="20000"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="to-set">
        <legend>購入先と買い方</legend>
        <div className="to-grid">
          <label className="to-span2">
            <span>
              販売店・購入先<b className="to-req">必須</b>
            </span>
            <input
              list={sellerList}
              value={form.seller}
              onChange={(e) => set('seller')(e.target.value)}
              placeholder="販売店・通販サイト・保守会社の名前"
            />
            <datalist id={sellerList}>
              {sellers.map((seller) => (
                <option key={seller} value={seller} />
              ))}
            </datalist>
          </label>
          <label>
            <span>購入形態</span>
            <select
              value={form.purchaseType}
              onChange={(e) => set('purchaseType')(e.target.value as PurchaseType)}
            >
              {PURCHASE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {PURCHASE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>支払い方法</span>
            <input
              value={form.payment}
              onChange={(e) => set('payment')(e.target.value)}
              placeholder="請求書払い（月末締め）"
            />
          </label>
          <label className="to-span2">
            <span>担当者・連絡先</span>
            <input
              value={form.contact}
              onChange={(e) => set('contact')(e.target.value)}
              placeholder="営業 山田様 0942-00-0000"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="to-set">
        <legend>価格（税別）</legend>
        <div className="to-grid">
          <label>
            <span>価格（入数ぶん）</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => set('price')(e.target.value)}
              placeholder="8000"
            />
          </label>
          <label>
            <span>入数（本）</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.packQuantity}
              onChange={(e) => set('packQuantity')(e.target.value)}
              title="1 つの値段で何本入っているか。2 本セットなら 2"
            />
          </label>
          <label>
            <span>1 枚あたりの料金</span>
            <input
              type="number"
              min="0"
              step="0.001"
              inputMode="decimal"
              value={form.pagePrice}
              onChange={(e) => set('pagePrice')(e.target.value)}
              placeholder="カウンター料金のときだけ"
              title="保守・キット契約のように枚数で払うときに入れます。入れると、価格 ÷ 枚数 ではなくこちらで比べます"
            />
          </label>
          <label>
            <span>月額の基本料金</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.monthlyFee}
              onChange={(e) => set('monthlyFee')(e.target.value)}
              placeholder="契約・定額のとき"
            />
          </label>
          <label>
            <span>送料・手数料（1 回）</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.shippingFee}
              onChange={(e) => set('shippingFee')(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <span>最小注文数（本）</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.minOrder}
              onChange={(e) => set('minOrder')(e.target.value)}
            />
          </label>
        </div>
        <p className="to-preview" aria-live="polite">
          {preview.unit === null && preview.cost.total === null ? (
            <span className="to-muted">
              価格と印刷可能枚数を入れると、1 本あたりと 1 枚あたりが出ます
            </span>
          ) : (
            <>
              {preview.unit !== null && <>1 本あたり {yen(preview.unit)}</>}
              {preview.unit !== null && preview.cost.total !== null && ' ／ '}
              {preview.cost.total !== null && (
                <>
                  1 枚あたり <strong>{perPage(preview.cost.total)}</strong>
                  <span className="to-muted">
                    {perPageBreakdown(preview.cost)
                      ? `（${perPageBreakdown(preview.cost)}）`
                      : preview.byCounter
                        ? '（カウンター料金）'
                        : ''}
                  </span>
                </>
              )}
            </>
          )}
        </p>
        {preview.cost.missing.length > 0 && (
          <p className="to-hint to-preview-note">
            1 枚あたりに入れていないもの: {preview.cost.missing.join('・')}
            {preview.monthlyFee !== null && `（月 ${yen(preview.monthlyFee)}）`}
          </p>
        )}
        <p className="to-hint">
          1 枚あたりには送料と月額の基本料金も含めて比べます。送料は 1 回の注文で最小注文数
          （空欄なら 1 箱）を頼むとして割り、月額はトナー価格比較でプリンターを選んだとき、
          その台の月の印刷枚数で割ります。
        </p>
      </fieldset>

      <fieldset className="to-set">
        <legend>条件と出どころ</legend>
        <div className="to-grid">
          <label>
            <span>納期</span>
            <input
              value={form.leadTime}
              onChange={(e) => set('leadTime')(e.target.value)}
              placeholder="翌営業日"
            />
          </label>
          <label>
            <span>使用済みの回収</span>
            <select
              value={form.takesBack}
              onChange={(e) => set('takesBack')(e.target.value as Form['takesBack'])}
            >
              <option value="">未確認</option>
              <option value="yes">あり</option>
              <option value="no">なし</option>
            </select>
          </label>
          <label className="to-span2">
            <span>品質保証</span>
            <input
              value={form.warranty}
              onChange={(e) => set('warranty')(e.target.value)}
              placeholder="トナーが原因の故障は修理費を負担（1 年）"
            />
          </label>
          <label>
            <span>価格を確かめた日</span>
            <input
              type="date"
              value={form.quotedOn}
              onChange={(e) => set('quotedOn')(e.target.value)}
            />
          </label>
          <label>
            <span>見積の有効期限</span>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => set('validUntil')(e.target.value)}
            />
          </label>
          <label>
            <span>見積番号・出典</span>
            <input
              value={form.reference}
              onChange={(e) => set('reference')(e.target.value)}
              placeholder="見積 No.2026-0915"
            />
          </label>
          <label>
            <span>商品ページ（URL）</span>
            <input
              type="url"
              value={form.url}
              onChange={(e) => set('url')(e.target.value)}
              placeholder="https://"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="to-set">
        <legend>
          使える機種（{form.models.length} 機種選択中）
        </legend>
        <p className="to-hint">
          台帳の 1 台ではなく<strong>機種</strong>に付けます。同じ機種の台はすべてこのトナーが使えるものとして、
          トナー価格比較でプリンターを選んだときに並びます。
        </p>
        <div className="to-model-tools">
          <input
            type="search"
            value={modelQuery}
            onChange={(e) => setModelQuery(e.target.value)}
            placeholder="機種を絞る（例: C3520）"
            aria-label="機種を絞る"
          />
          <button type="button" onClick={pickVisible} disabled={visible.length === 0}>
            出ている機種をすべて付ける
          </button>
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, models: [] }))}
            disabled={form.models.length === 0}
          >
            すべて外す
          </button>
        </div>
        <div className="to-models">
          {options.length === 0 ? (
            <span className="to-muted">有効な台帳に型番の入った機種がありません</span>
          ) : visible.length === 0 ? (
            <span className="to-muted">絞り込みに当てはまる機種がありません</span>
          ) : (
            visible.map((option) => (
              <label key={option.key}>
                <input
                  type="checkbox"
                  checked={picked.has(option.key)}
                  onChange={() => toggle(option)}
                />
                <span>{option.label}</span>
                {option.inLedger ? (
                  <span className="to-muted">{option.assetCount} 台</span>
                ) : (
                  <span
                    className="to-muted"
                    title="この表記の機種が、有効な台帳にありません（入れ替えて無効にした・表記が違う）。外すときは印を外して保存してください"
                  >
                    （台帳に無し）
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      </fieldset>

      <label className="to-note">
        <span>備考</span>
        <textarea
          rows={2}
          value={form.note}
          onChange={(e) => set('note')(e.target.value)}
          placeholder="まとめ買いの割引、キャンペーンの期限、使ってみた評判など"
        />
      </label>
    </div>
  );
}

type SortKey =
  | 'code'
  | 'kind'
  | 'part'
  | 'color'
  | 'seller'
  | 'purchaseType'
  | 'price'
  | 'unitPrice'
  | 'yieldPages'
  | 'costPerPage'
  | 'models'
  | 'quotedOn'
  | 'validUntil';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'code', label: '品番', kind: 'text' },
  { key: 'kind', label: '区分', kind: 'number' },
  { key: 'part', label: '種類', kind: 'number' },
  { key: 'color', label: '色', kind: 'text' },
  { key: 'seller', label: '販売店・購入先', kind: 'text' },
  { key: 'purchaseType', label: '購入形態', kind: 'number' },
  { key: 'price', label: '価格（税別）', kind: 'number', numeric: true },
  { key: 'unitPrice', label: '1 本あたり', kind: 'number', numeric: true },
  { key: 'yieldPages', label: '印刷可能枚数', kind: 'number', numeric: true },
  { key: 'costPerPage', label: '1 枚あたり', kind: 'number', numeric: true },
  { key: 'models', label: '使える機種', kind: 'text' },
  { key: 'quotedOn', label: '確かめた日', kind: 'date' },
  { key: 'validUntil', label: '有効期限', kind: 'date' },
];

/** CSV。画面の列より多く、入力した項目をすべて出す（比較の材料を表計算で並べ直せるように） */
const CSV_COLUMNS: { label: string; value: (offer: Offer) => CsvValue }[] = [
  { label: '品番', value: (o) => o.code },
  { label: '商品名', value: (o) => o.name },
  { label: '区分', value: (o) => KIND_LABELS[o.kind] },
  { label: '種類', value: (o) => PART_LABELS[o.part] },
  { label: '色', value: (o) => o.color },
  { label: '製造元・ブランド', value: (o) => o.brand },
  { label: '印刷可能枚数', value: (o) => o.yieldPages },
  { label: '販売店・購入先', value: (o) => o.seller },
  { label: '購入形態', value: (o) => PURCHASE_LABELS[o.purchaseType] },
  { label: '価格（税別）', value: (o) => o.price },
  { label: '入数', value: (o) => o.packQuantity },
  { label: '1 本あたり', value: (o) => (o.unitPrice === null ? null : Math.round(o.unitPrice)) },
  {
    label: '1 枚あたり（本体＋送料）',
    value: (o) => (o.costPerPage === null ? null : Number(o.costPerPage.toFixed(3))),
  },
  {
    label: '1 枚あたり（本体）',
    value: (o) => (o.basePerPage === null ? null : Number(o.basePerPage.toFixed(3))),
  },
  {
    label: '1 枚あたり（送料）',
    value: (o) => (o.shippingPerPage === null ? null : Number(o.shippingPerPage.toFixed(3))),
  },
  { label: '送料を割る本数', value: (o) => o.orderUnits },
  { label: '1 枚あたりの料金（カウンター）', value: (o) => o.pagePrice },
  { label: '月額の基本料金', value: (o) => o.monthlyFee },
  { label: '送料・手数料', value: (o) => o.shippingFee },
  { label: '最小注文数', value: (o) => o.minOrder },
  { label: '納期', value: (o) => o.leadTime },
  { label: '使用済みの回収', value: (o) => takesBackLabel(o.takesBack) },
  { label: '品質保証', value: (o) => o.warranty },
  { label: '支払い方法', value: (o) => o.payment },
  { label: '担当者・連絡先', value: (o) => o.contact },
  { label: '価格を確かめた日', value: (o) => o.quotedOn },
  { label: '見積の有効期限', value: (o) => o.validUntil },
  { label: '見積番号・出典', value: (o) => o.reference },
  { label: '商品ページ', value: (o) => o.url },
  { label: '使える機種', value: (o) => o.models.map((m) => m.label).join(' / ') },
  {
    label: '台帳に無い機種',
    value: (o) =>
      o.models
        .filter((m) => m.assetCount === 0)
        .map((m) => m.label)
        .join(' / '),
  },
  { label: 'トナー登録の品番', value: (o) => o.masterId },
  { label: '備考', value: (o) => o.note },
];

/** 小窓。編集は既存の 1 件を直し、複製は中身を写して新しく登録する */
type Editing = {
  mode: 'edit' | 'copy';
  id: number;
  title: string;
  form: Form;
};

export default function TonerOfferScreen() {
  const [data, setData] = useState<OfferList | null>(null);
  /** 新規登録の欄。**新規専用。** 登録済みのものを直すのは下の小窓 */
  const [form, setForm] = useState<Form>(emptyForm);
  /** 新規の欄の種類を手で選んだか。選ぶまでは品番・商品名から推し量って入れる */
  const [partTouched, setPartTouched] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'code', dir: 'asc' });

  /** 増やすと読み直す。保存・削除のあとに足す */
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let alive = true;
    request<OfferList>('/toner-offers')
      .then((loaded) => {
        if (!alive) return;
        setData(loaded);
        setError(null);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const offers = useMemo(() => data?.offers ?? [], [data]);
  const ledgerModels = useMemo(() => data?.models ?? [], [data]);
  const today = todayIso();

  // 入力候補。登録済みの比較用トナー（色はトナー登録の分も）から作る
  const sellers = useMemo(() => suggestions(offers.map((o) => o.seller)), [offers]);
  const brands = useMemo(() => suggestions(offers.map((o) => o.brand)), [offers]);
  const colors = useMemo(
    () => suggestions([...(data?.tonerColors ?? []), ...offers.map((o) => o.color)]),
    [data, offers],
  );

  const shown = useMemo(() => {
    const words = searchWords(query);
    const found = offers.filter((offer) =>
      hits(
        [
          offer.code,
          offer.name,
          offer.brand,
          offer.color,
          KIND_LABELS[offer.kind],
          PART_LABELS[offer.part],
          offer.seller,
          PURCHASE_LABELS[offer.purchaseType],
          offer.reference,
          offer.contact,
          offer.note,
          offer.masterId,
          ...offer.models.map((model) => model.label),
          offer.quotedOn,
          offer.validUntil,
        ],
        words,
      ),
    );

    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      found,
      (offer) => {
        switch (sort.key) {
          case 'kind':
            return KIND_ORDER.indexOf(offer.kind);
          case 'part':
            return PART_ORDER.indexOf(offer.part);
          case 'purchaseType':
            return PURCHASE_ORDER.indexOf(offer.purchaseType);
          case 'models':
            return modelsText(offer.models.map((model) => model.label)) || null;
          default:
            return offer[sort.key];
        }
      },
      column?.kind ?? 'text',
      sort.dir,
      (offer) => offers.indexOf(offer),
    );
  }, [offers, query, sort]);

  const setDraft = (update: (prev: Form) => Form) =>
    setEditing((prev) => prev && { ...prev, form: update(prev.form) });

  const nameOf = (draft: Form) => `${draft.code.trim()}（${draft.seller.trim()}）`;

  /** 新規登録。上の欄は新規専用なので、登録したら空に戻す（続けて押しても二重にならない） */
  const create = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<Offer>('/toner-offers', {
        method: 'POST',
        body: JSON.stringify(toPayload(form)),
      });
      setNotice(`${nameOf(form)} を登録しました`);
      setForm(emptyForm());
      setPartTouched(false);
      reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (offer: Offer) => {
    setEditing({
      mode: 'edit',
      id: offer.id,
      title: `${offer.code}（${offer.seller}）を編集`,
      form: toForm(offer),
    });
    setEditError(null);
    setNotice(null);
  };

  /**
   * 複製。**同じ品番を別の店で、同じ店の別の色を**、と続けて入れるときに使う。
   * 小窓で開くので、上の書きかけの新規登録には触らない
   */
  const copy = (offer: Offer) => {
    setEditing({
      mode: 'copy',
      id: offer.id,
      title: `${offer.code}（${offer.seller}）を写して新しく登録`,
      form: toForm(offer),
    });
    setEditError(null);
    setNotice(null);
  };

  /** 小窓の保存。**失敗したら小窓を開いたまま、中に文面を出す** */
  const save = async () => {
    if (editing === null) return;
    setBusy(true);
    setEditError(null);
    try {
      if (editing.mode === 'edit') {
        await request<Offer>(`/toner-offers/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(toPayload(editing.form)),
        });
        setNotice(`${nameOf(editing.form)} を更新しました`);
      } else {
        await request<Offer>('/toner-offers', {
          method: 'POST',
          body: JSON.stringify(toPayload(editing.form)),
        });
        setNotice(`${nameOf(editing.form)} を登録しました`);
      }
      setEditing(null);
      reload();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 他の画面から参照されないので、確かめてからそのまま消す */
  const remove = async (offer: Offer) => {
    if (
      !window.confirm(
        `比較用トナー ${offer.code}（${offer.seller}）を削除します。元に戻せません。よろしいですか。`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request(`/toner-offers/${offer.id}`, { method: 'DELETE' });
      setNotice(`${offer.code}（${offer.seller}）を削除しました`);
      reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const canSave = (draft: Form) => draft.code.trim() !== '' && draft.seller.trim() !== '';

  const cellOf = (offer: Offer, key: SortKey) => {
    const muted = <span className="dt-muted">—</span>;
    switch (key) {
      case 'code':
        return (
          <>
            <span className="dt-mono">{offer.code}</span>
            {offer.masterId && (
              <span
                className="to-flag to-flag-master"
                title={`トナー登録にある品番（${offer.masterId}）です。今使っているトナーを、この店で買ったときの値段として比べられます`}
              >
                使用中の品番
              </span>
            )}
            {offer.name && <span className="to-sub">{offer.name}</span>}
          </>
        );
      case 'kind':
        return (
          <span className={`to-kind to-kind-${offer.kind.toLowerCase()}`}>
            {KIND_LABELS[offer.kind]}
          </span>
        );
      case 'part':
        return offer.part === 'TONER' ? (
          PART_LABELS[offer.part]
        ) : (
          <span className="to-part">{PART_LABELS[offer.part]}</span>
        );
      case 'color':
        return offer.color ?? muted;
      case 'seller':
        return offer.seller;
      case 'purchaseType':
        return PURCHASE_LABELS[offer.purchaseType];
      case 'price':
        return offer.price === null ? (
          muted
        ) : (
          <>
            {yen(offer.price)}
            {offer.packQuantity > 1 && (
              <span className="to-sub">{offer.packQuantity} 本入り</span>
            )}
          </>
        );
      case 'unitPrice':
        return yen(offer.unitPrice) ?? muted;
      case 'yieldPages':
        return offer.yieldPages === null ? muted : `${num.format(offer.yieldPages)} 枚`;
      case 'costPerPage':
        return offer.costPerPage === null ? (
          <span
            className="dt-muted"
            title="価格と印刷可能枚数の両方か、1 枚あたりの料金が入っているものだけ出します"
          >
            —
          </span>
        ) : (
          <>
            <strong>{perPage(offer.costPerPage)}</strong>
            {offer.shippingPerPage ? (
              <span className="to-sub" title={`送料は ${offer.orderUnits} 本ずつ頼むとして割っています`}>
                送料 {offer.shippingPerPage.toFixed(2)} 込み
              </span>
            ) : (
              offer.pagePrice !== null && <span className="to-sub">カウンター料金</span>
            )}
            {offer.shippingPerPage === null && (
              <span className="to-sub" title="印刷可能枚数が無いので、送料を 1 枚あたりに割れません">
                送料は含めず
              </span>
            )}
            {offer.monthlyFee !== null && offer.monthlyFee > 0 && (
              <span
                className="to-sub"
                title="月額はトナー価格比較でプリンターを選んだとき、その台の月の印刷枚数で割って足します"
              >
                ＋月 {yen(offer.monthlyFee)}
              </span>
            )}
          </>
        );
      case 'models': {
        const missing = offer.models.filter((model) => model.assetCount === 0);
        return offer.models.length === 0 ? (
          <span className="dt-muted" title="機種を付けないと、トナー価格比較でプリンターを選んだときに出ません">
            未設定
          </span>
        ) : (
          <span
            title={offer.models
              .map((model) => `${model.label}${model.assetCount === 0 ? '（台帳に無し）' : ''}`)
              .join('\n')}
          >
            {modelsText(offer.models.map((model) => model.label))}
            {missing.length > 0 && <span className="to-flag">台帳に無し {missing.length}</span>}
          </span>
        );
      }
      case 'quotedOn':
        return offer.quotedOn ? <span className="dt-mono">{offer.quotedOn}</span> : muted;
      case 'validUntil':
        return offer.validUntil ? (
          <>
            <span className="dt-mono">{offer.validUntil}</span>
            {isExpired(offer, today) && <span className="to-flag to-flag-expired">期限切れ</span>}
          </>
        ) : (
          muted
        );
    }
  };

  const fieldProps = { ledgerModels, sellers, brands, colors };

  return (
    <div className="dt to">
      <header className="dt-head">
        <h1>比較用トナー登録</h1>
        <p>
          トナーを選び直すための材料として、<strong>販売店・購入形態ごとの値段と条件</strong>を登録します。
          ここに入れたトナーは<strong>トナー価格比較にだけ出ます。</strong>受付・注文・在庫・棚卸・請求書・
          運用コストには出ません（実際に使っているトナーは「トナー登録」で登録してください）。
          使える機種を付けておくと、トナー価格比較でプリンターを選んだとき、今使っているトナーと並べて比べられます。
        </p>
      </header>

      <section className="to-form">
        <h2>新しい比較用トナー</h2>
        <OfferFields
          form={form}
          onChange={setForm}
          autoPart={!partTouched}
          onPartTouched={() => setPartTouched(true)}
          {...fieldProps}
        />
        <div className="to-actions">
          <button
            type="button"
            onClick={() => void create()}
            disabled={busy || !canSave(form)}
            title={canSave(form) ? undefined : '品番と販売店・購入先を入れてください'}
          >
            登録
          </button>
          <button
            type="button"
            className="to-sub-button"
            onClick={() => {
              setForm(emptyForm());
              setPartTouched(false);
            }}
            disabled={busy}
          >
            入力を消す
          </button>
        </div>
        {error && <p className="dt-msg dt-msg-error to-msg">{error}</p>}
        {notice && <p className="dt-msg dt-msg-ok to-msg">{notice}</p>}
      </section>

      <section className="dt-section">
        <h2>
          登録した比較用トナー（{offers.length} 件）
          <CsvButton
            name="比較用トナー登録"
            header={CSV_COLUMNS.map((col) => col.label)}
            rows={() => shown.map((offer) => CSV_COLUMNS.map((col) => col.value(offer)))}
            count={shown.length}
          />
        </h2>
        <p className="dt-hint">
          1 枚あたりは「価格 ÷ 入数 ÷ 印刷可能枚数」（カウンター料金を入れたものはその料金）に送料を足したものです。
          月額の基本料金は台の枚数が要るので、トナー価格比較でプリンターを選んだときに足します。
          「使用中の品番」はトナー登録にも同じ品番があるもの（今使っているトナーを、この店で買ったときの値段）です。
          「複製」で中身を写して、別の店や別の色を続けて登録できます。
        </p>

        <div className="sbx-row">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="品番・商品名・販売店・機種・色・見積番号"
            count={shown.length}
            total={offers.length}
          />
        </div>

        {data === null ? (
          <p className="dt-empty">{error ? '読み込めませんでした。' : '読み込んでいます…'}</p>
        ) : offers.length === 0 ? (
          <p className="dt-empty">まだ登録がありません。上の欄を入力して登録してください。</p>
        ) : shown.length === 0 ? (
          <p className="dt-empty">探す欄に当てはまる比較用トナーがありません。</p>
        ) : (
          <TableBox className="dt-wrap" memoryKey="tonerOffer.list">
            <table className="dt-table to-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'dt-num' : undefined}
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
                        <span className="dt-arrow" aria-hidden>
                          {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="dt-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((offer) => (
                  <tr
                    key={offer.id}
                    className={[
                      offer.id === editing?.id && editing.mode === 'edit' ? 'to-row-on' : '',
                      isExpired(offer, today) ? 'to-row-expired' : '',
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined}
                  >
                    {COLUMNS.map((col) => (
                      <td key={col.key} className={col.numeric ? 'dt-num' : undefined}>
                        {cellOf(offer, col.key)}
                      </td>
                    ))}
                    <td className="dt-ops to-ops">
                      <button type="button" onClick={() => edit(offer)} disabled={busy}>
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(offer)}
                        disabled={busy}
                        title="中身を写して新しく登録します（別の店・別の色を続けて入れるとき）"
                      >
                        複製
                      </button>
                      <button
                        type="button"
                        className="to-del"
                        onClick={() => void remove(offer)}
                        disabled={busy}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableBox>
        )}
      </section>

      {editing && (
        <Modal
          title={editing.title}
          onClose={() => setEditing(null)}
          busy={busy}
          error={editError}
          width={980}
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
                onClick={() => void save()}
                disabled={busy || !canSave(editing.form)}
              >
                {busy ? '保存中…' : editing.mode === 'edit' ? '更新' : '登録'}
              </button>
            </>
          }
        >
          {editing.mode === 'copy' && (
            <p className="to-hint to-copy-hint">
              写した中身を直してから「登録」を押してください。元の比較用トナーはそのまま残ります。
            </p>
          )}
          <OfferFields
            form={editing.form}
            onChange={setDraft}
            autoPart={false}
            {...fieldProps}
          />
        </Modal>
      )}
    </div>
  );
}
