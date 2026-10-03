import { useCallback, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { CsvValue } from '../lib/csv';
import { foldKey } from '../lib/fold';
import { num } from '../lib/format';
import {
  colorRank,
  diffOf,
  diffText,
  isExpired,
  KIND_LABELS,
  KIND_ORDER,
  PART_LABELS,
  PART_ORDER,
  perPageBreakdown,
  perPageOf,
  PURCHASE_LABELS,
  takesBackLabel,
} from '../lib/offer';
import type {
  Diff,
  Offer,
  OfferKind,
  PerPage,
  PurchaseType,
  SupplyPart,
} from '../lib/offer';
import { hits, searchWords } from '../lib/search';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';

/**
 * トナー価格比較の上半分。**トナー登録（今使っているトナー）とトナー情報（比較用）を
 * 1 つの表に並べる。**
 *
 * - プリンターを選ばなければ全部を 1 つの表で（並べ替え・絞り込みはこの場で）
 * - プリンターを選ぶと、その台が使えるものだけを**色ごとに 1 枚あたりの安い順**に並べ、
 *   その台が今使っているトナー（トナー登録で紐づけたもの）との差を出す
 *
 * 「使える」の決め方: トナー登録は台帳の台への紐づけ（その台の機種も使える機種に数える）、
 * トナー情報は機種への紐づけ。機種はどちらも `modelKey` で畳んだ鍵で突き合わせる
 */

/** 価格比較の API が返す台帳の 1 台 */
export type CompareAsset = {
  id: number;
  no: string | null;
  department: string | null;
  maker: string | null;
  model: string | null;
  companyName: string | null;
  modelKey: string;
  /** 月の印刷枚数（直近の記録の平均）。実機と結び付かない・記録が少ない台は null */
  monthlyPages: number | null;
};

/** トナー登録の品番。価格比較の API の toners の必要なところだけ */
export type MasterToner = {
  id: string;
  name: string | null;
  color: string | null;
  part: SupplyPart;
  recycled: boolean;
  hidden: boolean;
  disabledAt: string | null;
  yieldPages: number | null;
  price: number | null;
  priceFrom: string | null;
  costPerPage: number | null;
  printers: { id: number }[];
  modelKeys: string[];
};

export type CompareModel = { key: string; label: string; assetCount: number };

/** 1 行。トナー登録の品番とトナー情報を同じ形にそろえる */
type Row = {
  key: string;
  source: 'master' | 'offer';
  code: string;
  name: string | null;
  kind: OfferKind;
  color: string | null;
  /** 種類（トナー・ドラム…）。トナー登録・トナー情報で選んだ値。比べる相手を揃えるのに使う */
  part: SupplyPart;
  seller: string | null;
  purchaseType: PurchaseType | null;
  price: number | null;
  packQuantity: number;
  unitPrice: number | null;
  yieldPages: number | null;
  /** 1 枚あたりの内訳（本体・送料・月額）。月額はプリンターを選んだときだけ割れる */
  cost: PerPage;
  /** 1 枚あたりの合計（`cost.total`）。並べる・比べるのはこれ */
  costPerPage: number | null;
  /** 1 枚あたりがカウンター料金か */
  byCounter: boolean;
  monthlyFee: number | null;
  shippingFee: number | null;
  leadTime: string | null;
  takesBack: boolean | null;
  warranty: string | null;
  /** 価格の日付。トナー登録は今の価格の適用開始日、トナー情報は確かめた日 */
  priceDate: string | null;
  validUntil: string | null;
  url: string | null;
  note: string | null;
  modelKeys: string[];
  /** トナー登録の品番だけ。紐づけている有効な台 */
  assetIds: number[];
  /** トナー情報で、トナー登録にも同じ品番があるもの */
  masterId: string | null;
  hidden: boolean;
  expired: boolean;
};

/** 選んだプリンター。台を選んだか、機種ごと選んだか */
type Target =
  | { kind: 'asset'; asset: CompareAsset; modelKey: string; label: string }
  | { kind: 'model'; modelKey: string; label: string };

/** 選んだ台で見たときの 1 行の立場 */
type Standing = 'inUse' | 'sameModel' | 'master' | 'offer';

const STANDING_LABELS: Record<Standing, string> = {
  inUse: '使用中',
  sameModel: '同じ機種の別の台で使用中',
  master: 'トナー登録',
  offer: '比較用',
};

const NO_COLOR = '\u0000none';

const yen = (value: number | null) =>
  value === null ? null : `${num.format(Math.round(value))} 円`;
/** CSV の 1 枚あたり。小数 3 桁まで。割れなかったものは空欄 */
const csvPerPage = (value: number | null) => (value === null ? null : Number(value.toFixed(3)));
const perPage = (value: number | null) => (value === null ? null : `${value.toFixed(2)} 円`);

const assetLabel = (asset: CompareAsset) =>
  [
    asset.companyName,
    asset.department ?? '（部署なし）',
    asset.no ? `No.${asset.no}` : null,
  ]
    .filter(Boolean)
    .join(' ');

const modelName = (model: CompareModel | undefined) =>
  model === undefined ? '' : model.label || '（型番未入力）';

/**
 * 行を作る。
 *
 * @param monthlyPages 選んだ台の月の印刷枚数。月額の基本料金をこれで割って 1 枚あたりに足す。
 *   プリンターを選んでいないときは undefined（月額は割れないので足さない）
 */
function rowsOf(
  toners: MasterToner[],
  offers: Offer[],
  today: string,
  monthlyPages: number | null | undefined,
): Row[] {
  const masters = toners
    // 無効にした品番は今使っていないので比べない（下の価格の推移では「無効も出す」で見られる）
    .filter((toner) => toner.disabledAt === null)
    .map<Row>((toner) => ({
      key: `toner:${toner.id}`,
      source: 'master',
      code: toner.id,
      name: toner.name,
      kind: toner.recycled ? 'RECYCLED' : 'GENUINE',
      color: toner.color,
      part: toner.part,
      seller: null,
      purchaseType: null,
      price: toner.price,
      packQuantity: 1,
      unitPrice: toner.price,
      yieldPages: toner.yieldPages,
      // トナー登録は送料・月額を持たないので、本体だけ
      cost: {
        base: toner.costPerPage,
        shipping: 0,
        monthly: 0,
        total: toner.costPerPage,
        missing: [],
      },
      costPerPage: toner.costPerPage,
      byCounter: false,
      monthlyFee: null,
      shippingFee: null,
      leadTime: null,
      takesBack: null,
      warranty: null,
      priceDate: toner.priceFrom,
      validUntil: null,
      url: null,
      note: null,
      modelKeys: toner.modelKeys,
      assetIds: toner.printers.map((printer) => printer.id),
      masterId: toner.id,
      hidden: toner.hidden,
      expired: false,
    }));

  const fromOffers = offers.map<Row>((offer) => {
    const cost = perPageOf(offer, monthlyPages);
    return {
    key: `offer:${offer.id}`,
    source: 'offer',
    code: offer.code,
    name: offer.name,
    kind: offer.kind,
    color: offer.color,
    part: offer.part,
    seller: offer.seller,
    purchaseType: offer.purchaseType,
    price: offer.price,
    packQuantity: offer.packQuantity,
    unitPrice: offer.unitPrice,
    yieldPages: offer.yieldPages,
    cost,
    costPerPage: cost.total,
    byCounter: offer.pagePrice !== null,
    monthlyFee: offer.monthlyFee,
    shippingFee: offer.shippingFee,
    leadTime: offer.leadTime,
    takesBack: offer.takesBack,
    warranty: offer.warranty,
    priceDate: offer.quotedOn,
    validUntil: offer.validUntil,
    url: offer.url,
    note: offer.note,
    modelKeys: offer.models.map((model) => model.key),
    assetIds: [],
    masterId: offer.masterId,
    hidden: false,
    expired: isExpired(offer, today),
    };
  });

  return [...masters, ...fromOffers];
}

/** 色の並び順。色の無い消耗品（ドラム・回収容器）は最後 */
const colorOrder = (color: string | null) =>
  color === null ? Number.MAX_SAFE_INTEGER : colorRank(color);

/** 色の列を並べ替えるときの鍵。決まった順の色が先、それ以外は名前順 */
const colorSortKey = (color: string | null) =>
  color === null ? null : `${String(colorRank(color)).padStart(2, '0')} ${color}`;

type ColorGroup = {
  /** 種類 × 色の鍵（色は foldKey で畳む）。絞り込んだまとまりと絞る前のまとまりを結ぶ */
  key: string;
  label: string;
  part: SupplyPart;
  color: string | null;
  rows: Row[];
  base: Row | null;
};

/** まとまりの見出し。トナーは色だけ、部品は種類に色を添える */
const groupLabel = (part: SupplyPart, color: string | null) =>
  part === 'TONER'
    ? (color ?? '色なし')
    : color
      ? `${PART_LABELS[part]}（${color}）`
      : PART_LABELS[part];

/**
 * **種類 × 色**ごとにまとめ、1 枚あたりの安い順に並べる。
 * 種類（トナー・ドラム・廃トナーボトル…）でも分けるのは、黒のドラムを黒のトナーと
 * 比べないため（種類はトナー登録・トナー情報の登録で選んだ値）。
 *
 * 比べる基準は**使用中のうち 1 枚あたりがいちばん安いもの。** 純正とリサイクル品の
 * 両方を紐づけている台では、安いほうと比べて「これだけ下がる」を控えめに出す
 */
function groupByColor(rows: Row[], inUse: (row: Row) => boolean): ColorGroup[] {
  const byColor = new Map<
    string,
    { key: string; label: string; part: SupplyPart; color: string | null; rows: Row[] }
  >();
  for (const row of rows) {
    const key = `${row.part}\0${row.color === null ? '' : foldKey(row.color)}`;
    const group = byColor.get(key) ?? {
      key,
      label: groupLabel(row.part, row.color),
      part: row.part,
      color: row.color,
      rows: [],
    };
    group.rows.push(row);
    byColor.set(key, group);
  }

  return [...byColor.values()]
    .sort(
      (a, b) =>
        PART_ORDER.indexOf(a.part) - PART_ORDER.indexOf(b.part) ||
        colorOrder(a.color) - colorOrder(b.color) ||
        a.label.localeCompare(b.label, 'ja'),
    )
    .map((group) => {
      const sorted = [...group.rows].sort(
        (a, b) =>
          (a.costPerPage ?? Number.POSITIVE_INFINITY) -
            (b.costPerPage ?? Number.POSITIVE_INFINITY) ||
          Number(inUse(b)) - Number(inUse(a)) ||
          a.code.localeCompare(b.code, 'ja', { numeric: true }),
      );
      const base =
        sorted
          .filter((row) => inUse(row) && row.costPerPage !== null)
          .sort((a, b) => a.costPerPage! - b.costPerPage!)[0] ?? null;
      return { ...group, rows: sorted, base };
    });
}

type SortKey =
  | 'source'
  | 'code'
  | 'kind'
  | 'part'
  | 'color'
  | 'models'
  | 'seller'
  | 'purchaseType'
  | 'unitPrice'
  | 'yieldPages'
  | 'costPerPage'
  | 'monthlyFee'
  | 'priceDate'
  | 'validUntil';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'source', label: '出どころ', kind: 'number' },
  { key: 'code', label: '品番', kind: 'text' },
  { key: 'kind', label: '区分', kind: 'number' },
  { key: 'part', label: '種類', kind: 'number' },
  { key: 'color', label: '色', kind: 'text' },
  { key: 'models', label: '使える機種', kind: 'text' },
  { key: 'seller', label: '販売店・購入先', kind: 'text' },
  { key: 'purchaseType', label: '購入形態', kind: 'text' },
  { key: 'unitPrice', label: '1 本あたり', kind: 'number', numeric: true },
  { key: 'yieldPages', label: '印刷可能枚数', kind: 'number', numeric: true },
  { key: 'costPerPage', label: '1 枚あたり', kind: 'number', numeric: true },
  { key: 'monthlyFee', label: '月額', kind: 'number', numeric: true },
  { key: 'priceDate', label: '価格の日付', kind: 'date' },
  { key: 'validUntil', label: '有効期限', kind: 'date' },
];

