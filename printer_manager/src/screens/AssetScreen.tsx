import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import CsvButton from '../components/CsvButton';
import Modal from '../components/Modal';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import { MANUAL_MAINT, maintStatus } from '../lib/maint';

import type { CsvValue } from '../lib/csv';
import { foldKey } from '../lib/fold';
import { num, orNull } from '../lib/format';
import { hits, searchWords } from '../lib/search';
import { suggestions } from '../lib/suggest';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import { useCompany } from '../lib/company';
import { refreshAsset } from '../lib/refresh';
import './AssetScreen.css';

/** 保守企業の選択肢。登録は「保守企業」の画面で行う */
type Vendor = {
  id: number;
  name: string;
  phones: string[];
  /** この業者が既定になるメーカー。台帳で指定しない機器がここに落ちる */
  makers: string[];
};

/** 枚数の集計表でこの機器が占める行 */
type CountLayout = 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';

/** 台帳の手入力項目。こちらは DB に保存する */
type Asset = {
  /**
   * 持っている拠点。**必須。**
   * トナーの在庫と受け払いをこの単位で数えるので、機器には必ず持たせる。
   * 入力欄の値なので、他の欄と同じく文字列で持つ
   */
  companyId: string;
  department: string;
  /**
   * **`no`（管理番号）はここに持たない。**
   *
   * 台帳の鍵として使うので、人が打ち替えるものではない。新規登録のときに
   * API が振り（`nextAssetNo`）、画面には一覧の列と登録の知らせで出すだけにする。
   * この型に無ければ `toPayload` も送らないので、**更新（PATCH）でも触らない**
   * （送られてこなかった列に API は手を付けない）
   */
  ipAddress: string;
  maker: string;
  model: string;
  serialNumber: string;
  purchasedOn: string;
  /** 購入金額（円）。入力欄の値なので文字列で持つ */
  purchasePrice: string;
  contractNo: string;
  /** 保守を頼んでいる業者。保守企業の画面で登録したものから選ぶ */
  maintVendorId: string;
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
  /** 持っている拠点。在庫と受け払いを分ける単位 */
  companyId: number;
  company: { id: number; name: string } | null;
  purchasedOn: string | null;
  purchasePrice: number | null;
  contractNo: string | null;
  maintVendorId: number | null;
  /** 会社名と連絡先は保守企業マスタ側。表示用に添えて返ってくる */
  maintVendor: { id: number; name: string; phones: string[] } | null;
  /**
   * 実際に頼む先。台帳で指定していればそれ（source: 'asset'）、
   * していなければメーカーの既定（source: 'maker'）。どちらも無ければ null
   */
  effectiveVendor: {
    id: number;
    name: string;
    phones: string[];
    source: 'asset' | 'maker';
  } | null;
  maintContract: string | null;
  maintStartOn: string | null;
  maintEndOn: string | null;
  maintDealOn: string | null;
  maintFee: number | null;
  note: string | null;
  countLayout: CountLayout;
  /**
   * 無効にした日時。null なら有効。
   * **削除の代わり。** 無効にした台は下の別枠に移り、他の画面の選択肢からも外れる
   */
  disabledAt: string | null;
  updatedAt: string;
};

/**
 * 新規登録の戻り。**同じ機種の台からトナーの紐づけを引き継いだ結果が添えてある。**
 * `SavedAsset` には足さない（一覧の列と並べ替えの鍵が `keyof SavedAsset` から
 * 作られているので、表に出ない項目を混ぜない）
 */
type CreatedAsset = SavedAsset & {
  inheritedToners: {
    /** 引き継ぎ元の機種。台帳の書き方そのまま。見つからなければ null */
    model: string | null;
    toners: { id: string; name: string | null }[];
    /** 引き継ぎ元になった台数 */
    fromAssets: number;
  };
};

