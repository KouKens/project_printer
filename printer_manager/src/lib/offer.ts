/**
 * 比較用トナー（`/toner-offers`）と、トナー価格比較が共通で使うもの。
 *
 * **比較用トナーはトナー価格比較の画面だけが読む。** 受付・注文・在庫などは
 * トナー登録（`/toners`）だけを使う。ここに置くのは、登録の画面と比較の画面で
 * 同じ書き方をしたい言葉と計算だけ
 */
import { num } from './format';

export type OfferKind = 'GENUINE' | 'RECYCLED' | 'COMPATIBLE';
export type PurchaseType = 'SPOT' | 'ONLINE' | 'CONTRACT' | 'SUBSCRIPTION' | 'OTHER';

export const KIND_LABELS: Record<OfferKind, string> = {
  GENUINE: '純正',
  RECYCLED: 'リサイクル',
  COMPATIBLE: '互換',
};

/** 選択肢の並び。登録の画面の選択欄と比較の画面の絞り込みで同じ順にする */
export const KIND_ORDER: OfferKind[] = ['GENUINE', 'RECYCLED', 'COMPATIBLE'];

export const PURCHASE_LABELS: Record<PurchaseType, string> = {
  SPOT: '都度注文',
  ONLINE: 'ネット通販',
  CONTRACT: '保守・キット契約',
  SUBSCRIPTION: '定額・定期配送',
  OTHER: 'その他',
};

export const PURCHASE_ORDER: PurchaseType[] = [
  'SPOT',
  'ONLINE',
  'CONTRACT',
  'SUBSCRIPTION',
  'OTHER',
];

/** 使える機種 1 つ。`assetCount` が 0 なら有効な台帳にその機種が無い */
export type OfferModel = {
  maker: string | null;
  model: string;
  key: string;
  label: string;
  assetCount: number;
};

/** 有効な台帳の機種。登録の画面がチェックを並べる */
export type LedgerModel = {
  key: string;
  maker: string | null;
  model: string;
  label: string;
  assetCount: number;
};