export default function OfferCompare({
  models,
  assets,
  toners,
  offers,
  offersError,
  today,
  volumeDays,
  target: targetValue,
  onTarget,
}: {
  models: CompareModel[];
  assets: CompareAsset[];
  toners: MasterToner[];
  /** トナー情報。まだ届いていなければ null */
  offers: Offer[] | null;
  offersError: string | null;
  today: string;
  /** 月の印刷枚数を出すのに API が見た日数（断り書きに出す） */
  volumeDays: number;
  /** 選んでいるプリンター。'' / `asset:<id>` / `model:<key>` */
  target: string;
  onTarget: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState('');
  const [kind, setKind] = useState<'' | OfferKind>('');
  const [part, setPart] = useState<'' | SupplyPart>('');
  const [source, setSource] = useState<'' | 'master' | 'offer'>('');
  const [hideExpired, setHideExpired] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'code', dir: 'asc' });

  const modelMap = useMemo(() => new Map(models.map((model) => [model.key, model])), [models]);

  /** 選択肢。機種でまとめ、機種ごと選ぶか 1 台を選ぶ */
  const groups = useMemo(() => {
    const byModel = new Map<string, CompareAsset[]>();
    for (const asset of assets) {
      const list = byModel.get(asset.modelKey) ?? [];
      list.push(asset);
      byModel.set(asset.modelKey, list);
    }
    return [...byModel.entries()]
      .map(([key, list]) => ({
        key,
        label: modelName(modelMap.get(key)),
        assets: [...list].sort((a, b) =>
          assetLabel(a).localeCompare(assetLabel(b), 'ja', { numeric: true }),
        ),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja', { numeric: true }));
  }, [assets, modelMap]);

  const target = useMemo<Target | null>(() => {
    if (targetValue.startsWith('asset:')) {
      const id = Number(targetValue.slice('asset:'.length));
      const asset = assets.find((item) => item.id === id);
      if (!asset) return null;
      const model = modelName(modelMap.get(asset.modelKey));
      return { kind: 'asset', asset, modelKey: asset.modelKey, label: `${assetLabel(asset)}（${model}）` };
    }
    if (targetValue.startsWith('model:')) {
      const key = targetValue.slice('model:'.length);
      const model = modelMap.get(key);
      if (!model) return null;
      return { kind: 'model', modelKey: key, label: `${modelName(model)} の全 ${model.assetCount} 台` };
    }
    return null;
  }, [targetValue, assets, modelMap]);

  /**
   * 月額を割る月の印刷枚数。台を選んだらその台の、機種ごと選んだら**その機種の台の平均**
   * （月額の基本料金は 1 台ごとにかかるので、合計ではなく 1 台あたりで割る）。
   * プリンターを選んでいなければ undefined（月額は足さない）。記録のある台が無ければ null
   */
  const volume = useMemo<{ pages: number | null; counted: number } | undefined>(() => {
    if (target === null) return undefined;
    if (target.kind === 'asset') {
      return { pages: target.asset.monthlyPages, counted: target.asset.monthlyPages === null ? 0 : 1 };
    }
    const known = assets
      .filter((asset) => asset.modelKey === target.modelKey)
      .map((asset) => asset.monthlyPages)
      .filter((pages): pages is number => pages !== null);
    return {
      pages: known.length === 0 ? null : known.reduce((sum, p) => sum + p, 0) / known.length,
      counted: known.length,
    };
  }, [target, assets]);

  const rows = useMemo(
    () => rowsOf(toners, offers ?? [], today, volume === undefined ? undefined : volume.pages),
    [toners, offers, today, volume],
  );

  /** 選んだ台で見たときの立場。トナー登録は台への紐づけ、機種ごと選んだときは機種で見る */
  const standingOf = useCallback(
    (row: Row): Standing => {
      if (row.source === 'offer') return 'offer';
      if (target === null) return 'master';
      if (target.kind === 'asset') {
        if (row.assetIds.includes(target.asset.id)) return 'inUse';
        return row.modelKeys.includes(target.modelKey) ? 'sameModel' : 'master';
      }
      return row.modelKeys.includes(target.modelKey) ? 'inUse' : 'master';
    },
    [target],
  );
  const inUse = useCallback((row: Row) => standingOf(row) === 'inUse', [standingOf]);

  /** 選んだ台で使えるか。トナー登録は台の紐づけ、トナー情報は機種で見る */
  const fitting = useMemo(
    () =>
      target === null
        ? rows
        : rows.filter(
            (row) =>
              row.modelKeys.includes(target.modelKey) ||
              (target.kind === 'asset' && row.assetIds.includes(target.asset.id)),
          ),
    [rows, target],
  );

  const colorChoices = useMemo(
    () =>
      [...new Set(rows.map((row) => row.color).filter((c): c is string => c !== null))].sort(
        (a, b) => colorRank(a) - colorRank(b) || a.localeCompare(b, 'ja'),
      ),
    [rows],
  );

  const modelsOf = useCallback(
    (row: Row) =>
      row.modelKeys
        .map((key) => modelMap.get(key))
        .filter((model): model is CompareModel => model !== undefined)
        .map((model) => modelName(model))
        .sort((a, b) => a.localeCompare(b, 'ja')),
    [modelMap],
  );

  const modelsText = useCallback(
    (row: Row) => {
      const names = modelsOf(row);
      return names.length > 2
        ? `${names.slice(0, 2).join('、')} ほか ${names.length - 2}`
        : names.join('、');
    },
    [modelsOf],
  );

  const filtered = useMemo(() => {
    const words = searchWords(query);
    return fitting.filter((row) => {
      if (color === NO_COLOR ? row.color !== null : color !== '' && row.color !== color)
        return false;
      if (kind !== '' && row.kind !== kind) return false;
      if (part !== '' && row.part !== part) return false;
      if (source !== '' && row.source !== source) return false;
      if (hideExpired && row.expired) return false;
      return hits(
        [
          row.code,
          row.name,
          row.color,
          KIND_LABELS[row.kind],
          PART_LABELS[row.part],
          row.seller,
          row.purchaseType ? PURCHASE_LABELS[row.purchaseType] : null,
          row.source === 'master' ? 'トナー登録' : 'トナー情報',
          row.note,
          ...modelsOf(row),
        ],
        words,
      );
    });
  }, [fitting, query, color, kind, part, source, hideExpired, modelsOf]);

  // ── プリンターを選んだとき: 色ごとに 1 枚あたりの安い順 ──
  /**
   * 絞り込む前のまとまり。**比べる基準（使用中）はここから決める。**
   * 絞った表から決めると、「出どころ: トナー情報」や「区分: リサイクル」で使用中の行が
   * 隠れたとたんに基準が無くなり、比べたい候補だけを出したときに差が全部消える
   */
  const fullGroups = useMemo(
    () => (target === null ? [] : groupByColor(fitting, inUse)),
    [target, fitting, inUse],
  );

  /** 表に出すまとまり。行は絞り込んだもの、基準は絞る前のもの */
  const colorGroups = useMemo(() => {
    if (target === null) return [];
    const bases = new Map(fullGroups.map((group) => [group.key, group.base]));
    return groupByColor(filtered, inUse).map((group) => ({
      ...group,
      base: bases.get(group.key) ?? null,
    }));
  }, [target, filtered, inUse, fullGroups]);

  const diffFor = (row: Row, base: Row | null): Diff | null =>
    base === null || row.key === base.key ? null : diffOf(row.costPerPage, base.costPerPage);

  /** 上の一文。**絞り込みに関係なく**、その台に使えるもの全部から数える */
  const printerSummary = useMemo(() => {
    if (target === null) return null;
    const cheaper = fullGroups.reduce(
      (count, group) =>
        count +
        group.rows.filter(
          (row) =>
            !inUse(row) &&
            group.base !== null &&
            row.costPerPage !== null &&
            row.costPerPage < group.base.costPerPage!,
        ).length,
      0,
    );
    const using = fitting.filter(inUse).length;
    return { inUse: using, options: fitting.length - using, cheaper };
  }, [target, fitting, inUse, fullGroups]);

  // ── プリンターを選んでいないとき: 全部を 1 つの表で ──
  const sorted = useMemo(() => {
    if (target !== null) return [];
    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      filtered,
      (row) => {
        switch (sort.key) {
          case 'source':
            return row.source === 'master' ? 0 : 1;
          case 'kind':
            return KIND_ORDER.indexOf(row.kind);
          case 'part':
            return PART_ORDER.indexOf(row.part);
          case 'color':
            return colorSortKey(row.color);
          case 'models':
            return modelsText(row) || null;
          case 'purchaseType':
            return row.purchaseType ? PURCHASE_LABELS[row.purchaseType] : null;
          default:
            return row[sort.key];
        }
      },
      column?.kind ?? 'text',
      sort.dir,
      (row) => rows.indexOf(row),
    );
  }, [target, filtered, sort, modelsText, rows]);

  const filteredOn =
    query.trim() !== '' ||
    color !== '' ||
    kind !== '' ||
    part !== '' ||
    source !== '' ||
    hideExpired;

  const sourceCell = (row: Row) =>
    row.source === 'master' ? (
      <span className="pcx-source pcx-source-master" title="トナー登録の品番（実際に使っているトナー）">
        トナー登録
        {row.hidden && <span className="pc-flag">非表示</span>}
      </span>
    ) : (
      <span className="pcx-source" title="トナー情報登録で入れた比較用の情報">
        トナー情報
      </span>
    );

  const kindCell = (row: Row) => (
    <span className={`pc-kind${row.kind === 'GENUINE' ? '' : ' pc-kind-recycled'}`}>
      {KIND_LABELS[row.kind]}
    </span>
  );

  const muted = <span className="dt-muted">—</span>;

  const sellerCell = (row: Row) =>
    row.source === 'master' ? (
      <span className="dt-muted" title="トナー登録には購入先を持たせていません">
        （トナー登録の価格）
      </span>
    ) : (
      <>
        {row.seller}
        {row.url && (
          <a className="pcx-link" href={row.url} target="_blank" rel="noopener noreferrer">
            商品ページ
          </a>
        )}
      </>
    );

  /** 1 枚あたり。合計を太く、内訳と「入れられなかったもの」を下に添える */
  const costCell = (row: Row) => {
    if (row.costPerPage === null) {
      return (
        <span className="dt-muted" title="価格と印刷可能枚数の両方か、カウンター料金が入っているものだけ出します">
          —
        </span>
      );
    }
    const breakdown = perPageBreakdown(row.cost);
    return (
      <>
        <strong>{perPage(row.costPerPage)}</strong>
        {breakdown ? (
          <span className="pcx-sub">{breakdown}</span>
        ) : (
          row.byCounter && <span className="pcx-sub">カウンター料金</span>
        )}
        {row.cost.missing.length > 0 && (
          <span className="pcx-sub pcx-missing" title={row.cost.missing.join('\n')}>
            {row.cost.missing.length === 1 && row.cost.missing[0].startsWith('月額')
              ? '月額は含めず'
              : row.cost.missing.length === 1
                ? '送料は含めず'
                : '送料・月額は含めず'}
          </span>
        )}
      </>
    );
  };

  const dateCell = (row: Row) =>
    row.priceDate ? (
      <span
        className="dt-mono"
        title={row.source === 'master' ? '今の価格の適用開始日' : '価格を確かめた日'}
      >
        {row.priceDate}
      </span>
    ) : (
      muted
    );

  const validCell = (row: Row) =>
    row.validUntil ? (
      <>
        <span className="dt-mono">{row.validUntil}</span>
        {row.expired && <span className="pc-soon">期限切れ</span>}
      </>
    ) : (
      muted
    );

  // ── CSV ──
  const ALL_HEADER = [
    '出どころ',
    '品番',
    '商品名',
    '区分',
    '種類',
    '色',
    '使える機種',
    '販売店・購入先',
    '購入形態',
    '価格（税別）',
    '入数',
    '1 本あたり',
    '印刷可能枚数',
    '1 枚あたり（合計）',
    '1 枚あたり（本体）',
    '1 枚あたり（送料）',
    '1 枚あたり（月額）',
    '1 枚あたりに入れていないもの',
    'カウンター料金',
    '月額',
    '送料・手数料',
    '納期',
    '使用済みの回収',
    '品質保証',
    '価格の日付',
    '有効期限',
    '商品ページ',
    '備考',
  ];
  const baseCsv = (row: Row): CsvValue[] => [
    row.source === 'master' ? 'トナー登録' : 'トナー情報',
    row.code,
    row.name,
    KIND_LABELS[row.kind],
    PART_LABELS[row.part],
    row.color,
    modelsOf(row).join(' / '),
    row.seller,
    row.purchaseType ? PURCHASE_LABELS[row.purchaseType] : null,
    row.price,
    row.packQuantity,
    row.unitPrice === null ? null : Math.round(row.unitPrice),
    row.yieldPages,
    csvPerPage(row.costPerPage),
    csvPerPage(row.cost.base),
    csvPerPage(row.cost.shipping),
    csvPerPage(row.cost.monthly),
    row.cost.missing.join(' / '),
    row.byCounter ? '○' : '',
    row.monthlyFee,
    row.shippingFee,
    row.leadTime,
    row.source === 'offer' ? takesBackLabel(row.takesBack) : null,
    row.warranty,
    row.priceDate,
    row.validUntil,
    row.url,
    row.note,
  ];

  const csvHeader =
    target === null
      ? ALL_HEADER
      : ['まとまり', '状況', '使用中との差（円/枚）', '使用中との差（%）', ...ALL_HEADER];
  const csvRows = (): CsvValue[][] =>
    target === null
      ? sorted.map(baseCsv)
      : colorGroups.flatMap((group) =>
          group.rows.map((row) => {
            const diff = diffFor(row, group.base);
            return [
              group.label,
              STANDING_LABELS[standingOf(row)],
              diff ? Number(diff.value.toFixed(3)) : null,
              diff ? Math.round(diff.ratio * 100) : null,
              ...baseCsv(row),
            ];
          }),
        );
  const shownCount =
    target === null ? sorted.length : colorGroups.reduce((n, group) => n + group.rows.length, 0);

  const PRINTER_COLS = 13;

  return (
    <section className="dt-section pcx">
      <h2>
        {target === null ? 'すべてのトナー' : `${target.label} で使えるトナー`}（{shownCount} 件）
        <CsvButton
          name={target === null ? 'トナー比較_すべて' : 'トナー比較_プリンター別'}
          header={csvHeader}
          rows={csvRows}
          count={shownCount}
          label="CSV（比較）"
        />
      </h2>

      <div className="dt-tools pcx-tools">
        <label className="pcx-target">
          <span>プリンターを選ぶ</span>
          <select value={targetValue} onChange={(e) => onTarget(e.target.value)}>
            <option value="">選ばない（すべてのトナーを出す）</option>
            {groups.map((group) => (
              <optgroup key={group.key} label={group.label}>
                <option value={`model:${group.key}`}>
                  {group.label} の全 {group.assets.length} 台
                </option>
                {group.assets.map((asset) => (
                  <option key={asset.id} value={`asset:${asset.id}`}>
                    {assetLabel(asset)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <SearchBox
          value={query}
          onChange={setQuery}
          label="探す（比較）"
          placeholder="品番・販売店・機種・色"
          count={shownCount}
          total={fitting.length}
        />

        <label>
          <span>色</span>
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            <option value="">すべて</option>
            {colorChoices.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value={NO_COLOR}>色なし（ドラム・回収容器など）</option>
          </select>
        </label>

        <label>
          <span>区分</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="">すべて</option>
            {KIND_ORDER.map((item) => (
              <option key={item} value={item}>
                {KIND_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>種類</span>
          <select value={part} onChange={(e) => setPart(e.target.value as typeof part)}>
            <option value="">すべて</option>
            {PART_ORDER.map((item) => (
              <option key={item} value={item}>
                {PART_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>出どころ</span>
          <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
            <option value="">すべて</option>
            <option value="master">トナー登録（使っているトナー）</option>
            <option value="offer">トナー情報（比較用）</option>
          </select>
        </label>

        <label className="pc-check">
          <input
            type="checkbox"
            checked={hideExpired}
            onChange={(e) => setHideExpired(e.target.checked)}
          />
          <span>期限切れの見積を出さない</span>
        </label>
      </div>

      {offersError && (
        <p className="dt-msg dt-msg-error">
          トナー情報を読み込めませんでした（{offersError}）。トナー登録の品番だけを出しています。
        </p>
      )}

      {target !== null && printerSummary && (
        <p className="pcx-summary">
          {target.kind === 'asset' ? 'この台' : 'この機種の台'}が今使っているトナーは{' '}
          <strong>{printerSummary.inUse} 品番</strong>
          、ほかに使えるトナーは <strong>{printerSummary.options} 件</strong>
          {printerSummary.cheaper > 0 && (
            <>
              （うち使用中より 1 枚あたりが安いもの <strong>{printerSummary.cheaper} 件</strong>）
            </>
          )}
          です。
          {printerSummary.inUse === 0 && (
            <>
              {' '}
              <b>トナー登録でこの台にトナーが紐づいていないため、差は出せません。</b>
              トナー登録の「対応プリンター」で付けてください。
            </>
          )}
          {volume !== undefined && fitting.some((row) => (row.monthlyFee ?? 0) > 0) && (
            <span className="pcx-volume">
              {volume.pages !== null ? (
                <>
                  月額の基本料金は、
                  {target.kind === 'asset' ? 'この台' : `この機種の ${volume.counted} 台の平均`}
                  の月の印刷枚数 <strong>約 {num.format(Math.round(volume.pages))} 枚</strong>
                  （直近 {volumeDays} 日の記録から）で割って 1 枚あたりに足しています。
                </>
              ) : (
                <b>
                  {target.kind === 'asset' ? 'この台' : 'この機種の台'}
                  は印刷枚数の記録が無いため、月額の基本料金を 1 枚あたりに足せていません（その分だけ安く見えます）。
                </b>
              )}
            </span>
          )}
        </p>
      )}

      <p className="dt-hint">
        {target === null
          ? '「トナー登録」は実際に使っているトナー（受付・注文で使う品番）、「トナー情報」はトナー情報登録で入れた比較用の値段です。1 枚あたりは本体と送料の合計で、月額の基本料金は台の枚数が要るため、プリンターを選ぶとその台の枚数で割って足します。プリンターを選ぶと、その台に使えるものだけを色ごとに並べて、今使っているトナーと比べます。'
          : '色ごとに 1 枚あたりの安い順です。差は同じ色の「使用中」に対してで、使用中が 2 つあるときは安いほうと比べます（マイナスが安い）。1 枚あたり = 本体（価格 ÷ 入数 ÷ 印刷可能枚数。カウンター料金ならその料金）＋ 送料（1 回に最小注文数、空欄なら 1 箱を頼むとして割る）＋ 月額（台の月の印刷枚数で割る）。月額は台ごとにかかるので、色ごとに分けた比較ではそれぞれの色に同じ額が乗ります。'}
      </p>

      {offers === null && !offersError ? (
        <p className="dt-empty">読み込んでいます…</p>
      ) : shownCount === 0 ? (
        <p className="dt-empty">
          {filteredOn
            ? '絞り込みに当てはまるトナーがありません。'
            : target === null
              ? '登録されているトナーがありません。'
              : 'この台に使えるトナーが登録されていません。トナー登録の対応プリンターか、トナー情報登録の「使える機種」で付けてください。'}
        </p>
      ) : target === null ? (
        <TableBox className="dt-wrap" memoryKey="priceCompare.all">
          <table className="dt-table pcx-table">
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
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.key} className={row.expired ? 'pcx-row-expired' : undefined}>
                  <td>{sourceCell(row)}</td>
                  <td>
                    <span className="dt-mono">{row.code}</span>
                    {row.source === 'offer' && row.masterId && (
                      <span className="pc-flag" title={`トナー登録にも同じ品番（${row.masterId}）があります`}>
                        使用中の品番
                      </span>
                    )}
                    {row.name && <span className="pcx-sub">{row.name}</span>}
                  </td>
                  <td>{kindCell(row)}</td>
                  <td className={row.part === 'TONER' ? undefined : 'pcx-part'}>
                    {PART_LABELS[row.part]}
                  </td>
                  <td>{row.color ?? muted}</td>
                  <td className="pc-models" title={modelsOf(row).join('\n')}>
                    {modelsText(row) || <span className="dt-muted">未設定</span>}
                  </td>
                  <td>{sellerCell(row)}</td>
                  <td>{row.purchaseType ? PURCHASE_LABELS[row.purchaseType] : muted}</td>
                  <td className="dt-num">
                    {yen(row.unitPrice) ?? muted}
                    {row.packQuantity > 1 && (
                      <span className="pcx-sub">
                        {row.packQuantity} 本入り {yen(row.price)}
                      </span>
                    )}
                  </td>
                  <td className="dt-num">
                    {row.yieldPages === null ? muted : `${num.format(row.yieldPages)} 枚`}
                  </td>
                  <td className="dt-num">{costCell(row)}</td>
                  <td className="dt-num">{yen(row.monthlyFee) ?? muted}</td>
                  <td>{dateCell(row)}</td>
                  <td>{validCell(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableBox>
      ) : (
        <TableBox className="dt-wrap" memoryKey="priceCompare.byPrinter">
          <table className="dt-table pcx-table">
            <thead>
              <tr>
                <th className="dt-plain">状況</th>
                <th className="dt-plain">品番</th>
                <th className="dt-plain">区分</th>
                <th className="dt-plain">販売店・購入先</th>
                <th className="dt-plain">購入形態</th>
                <th className="dt-plain dt-num">1 枚あたり</th>
                <th className="dt-plain dt-num">使用中との差</th>
                <th className="dt-plain dt-num">1 本あたり</th>
                <th className="dt-plain dt-num">印刷可能枚数</th>
                <th className="dt-plain dt-num">月額・送料</th>
                <th className="dt-plain">納期・回収</th>
                <th className="dt-plain">価格の日付</th>
                <th className="dt-plain">有効期限</th>
              </tr>
            </thead>
            {colorGroups.map((group) => (
              <tbody key={group.label}>
                <tr className="pcx-group">
                  <th colSpan={PRINTER_COLS}>
                    {group.label}
                    <span className="pcx-group-count">{group.rows.length} 件</span>
                    {group.base === null ? (
                      <span className="pcx-group-note">
                        この色は使用中のトナーが無い（か価格・枚数が未入力の）ため、差を出していません
                      </span>
                    ) : (
                      // 絞り込みで使用中の行が隠れていても、何と比べた差かは見せる
                      !group.rows.some((row) => row.key === group.base!.key) && (
                        <span className="pcx-group-note">
                          差の基準: 使用中の {group.base.code}（1 枚 {perPage(group.base.costPerPage)}）
                          ——絞り込みで表からは外れています
                        </span>
                      )
                    )}
                  </th>
                </tr>
                {group.rows.map((row) => {
                  const standing = standingOf(row);
                  const diff = diffFor(row, group.base);
                  return (
                    <tr
                      key={row.key}
                      className={[
                        standing === 'inUse' ? 'pcx-row-inuse' : '',
                        row.expired ? 'pcx-row-expired' : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined}
                    >
                      <td>
                        <span className={`pcx-standing pcx-standing-${standing}`}>
                          {STANDING_LABELS[standing]}
                        </span>
                        {row.source === 'offer' && row.masterId && (
                          <span
                            className="pc-flag"
                            title={`トナー登録にも同じ品番（${row.masterId}）があります。今使っているトナーを、この店で買ったときの値段です`}
                          >
                            使用中の品番
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="dt-mono">{row.code}</span>
                        {row.name && <span className="pcx-sub">{row.name}</span>}
                      </td>
                      <td>{kindCell(row)}</td>
                      <td>{sellerCell(row)}</td>
                      <td>{row.purchaseType ? PURCHASE_LABELS[row.purchaseType] : muted}</td>
                      <td className="dt-num">{costCell(row)}</td>
                      <td className="dt-num">
                        {group.base !== null && row.key === group.base.key ? (
                          <span className="dt-muted">基準</span>
                        ) : diff ? (
                          <span className={diff.value < 0 ? 'pcx-cheaper' : diff.value > 0 ? 'pcx-dearer' : undefined}>
                            {diffText(diff, 2)}
                          </span>
                        ) : (
                          muted
                        )}
                      </td>
                      <td className="dt-num">
                        {yen(row.unitPrice) ?? muted}
                        {row.packQuantity > 1 && (
                          <span className="pcx-sub">{row.packQuantity} 本入り</span>
                        )}
                      </td>
                      <td className="dt-num">
                        {row.yieldPages === null ? muted : `${num.format(row.yieldPages)} 枚`}
                      </td>
                      <td className="dt-num">
                        {row.monthlyFee === null && row.shippingFee === null ? (
                          muted
                        ) : (
                          <>
                            {row.monthlyFee !== null && <span>月 {yen(row.monthlyFee)}</span>}
                            {row.shippingFee !== null && (
                              <span className="pcx-sub">送料 {yen(row.shippingFee)}</span>
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        {row.source === 'master' ? (
                          muted
                        ) : (
                          <>
                            {row.leadTime ?? <span className="dt-muted">納期 —</span>}
                            <span className="pcx-sub">回収 {takesBackLabel(row.takesBack)}</span>
                          </>
                        )}
                      </td>
                      <td>{dateCell(row)}</td>
                      <td>{validCell(row)}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </TableBox>
      )}
    </section>
  );
}