const EMPTY: Asset = {
  companyId: '',
  department: '',
  ipAddress: '',
  maker: '',
  model: '',
  serialNumber: '',
  purchasedOn: '',
  purchasePrice: '',
  contractNo: '',
  maintVendorId: '',
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

/** 一覧の「更新」で実機を取り直したときの結果 */
/**
 * 一覧の列。ソートの鍵も兼ねる。maintStatus だけは保存値でなく導出値。
 * effectiveVendor は保守企業の列が中で見るので、列としては持たない
 */
type SortKey = Exclude<keyof SavedAsset, 'id' | 'effectiveVendor'> | 'maintStatus';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  // 全拠点をまとめて出す画面なので、どこの機器かが分かるよう拠点を先頭に置く
  { key: 'company', label: '拠点', kind: 'text' },
  { key: 'department', label: '部署', kind: 'text' },
  { key: 'no', label: 'No.', kind: 'text' },
  { key: 'ipAddress', label: 'IP アドレス', kind: 'ip' },
  { key: 'maker', label: 'メーカー', kind: 'text' },
  { key: 'model', label: '型番', kind: 'text' },
  { key: 'serialNumber', label: 'シリアル', kind: 'text' },
  { key: 'purchasedOn', label: '購入日', kind: 'date' },
  { key: 'purchasePrice', label: '購入金額', kind: 'number', numeric: true },
  { key: 'contractNo', label: '契約 No.', kind: 'text' },
  { key: 'maintVendor', label: '保守企業', kind: 'text' },
  { key: 'maintStatus', label: '保守', kind: 'text' },
  { key: 'maintStartOn', label: '保守開始', kind: 'date' },
  { key: 'maintEndOn', label: '保守終了', kind: 'date' },
  { key: 'maintDealOn', label: '保守取引', kind: 'date' },
  { key: 'maintFee', label: '保守金額', kind: 'number', numeric: true },
  { key: 'note', label: '備考', kind: 'text' },
  { key: 'updatedAt', label: '更新日', kind: 'date' },
];

/**
 * CSV に出す列。**画面の COLUMNS とは別に持つ。**
 * 表では 1 つの欄にまとめている保守企業を、名前・出どころ・電話番号に開く
 */
const CSV_COLUMNS: { label: string; value: (row: SavedAsset) => CsvValue }[] = [
  { label: '拠点', value: (row) => row.company?.name ?? null },
  { label: '部署', value: (row) => row.department },
  { label: 'No.', value: (row) => row.no },
  { label: 'IP アドレス', value: (row) => row.ipAddress },
  { label: 'メーカー', value: (row) => row.maker },
  { label: '型番', value: (row) => row.model },
  { label: 'シリアル', value: (row) => row.serialNumber },
  { label: '購入日', value: (row) => row.purchasedOn },
  { label: '購入金額', value: (row) => row.purchasePrice },
  { label: '契約 No.', value: (row) => row.contractNo },
  { label: '保守企業', value: (row) => row.effectiveVendor?.name ?? null },
  {
    // 台帳で名指ししたのか、メーカーの既定で決まったのか。CSV では印が出せない
    label: '保守企業の指定',
    value: (row) =>
      row.effectiveVendor === null
        ? null
        : row.effectiveVendor.source === 'asset'
          ? 'この機器を指定'
          : 'メーカーの既定',
  },
  {
    label: '電話番号',
    value: (row) => row.effectiveVendor?.phones.join(' / ') ?? null,
  },
  {
    label: '保守',
    value: (row) => maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract),
  },
  { label: '保守開始', value: (row) => row.maintStartOn },
  { label: '保守終了', value: (row) => row.maintEndOn },
  { label: '保守取引', value: (row) => row.maintDealOn },
  { label: '保守金額', value: (row) => row.maintFee },
  { label: '備考', value: (row) => row.note },
  {
    label: '更新日',
    value: (row) => new Date(row.updatedAt).toLocaleString('ja-JP'),
  },
];

/** 無効にした機器の CSV。画面の別枠と同じ列 */
const DISABLED_CSV_COLUMNS: { label: string; value: (row: SavedAsset) => CsvValue }[] = [
  { label: '拠点', value: (row) => row.company?.name ?? null },
  { label: '部署', value: (row) => row.department },
  { label: 'No.', value: (row) => row.no },
  { label: 'IP アドレス', value: (row) => row.ipAddress },
  { label: 'メーカー', value: (row) => row.maker },
  { label: '型番', value: (row) => row.model },
  { label: 'シリアル', value: (row) => row.serialNumber },
  {
    label: '無効にした日時',
    value: (row) =>
      row.disabledAt ? new Date(row.disabledAt).toLocaleString('ja-JP') : null,
  },
];

/**
 * 保存で送る形。**`Asset` の全項目を並べる。**
 *
 * キーを `keyof Asset` から作ってあるので、`Asset` に項目を足して
 * ここに足し忘れるとコンパイルが落ちる。以前 `countLayout` の足し忘れで
 * 保存のたび値が既定に戻る事故が起きたため、型で止めている
 * （API 側も送られてこなかった列には触らないようになっている）
 */
type AssetPayload = Record<keyof Asset, string | number | null>;