export type Offer = {
  id: number;
  code: string;
  name: string | null;
  brand: string | null;
  kind: OfferKind;
  part: SupplyPart;
  color: string | null;
  yieldPages: number | null;
  packQuantity: number;
  seller: string;
  purchaseType: PurchaseType;
  price: number | null;
  pagePrice: number | null;
  monthlyFee: number | null;
  shippingFee: number | null;
  minOrder: number | null;
  leadTime: string | null;
  warranty: string | null;
  takesBack: boolean | null;
  payment: string | null;
  quotedOn: string | null;
  validUntil: string | null;
  reference: string | null;
  url: string | null;
  contact: string | null;
  note: string | null;
  /** 1 本あたり（価格 ÷ 入数） */
  unitPrice: number | null;
  /** 本体の 1 枚あたり。カウンター料金があればそれ、無ければ 1 本あたり ÷ 印刷可能枚数 */
  basePerPage: number | null;
  /** 送料を割る 1 回の注文の本数（最小注文数、無ければ入数） */
  orderUnits: number;
  /** 送料の 1 枚あたり。送料が無ければ 0、印刷可能枚数が無くて割れなければ null */
  shippingPerPage: number | null;
  /** 1 枚あたり（本体 ＋ 送料）。月額はプリンターを選んだときに、その台の枚数で割って足す */
  costPerPage: number | null;
  models: OfferModel[];
  /** トナー登録に同じ品番があればその品番 */
  masterId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OfferList = {
  offers: Offer[];
  models: LedgerModel[];
  /** トナー登録の色（重なりあり）。色の入力候補に使う */
  tonerColors: string[];
};

/**
 * 1 枚あたりの内訳。**合計 = 本体 ＋ 送料 ＋ 月額。**
 *
 * - 本体: カウンター料金があればそれ、無ければ 価格 ÷ 入数 ÷ 印刷可能枚数
 * - 送料: 送料 ÷（1 回に頼む本数 × 印刷可能枚数）。1 回に頼む本数は最小注文数、無ければ 1 箱
 * - 月額: 月額の基本料金 ÷ その台の月の印刷枚数（**プリンターを選んだときだけ割れる**）
 *
 * 割れないものは null にして合計に足さず、`missing` に理由を積む
 * （0 として足すと、割れなかった分だけ安く見える）
 */
export type PerPage = {
  base: number | null;
  shipping: number | null;
  monthly: number | null;
  total: number | null;
  missing: string[];
};

/**
 * 内訳を組み立てる。API の `costPerPageOf` / `shippingPerPageOf` と同じ決め方で、
 * 画面の入力中の目安（登録の画面）と、台の枚数で月額を割る比較の画面が使う。
 *
 * @param monthlyPages 月の印刷枚数。プリンターを選んでいないときは undefined
 */
export function perPageOf(
  input: {
    price: number | null;
    packQuantity: number;
    yieldPages: number | null;
    pagePrice: number | null;
    shippingFee: number | null;
    minOrder: number | null;
    monthlyFee: number | null;
  },
  monthlyPages?: number | null,
): PerPage {
  const missing: string[] = [];
  const pack = input.packQuantity > 0 ? input.packQuantity : 1;
  const unit = input.price === null ? null : input.price / pack;
  const base =
    input.pagePrice !== null
      ? input.pagePrice
      : unit !== null && input.yieldPages
        ? unit / input.yieldPages
        : null;

  let shipping: number | null = 0;
  if (input.shippingFee) {
    const orderUnits = Math.max(input.minOrder ?? pack, pack);
    shipping = input.yieldPages ? input.shippingFee / (orderUnits * input.yieldPages) : null;
    if (shipping === null) missing.push('送料（印刷可能枚数が無く割れない）');
  }

  let monthly: number | null = 0;
  if (input.monthlyFee) {
    if (monthlyPages === undefined) {
      monthly = null;
      missing.push('月額（プリンターを選ぶと、その台の枚数で割って足します）');
    } else if (monthlyPages === null || monthlyPages <= 0) {
      monthly = null;
      missing.push('月額（この台の印刷枚数の記録が無く割れない）');
    } else {
      monthly = input.monthlyFee / monthlyPages;
    }
  }

  const total = base === null ? null : base + (shipping ?? 0) + (monthly ?? 0);
  return { base, shipping, monthly, total, missing };
}

/** 内訳の 1 行（「本体 0.35 ＋ 送料 0.01 ＋ 月額 0.12」）。足していないものは書かない */
export function perPageBreakdown(cost: PerPage): string | null {
  if (cost.base === null) return null;
  const parts = [`本体 ${cost.base.toFixed(2)}`];
  if (cost.shipping) parts.push(`送料 ${cost.shipping.toFixed(2)}`);
  if (cost.monthly) parts.push(`月額 ${cost.monthly.toFixed(2)}`);
  return parts.length > 1 ? parts.join(' ＋ ') : null;
}

/** 見積の有効期限を過ぎたか。期限の日いっぱいまでは有効 */
export const isExpired = (offer: { validUntil: string | null }, today: string) =>
  offer.validUntil !== null && offer.validUntil < today;

export const takesBackLabel = (value: boolean | null) =>
  value === null ? '未確認' : value ? 'あり' : 'なし';

/** 色の並び。一覧に出てくる表記の順。ここに無い色は後ろに名前順で並ぶ */
export const COLOR_ORDER = [
  'ブラック',
  'シアン',
  'マゼンタ',
  'イエロー',
  'ライトシアン',
  'ライトマゼンタ',
  'カラー',
  '4色パック',
  '6色パック',
];

export function colorRank(color: string): number {
  const index = COLOR_ORDER.indexOf(color);
  return index === -1 ? COLOR_ORDER.length : index;
}

/**
 * 消耗品の種類（トナー登録・比較用トナーの `part`。API の enum SupplyPart と同じ値）。
 *
 * **比べる相手を揃えるために持つ。** ドラムにも色が付いている（「ドラムカートリッジ CT351149」が
 * ブラック）ので、色だけでまとめると黒のドラムが黒のトナーと同じ並びに入り、
 * 1 枚あたりの安いドラムが「使用中のトナー」の基準になってしまう
 */
export type SupplyPart = 'TONER' | 'DRUM' | 'WASTE' | 'MAINTENANCE' | 'OTHER';

export const PART_LABELS: Record<SupplyPart, string> = {
  TONER: 'トナー・インク',
  DRUM: 'ドラム',
  WASTE: '廃トナーボトル',
  MAINTENANCE: 'メンテナンスボックス',
  OTHER: 'その他の部品',
};

/** 選択欄に添える説明。どれに入れるか迷うものを書いておく */
export const PART_HINTS: Record<SupplyPart, string> = {
  TONER: 'トナーカートリッジ・インクカートリッジ',
  DRUM: 'ドラムユニット・ドラムカートリッジ',
  WASTE: '廃トナーボトル・回収トナー容器',
  MAINTENANCE: 'インクジェットのメンテナンスボックス',
  OTHER: 'ベルト・定着ユニット・メンテナンスキットなど',
};

/** 並び。トナー・インクを先に、部品を後ろに */
export const PART_ORDER: SupplyPart[] = ['TONER', 'DRUM', 'WASTE', 'MAINTENANCE', 'OTHER'];

/**
 * 品番と商品名から種類を推し量る。**新しく登録するときの初期値にだけ使う**
 * （保存した値があればそちらが正しい。比較の画面はこれを呼ばない）。
 *
 * 商品名は「ドラムユニット …」「廃トナーボトル …」のように種類から書いてあるので、
 * その言葉で見分ける。**「メンテナンス」だけでは決めない** ——
 * 「インクカートリッジ ITH-BK（滅菌機メンテナンス用）」がインクなのに外れるため。
 * メンテナンスキット（MK-3381 など。ドラム・現像の交換部品の組）は「その他」。
 *
 * **既存の品番に初期値を入れた migration（20261003052231_supply_part）と同じ言葉・同じ順。**
 */
export function guessPart(code: string, name: string | null): SupplyPart {
  const text = `${code} ${name ?? ''}`;
  if (/ドラム|drum/i.test(text)) return 'DRUM';
  if (/廃トナー|回収ボトル|回収トナー|回収容器|waste/i.test(text)) return 'WASTE';
  if (/メンテナンスボックス|maintenance ?box/i.test(text)) return 'MAINTENANCE';
  if (/ベルト|定着|ローラー|メンテナンスキット|fuser|maintenance ?kit/i.test(text)) return 'OTHER';
  return 'TONER';
}

/** 基準との差。ratio は基準に対する割合（-0.2 なら 2 割安い） */
export type Diff = { value: number; ratio: number };

export function diffOf(value: number | null, base: number | null): Diff | null {
  if (value === null || base === null || base === 0) return null;
  return { value: value - base, ratio: (value - base) / base };
}

/** 円の差を「1,200 円安い（17%）」の形に。色ではなく言葉で向きを示す */
export function diffText(diff: Diff, digits = 0): string {
  const amount =
    digits === 0
      ? num.format(Math.abs(Math.round(diff.value)))
      : Math.abs(diff.value).toFixed(digits);
  const percent = Math.round(Math.abs(diff.ratio) * 100);
  if (diff.value === 0) return '同じ';
  return `${amount} 円${diff.value < 0 ? '安い' : '高い'}（${percent}%）`;
}