function toPayload(asset: Asset): AssetPayload {
  return {
    // 拠点は必須。空のまま送ると API が 400 で断る
    companyId: asset.companyId === '' ? null : Number(asset.companyId),
    department: orNull(asset.department),
    ipAddress: orNull(asset.ipAddress),
    maker: orNull(asset.maker),
    model: orNull(asset.model),
    serialNumber: orNull(asset.serialNumber),
    purchasedOn: orNull(asset.purchasedOn),
    purchasePrice:
      asset.purchasePrice.trim() === '' ? null : Number(asset.purchasePrice),
    contractNo: orNull(asset.contractNo),
    maintVendorId:
      asset.maintVendorId === '' ? null : Number(asset.maintVendorId),
    maintContract: orNull(asset.maintContract),
    maintStartOn: orNull(asset.maintStartOn),
    maintEndOn: orNull(asset.maintEndOn),
    maintDealOn: orNull(asset.maintDealOn),
    maintFee: asset.maintFee.trim() === '' ? null : Number(asset.maintFee),
    note: orNull(asset.note),
    countLayout: asset.countLayout,
  };
}

/**
 * 新規登録でトナーを引き継げたかどうかの一言。登録しましたの後ろに足す。
 *
 * **引き継げなかったときも黙らない。** 何も出ないと引き継がれたと読めてしまい、
 * トナーの付いていない台がそのまま残る。同じ型番が無いのか、型番が未入力で
 * 機種が決まらなかったのかで文面を分ける
 */
function inheritedNote(
  inherited: CreatedAsset['inheritedToners'],
  model: string | null,
): string {
  const { toners } = inherited;

  if (toners.length === 0) {
    return model
      ? ' / 同じ型番の登録が無いので、トナーは紐づけていません（トナー登録で設定してください）'
      : ' / 型番が未入力なので、トナーは紐づけていません';
  }

  const heads = toners.slice(0, 3).map((toner) => toner.id).join('・');
  const rest = toners.length > 3 ? ` ほか ${toners.length - 3} 件` : '';
  return (
    ` / 同じ機種（${inherited.model}）の ${inherited.fromAssets} 台から` +
    ` ${heads}${rest}を引き継ぎました`
  );
}

function toForm(saved: SavedAsset): Asset {
  return {
    companyId: String(saved.companyId),
    department: saved.department ?? '',
    ipAddress: saved.ipAddress ?? '',
    maker: saved.maker ?? '',
    model: saved.model ?? '',
    serialNumber: saved.serialNumber ?? '',
    purchasedOn: saved.purchasedOn ?? '',
    purchasePrice: saved.purchasePrice === null ? '' : String(saved.purchasePrice),
    contractNo: saved.contractNo ?? '',
    maintVendorId:
      saved.maintVendorId === null ? '' : String(saved.maintVendorId),
    maintContract: saved.maintContract ?? '',
    maintStartOn: saved.maintStartOn ?? '',
    maintEndOn: saved.maintEndOn ?? '',
    maintDealOn: saved.maintDealOn ?? '',
    maintFee: saved.maintFee === null ? '' : String(saved.maintFee),
    note: saved.note ?? '',
    countLayout: saved.countLayout,
  };
}

/**
 * 台帳の値と実機の値を突き合わせる。どちらか空なら判定しない。
 * 表記ゆれで「違う」と出さないよう、他の突き合わせと同じ `foldKey` で畳む
 */
function compare(input: string, actual: string | null): 'same' | 'diff' | null {
  const a = foldKey(input);
  const b = foldKey(actual ?? '');
  if (!a || !b) return null;
  return a === b ? 'same' : 'diff';
}

/** 入力欄の候補。登録済みの台帳から作る（`AssetScreen` の `hints`） */
type Hints = {
  departments: string[];
  makers: string[];
  models: string[];
  contractNos: string[];
};

/**
 * 台帳の入力欄。新規登録の欄と、編集の小窓で同じものを使う。
 * 親の `.as-fields`（3 列の格子）にそのまま並ぶよう、囲みを持たずに返す。
 *
 * **管理番号（No.）の欄は置かない**（`Asset` の説明を参照）
 */
function AssetFields({
  asset,
  onChange,
  companies,
  vendors,
  hints,
  onIpEnter,
}: {
  asset: Asset;
  onChange: (key: keyof Asset, value: string) => void;
  companies: { id: number; name: string }[];
  vendors: Vendor[];
  hints: Hints;
  /** IP の欄で Enter を押したとき。新規の欄だけ実機に問い合わせる */
  onIpEnter?: () => void;
}) {
  // 新規の欄と小窓が同時に並ぶので、datalist の id を欄ごとに分ける
  const listId = useId();

  /**
   * 入力中のメーカーに対する既定の業者。選択欄の見出しに出す。
   *
   * **API 側の `makerKey` と同じ `foldKey` で畳む。**畳み方が違うと、
   * この見出しには業者が出ないのに保存すると業者が付く（またはその逆）という
   * 食い違いになる
   */
  const defaultVendor =
    vendors.find((vendor) =>
      vendor.makers.some((maker) => foldKey(maker) === foldKey(asset.maker)),
    ) ?? null;

  return (
    <>
      {/*
        * 入力欄の候補は datalist で出す。**選ぶだけでなく自由入力もできる。**
        * 一覧に無い部署・メーカーもそのまま打てるので、表記を揃えたいが
        * 決め打ちにはできない欄に向く。候補は登録済みの台帳から作る
        */}
      <label>
        <span>部署</span>
        <input
          value={asset.department}
          onChange={(e) => onChange('department', e.target.value)}
          list={`${listId}-departments`}
        />
        <datalist id={`${listId}-departments`}>
          {hints.departments.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </label>

      {/*
        * 拠点は必須。トナーの在庫と受け払いをこの単位で数えるため。
        * 新規のときは、持出/廃棄などの拠点欄で最後に選んだ拠点を初期値にする
        */}
      <label>
        <span>拠点</span>
        <select
          value={asset.companyId}
          onChange={(e) => onChange('companyId', e.target.value)}
          title="この機器を持っている拠点です。トナーの在庫と受け払いがこの単位で分かれます"
        >
          <option value="">選んでください</option>
          {companies.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>IP アドレス</span>
        <input
          value={asset.ipAddress}
          onChange={(e) => onChange('ipAddress', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onIpEnter?.();
          }}
          placeholder="172.31.13.211"
          inputMode="decimal"
        />
      </label>

      {/*
        * メーカーは保守業者のメーカー既定と突き合わせる鍵でもある
        * （`makerKey` が小文字化して比べる）。候補から選べば表記が揃い、
        * 「業者が引けない」を防げる
        */}
      <label>
        <span>メーカー</span>
        <input
          value={asset.maker}
          onChange={(e) => onChange('maker', e.target.value)}
          placeholder="Ricoh"
          list={`${listId}-makers`}
        />
        <datalist id={`${listId}-makers`}>
          {hints.makers.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </label>

      <label>
        <span>型番</span>
        <input
          value={asset.model}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="P501"
          list={`${listId}-models`}
        />
        <datalist id={`${listId}-models`}>
          {hints.models.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </label>

      <label>
        <span>シリアル</span>
        <input
          value={asset.serialNumber}
          onChange={(e) => onChange('serialNumber', e.target.value)}
          placeholder="48PM-122682"
        />
      </label>

      <label>
        <span>購入日</span>
        <input
          type="date"
          value={asset.purchasedOn}
          onChange={(e) => onChange('purchasedOn', e.target.value)}
        />
      </label>

      <label>
        <span>購入金額（円）</span>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={asset.purchasePrice}
          onChange={(e) => onChange('purchasePrice', e.target.value)}
          placeholder="0"
        />
      </label>

      <label>
        <span>契約 No.</span>
        <input
          value={asset.contractNo}
          onChange={(e) => onChange('contractNo', e.target.value)}
          list={`${listId}-contract-nos`}
        />
        <datalist id={`${listId}-contract-nos`}>
          {hints.contractNos.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </label>

      <label>
        <span>保守企業</span>
        <select
          value={asset.maintVendorId}
          onChange={(e) => onChange('maintVendorId', e.target.value)}
        >
          {/*
            空欄は「メーカーの既定に従う」の意味。
            業者を選ぶと、その機器だけ既定を上書きする
          */}
          <option value="">
            {defaultVendor
              ? `メーカーの既定に従う（${asset.maker.trim()} → ${defaultVendor.name}）`
              : 'メーカーの既定に従う（既定なし）'}
          </option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
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
            onChange={(e) => onChange('maintContract', e.target.value)}
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
          onChange={(e) => onChange('maintStartOn', e.target.value)}
        />
      </label>

      <label>
        <span>保守終了日</span>
        <input
          type="date"
          value={asset.maintEndOn}
          onChange={(e) => onChange('maintEndOn', e.target.value)}
        />
      </label>

      <label>
        <span>保守取引日</span>
        <input
          type="date"
          value={asset.maintDealOn}
          onChange={(e) => onChange('maintDealOn', e.target.value)}
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
          onChange={(e) => onChange('maintFee', e.target.value)}
          placeholder="0"
        />
      </label>

      <label className="as-wide">
        <span>備考</span>
        <input
          value={asset.note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="リース / USB接続 など"
        />
      </label>
    </>
  );
}

export default function AssetScreen() {
  const { companies, companyId: selectedCompanyId } = useCompany();
  /** 新規登録の欄。**新規専用。** 登録済みの台を直すのは下の小窓 */
  const [asset, setAsset] = useState<Asset>(EMPTY);
  /**
   * 編集の小窓。null なら閉じている。新規の欄とは別に下書きを持つので、
   * 書きかけの新規登録や実機の取得結果を消さずに、別の台を直せる
   */
  const [editing, setEditing] = useState<{ id: number; label: string; form: Asset } | null>(
    null,
  );
  const [editError, setEditError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedAsset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'department',
    dir: 'asc',
  });
  /** 一覧を絞る文字。**取ってある台をこの場で絞るだけで、API は叩かない** */
  const [query, setQuery] = useState('');
  /** 無効にした機器の別枠を絞る文字。上の一覧とは別に持つ（表が別なので） */
  const [disabledQuery, setDisabledQuery] = useState('');
  const [community, setCommunity] = useState('public');
  const [probe, setProbe] = useState<Probe | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      // 保守企業は選択欄に出す。登録は「保守企業」の画面で行う
      const [assets, vendorRows] = await Promise.all([
        // この画面だけは無効にした台も要る。下の別枠に出して元に戻せるようにするため
        request<SavedAsset[]>('/printer-assets?includeDisabled=1'),
        request<Vendor[]>('/maint-vendors'),
      ]);
      setSaved(assets);
      setVendors(vendorRows);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** 有効な台だけ。無効にしたものは下の別枠に分ける */
  const active = useMemo(() => saved.filter((row) => row.disabledAt === null), [saved]);

  /** 無効にした台。止めた日の新しい順に並べる（直前に間違えた分が上に来る） */
  const disabled = useMemo(
    () =>
      saved
        .filter((row) => row.disabledAt !== null)
        .sort((a, b) => (a.disabledAt! < b.disabledAt! ? 1 : -1)),
    [saved],
  );

  /** 別枠に出す無効の台。並びはそのままで、探す欄のぶんだけ絞る */
  const shownDisabled = useMemo(() => {
    const words = searchWords(disabledQuery);
    return disabled.filter((row) =>
      hits(
        [
          row.company?.name,
          row.department,
          row.no,
          row.ipAddress,
          row.maker,
          row.model,
          row.serialNumber,
        ],
        words,
      ),
    );
  }, [disabled, disabledQuery]);

  /**
   * 入力欄に出す「過去に入力した値」の候補。
   *
   * **無効にした台のぶんも混ぜる**（`saved` を使う）。使わなくなった機器でも
   * 部署やメーカーの書き方は生きているので、候補から外す理由がない。
   *
   * 型番は同じ機種を何台も持つので、よく使われている順が実用的。
   * 部署・メーカー・契約 No. は件数に偏りが少ないので探しやすさを採って名前順。
   *
   * 大文字小文字と全角半角は `suggestions` が畳むので、`RICOH` と `Ricoh`、
   * `3階病棟` と `３階病棟` はそれぞれ 1 件にまとまり、多いほうの表記で出る。
   *
   * **実機から読めた機種名（printers 側）は混ぜない。** あちらは SNMP が返した
   * 値で、台帳の書き方と食い違うことがある（`iR-ADV C3520F` と
   * `Canon iR-ADV C3520F` など）。混ぜるとどちらが台帳の正しい書き方か
   * 分からなくなるので、候補は台帳に人が入れた値だけにする
   */
  const hints = useMemo(
    () => ({
      departments: suggestions(
        saved.map((row) => row.department),
        'name',
      ),
      makers: suggestions(
        saved.map((row) => row.maker),
        'name',
      ),
      models: suggestions(saved.map((row) => row.model)),
      contractNos: suggestions(
        saved.map((row) => row.contractNo),
        'name',
      ),
    }),
    [saved],
  );

  const sorted = useMemo(() => {
    const words = searchWords(query);
    // 探すのは台を指す値だけ。日付や金額は数字が並ぶので入れない
    const found = active.filter((row) =>
      hits(
        [
          row.company?.name,
          row.department,
          row.no,
          row.ipAddress,
          row.maker,
          row.model,
          row.serialNumber,
          row.contractNo,
          row.effectiveVendor?.name,
          row.note,
        ],
        words,
      ),
    );

    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(
      found,
      (row) =>
        sort.key === 'maintStatus'
          ? maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract)
          : sort.key === 'maintVendor'
            ? (row.effectiveVendor?.name ?? null)
            : sort.key === 'company'
              ? (row.company?.name ?? null)
              : row[sort.key],
      column?.kind ?? 'text',
      sort.dir,
      (row) => row.id,
    );
  }, [active, sort, query]);

  /** 凡例に出す台数。行の色分けと同じ判定を使う。無効の台は数えない */
  const maintCounts = useMemo(() => {
    const counts = { expired: 0, none: 0, bad: 0 };
    for (const row of active) {
      const status = maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract);
      if (status === '不整合') counts.bad++;
      else if (status === '×') counts.expired++;
      else if (status === null) counts.none++;
    }
    return counts;
  }, [active]);

  const set = (key: keyof Asset, value: string) =>
    setAsset((prev) => ({ ...prev, [key]: value }));

  const setDraft = (key: keyof Asset, value: string) =>
    setEditing((prev) => prev && { ...prev, form: { ...prev.form, [key]: value } });

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

  /**
   * 新規登録。**上の欄は新規専用**なので、登録したら空に戻す。
   * 残しておくと続けて押したときに同じ台がもう 1 台、別の No. で登録されてしまう
   */
  const create = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await request<CreatedAsset>('/printer-assets', {
        method: 'POST',
        body: JSON.stringify(toPayload(asset)),
      });

      // 振られた No. はここに出る。画面に入力欄が無いので、知らせが唯一の合図
      const label = `${result.department ?? '部署未設定'} No.${result.no ?? '—'}`;
      setNotice(
        `${label} を登録しました${inheritedNote(result.inheritedToners, result.model)}`,
      );
      setAsset(blank());
      setProbe(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 小窓の保存。**失敗したら小窓を開いたまま、中に文面を出す**
   * （閉じると直した値が消え、後ろの知らせ欄は覆われて見えない）。
   * `countLayout` は画面に欄が無いが、`toForm` で読んだ値をそのまま送り返す
   */
  const update = async () => {
    if (editing === null) return;
    setBusy(true);
    setEditError(null);
    try {
      const result = await request<SavedAsset>(`/printer-assets/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(toPayload(editing.form)),
      });
      setNotice(`${result.department ?? '部署未設定'} No.${result.no ?? '—'} を更新しました`);
      setError(null);
      setEditing(null);
      await load();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * その台帳の IP に問い合わせて実機の情報を取り直す。
   * 併せて台帳の更新日も進むので、「実機を見て確かめた」記録にもなる
   */
  const refresh = async (row: SavedAsset) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await refreshAsset(row.id);

      if (result.status === 'ok') {
        const printer = result.printer;
        const supplies = printer?.readings?.length ?? 0;
        setNotice(
          `${label}（${result.ipAddress}）を取得しました` +
            `${printer?.model ? ` / ${printer.model}` : ''}` +
            `${printer?.serialNumber ? ` / ${printer.serialNumber}` : ''}` +
            `${supplies > 0 ? ` / 消耗品 ${supplies} 件` : ''}` +
            `${result.serial?.status === 'filled' ? ' / シリアルを台帳に登録しました' : ''}`,
        );

        // 書けなかったときは取得自体は成功しているので、警告として別に出す
        if (result.serial?.status === 'taken') {
          const owner = `${result.serial.department ?? '部署未設定'} No.${
            result.serial.no ?? '—'
          }`;
          setError(
            `シリアル ${result.serial.serialNumber} は ${owner} が既に持っているため、` +
              `${label} には登録しませんでした。どちらの台帳の機器か確かめてください`,
          );
        }
      } else if (result.status === 'no-ip') {
        setError(`${label} は IP アドレスが未入力なので実機に問い合わせできません`);
      } else {
        setError(
          `${label}（${result.ipAddress}）から応答がありません` +
            `${result.message ? `（${result.message}）` : ''}。更新日だけ進めました`,
        );
      }

      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 一覧の「編集」。小窓を開くだけで、上の新規の欄と実機の取得結果には触らない */
  const edit = (row: SavedAsset) => {
    setEditing({
      id: row.id,
      label: `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`,
      form: toForm(row),
    });
    setEditError(null);
    setError(null);
    setNotice(null);
  };

  /**
   * 使わなくなった台を無効にする／元に戻す。**普段はこちらを使う。**
   *
   * 台帳を消すと、その機器の修理履歴まで道連れで消える。入れ替えた機器の履歴も
   * 残しておきたいので、消さずに下の別枠へ移す。いつでも元に戻せる。
   *
   * 無効にすると、プリンター状況・修理履歴・トナー登録・保守登録の
   * 選択肢からも外れる（API が既定で有効な台だけを返すため）
   */
  const setDisabled = async (row: SavedAsset, disable: boolean) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;

    if (
      disable &&
      !window.confirm(
        `${label} を無効にします。\n\n` +
          '一覧の下の「無効にした機器」へ移り、修理履歴やトナー登録の選択肢からも外れます。\n' +
          '記録は消えません。いつでも元に戻せます。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<SavedAsset>(
        `/printer-assets/${row.id}/${disable ? 'disable' : 'enable'}`,
        { method: 'POST' },
      );
      setNotice(`${label} を${disable ? '無効にしました' : '元に戻しました'}`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 無効にした台を台帳から完全に消す。**登録し間違えた行の後始末。**
   *
   * 普段は無効のままにしておけばよく、これは戻す必要が無いと分かっている行だけ。
   * 元に戻せないうえ、**修理履歴があると道連れで消える**ので API 側が断る。
   * ここでは押す前に何が起きるかを文面に出す
   */
  const remove = async (row: SavedAsset) => {
    const label = `${row.department ?? '部署未設定'} No.${row.no ?? '—'}`;

    if (
      !window.confirm(
        `${label}（${row.maker ?? ''} ${row.model ?? ''}）を台帳から完全に削除します。\n\n` +
          'この操作は元に戻せません。トナーとの紐づけも一緒に消えます。\n' +
          '\n修理履歴がある機器は削除できません。\n' +
          '記録を残したまま一覧から外しておきたいだけなら、無効のままにしておいてください。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request(`/printer-assets/${row.id}`, { method: 'DELETE' });
      setNotice(`${label} を削除しました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** 新規入力の初期値。拠点だけは拠点欄で最後に選んだもの（端末が覚えている）を入れておく */
  const blank = useCallback(
    (): Asset => ({
      ...EMPTY,
      companyId: selectedCompanyId === null ? '' : String(selectedCompanyId),
    }),
    [selectedCompanyId],
  );

  /*
   * 拠点の一覧が届く前に画面が立ち上がるので、届いてから初期値を入れる。
   * 入力の途中は触らない（選び直したものを勝手に戻さないため）。
   * 編集は小窓が自分の下書きを持つので、ここは新規の欄だけを見ればよい
   */
  useEffect(() => {
    if (selectedCompanyId === null) return;
    setAsset((prev) =>
      prev.companyId === '' ? { ...prev, companyId: String(selectedCompanyId) } : prev,
    );
  }, [selectedCompanyId]);

  const clear = () => {
    setAsset(blank());
    setProbe(null);
    setError(null);
    setNotice(null);
  };

  const serialMatch = probe ? compare(asset.serialNumber, probe.serialNumber) : null;
  const makerMatch =
    probe && asset.maker.trim() && probe.model
      ? foldKey(probe.model).includes(foldKey(asset.maker))
        ? 'same'
        : 'diff'
      : null;

  const cellOf = (row: SavedAsset, key: SortKey) => {
    if (key === 'company') return row.company?.name ?? '—';
    if (key === 'companyId') return row.company?.name ?? '—';
    if (key === 'maintStatus')
      return maintStatus(row.maintEndOn, row.maintStartOn, row.maintContract) ?? '—';
    if (key === 'maintVendor') {
      // 実際に頼む先を出す。メーカーの既定を上書きしている行には印を付ける
      const vendor = row.effectiveVendor;
      if (!vendor) return '—';
      const why =
        vendor.source === 'asset'
          ? 'この機器だけ指定しています（メーカーの既定より優先）'
          : 'メーカーの既定です';
      return (
        <span title={[why, ...vendor.phones].join('\n')}>
          {vendor.source === 'asset' && <span className="as-pin">指定</span>}
          {vendor.name}
          {vendor.phones.length > 0 && (
            <span className="as-more"> {vendor.phones[0]}</span>
          )}
        </span>
      );
    }
    if (key === 'maintFee') {
      return row.maintFee === null ? '—' : `${num.format(row.maintFee)} 円`;
    }
    if (key === 'purchasePrice') {
      return row.purchasePrice === null
        ? '—'
        : `${num.format(row.purchasePrice)} 円`;
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
          そちらは表示のみで保存しません。この欄は新規登録用です。
          登録済みの機器は一覧の「編集」から直します。
        </p>
      </header>

      <section className="as-form as-fields">
        <AssetFields
          asset={asset}
          onChange={set}
          companies={companies}
          vendors={vendors}
          hints={hints}
          onIpEnter={() => {
            if (!busy && asset.ipAddress.trim()) void fetchLive();
          }}
        />

        <label>
          <span>コミュニティ名（取得用・保存しません）</span>
          <input value={community} onChange={(e) => setCommunity(e.target.value)} />
        </label>

        <div className="as-actions">
          <button onClick={() => void create()} disabled={busy}>
            台帳に保存
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
        <h2>
          {/* 数えるのは下に並べる有効な台だけ。無効の台は別枠で数える */}
          登録した端末（{active.length} 台）
          <CsvButton
            name="プリンター登録"
            header={CSV_COLUMNS.map((col) => col.label)}
            rows={() => sorted.map((row) => CSV_COLUMNS.map((col) => col.value(row)))}
            count={sorted.length}
          />
        </h2>

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

        <div className="sbx-row">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="部署・No.・IP・メーカー・型番・シリアル"
            count={sorted.length}
            total={active.length}
            unit="台"
          />
        </div>

        {saved.length === 0 ? (
          <p className="as-empty">まだ登録がありません。上の欄を入力して保存してください。</p>
        ) : sorted.length === 0 && query.trim() !== '' ? (
          <p className="as-empty">
            「{query}」に当てはまる機器がありません（登録は {active.length} 台）。
          </p>
        ) : (
          <TableBox className="as-table-wrap" memoryKey="assets.list">
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
                        row.id === editing?.id ? 'as-row-on' : '',
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
                      <button
                        onClick={() => void refresh(row)}
                        disabled={busy || !row.ipAddress}
                        type="button"
                        title={
                          row.ipAddress
                            ? `${row.ipAddress} に問い合わせて実機の情報を取り直します`
                            : 'IP アドレスが未入力なので問い合わせできません'
                        }
                      >
                        更新
                      </button>
                      <button onClick={() => edit(row)} disabled={busy} type="button">
                        編集
                      </button>
                      <button
                        className="as-del"
                        onClick={() => void setDisabled(row, true)}
                        disabled={busy}
                        type="button"
                        title="一覧の下の「無効にした機器」へ移します。記録は消えません"
                      >
                        無効
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </TableBox>
        )}
      </section>

      {disabled.length > 0 && (
        <section className="as-list as-disabled">
          <h2>
            無効にした機器（{disabled.length} 台）
            <CsvButton
              name="プリンター登録_無効"
              header={DISABLED_CSV_COLUMNS.map((col) => col.label)}
              rows={() =>
                shownDisabled.map((row) =>
                  DISABLED_CSV_COLUMNS.map((col) => col.value(row)),
                )
              }
              count={shownDisabled.length}
            />
          </h2>
          <p className="as-hint">
            使わなくなった機器です。<strong>記録は消えていません。</strong>
            プリンター状況・修理履歴・トナー登録・保守登録の一覧と選択肢からは外れています。
            「元に戻す」を押せば、そのまま元の一覧に戻ります。
            <br />
            登録し間違えた機器は「削除」で台帳から完全に消せます。<strong>元に戻せません。</strong>
            <strong>修理履歴がある機器は削除できません</strong>
            （消すと履歴まで道連れになるため。そのまま無効にしておけば履歴が残ります）。
          </p>

          <div className="sbx-row">
            <SearchBox
              value={disabledQuery}
              onChange={setDisabledQuery}
              label="探す（無効にした機器）"
              placeholder="部署・No.・IP・メーカー・型番・シリアル"
              count={shownDisabled.length}
              total={disabled.length}
              unit="台"
            />
          </div>

          {shownDisabled.length === 0 ? (
            <p className="as-empty">
              「{disabledQuery}」に当てはまる機器がありません（無効は {disabled.length} 台）。
            </p>
          ) : (
          <TableBox className="as-table-wrap" memoryKey="assets.disabled">
            <table className="as-table">
              <thead>
                <tr>
                  <th>拠点</th>
                  <th>部署</th>
                  <th>No.</th>
                  <th>IP アドレス</th>
                  <th>メーカー</th>
                  <th>型番</th>
                  <th>シリアル</th>
                  <th>無効にした日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {shownDisabled.map((row) => (
                  <tr key={row.id}>
                    <td>{row.company?.name ?? '—'}</td>
                    <td>{row.department ?? '—'}</td>
                    <td>{row.no ?? '—'}</td>
                    <td className="as-mono">{row.ipAddress ?? '—'}</td>
                    <td>{row.maker ?? '—'}</td>
                    <td>{row.model ?? '—'}</td>
                    <td className="as-mono">{row.serialNumber ?? '—'}</td>
                    <td>
                      {row.disabledAt
                        ? new Date(row.disabledAt).toLocaleString('ja-JP')
                        : '—'}
                    </td>
                    <td className="as-ops">
                      <button
                        onClick={() => void setDisabled(row, false)}
                        disabled={busy}
                        type="button"
                        title="元の一覧に戻します"
                      >
                        元に戻す
                      </button>
                      <button
                        className="as-del"
                        onClick={() => void remove(row)}
                        disabled={busy}
                        type="button"
                        title="台帳から完全に削除します。元に戻せません。修理履歴がある機器は削除できません"
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
      )}

      {editing && (
        <Modal
          title={`${editing.label} を編集`}
          onClose={() => setEditing(null)}
          busy={busy}
          error={editError}
          width={960}
          footer={
            <>
              <span className="md-foot-note">
                実機の情報を取り直すときは、一覧の「更新」を押してください
              </span>
              <button
                className="md-sub"
                type="button"
                onClick={() => setEditing(null)}
                disabled={busy}
              >
                キャンセル
              </button>
              <button type="button" onClick={() => void update()} disabled={busy}>
                {busy ? '保存中…' : '台帳を更新'}
              </button>
            </>
          }
        >
          <div className="as-fields">
            <AssetFields
              asset={editing.form}
              onChange={setDraft}
              companies={companies}
              vendors={vendors}
              hints={hints}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
