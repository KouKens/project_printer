import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import CsvButton from '../components/CsvButton';
import Modal from '../components/Modal';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { CsvValue } from '../lib/csv';
import { todayIso } from '../lib/date';
import { num, orNull } from '../lib/format';
import { guessPart, PART_HINTS, PART_LABELS, PART_ORDER } from '../lib/offer';
import type { SupplyPart } from '../lib/offer';
import { hits, searchWords } from '../lib/search';
import { suggestions } from '../lib/suggest';
import { ipToNumber, nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './TonerScreen.css';

/** 手入力の項目。プリンターは端末情報（printer_assets）の主キーで持つ */
type Form = {
  id: string;
  name: string;
  color: string;
  /** 種類（トナー・ドラム・廃トナーボトル…）。トナー価格比較が同じ種類どうしで比べる */
  part: SupplyPart;
  recycled: boolean;
  /**
   * 比較の基準にする純正品の品番。空なら組を作らない。
   * リサイクル品のときだけ送る（純正に戻したら null を送って外す）
   */
  genuineId: string;
  /**
   * 他の画面（受付・注文の候補、トナー個数状況、トナー入出状況など）に出さない。
   * 価格を比べるためだけに登録する純正用
   */
  hidden: boolean;
  price: string;
  /** 在庫がこの本数以下になったら一覧で警告する。空欄なら警告しない */
  alertThreshold: string;
  /** 1 本で刷れる枚数（カタログ値）。1 枚あたりのトナー代の分母になる */
  yieldPages: string;
  effectiveFrom: string;
  /** 端末情報（台帳）の主キー */
  printerAssetIds: number[];
};

/** API から返るマスタ 1 件 */
type SavedToner = {
  id: string;
  name: string | null;
  color: string | null;
  part: SupplyPart;
  recycled: boolean;
  /** 比較の基準にする純正品。リサイクル品だけが持つ */
  genuineId: string | null;
  /** この品番を純正に選んでいるリサイクル品 */
  alternativeIds: string[];
  /** 他の画面に出さないか。一覧のチェックで切り替える */
  hidden: boolean;
  /** 在庫がこの本数以下なら警告する。未設定なら null */
  alertThreshold: number | null;
  /** 1 本で刷れる枚数（カタログ値）。未設定なら null */
  yieldPages: number | null;
  /** 1 枚あたりのトナー代（税別）。価格と枚数の両方があるときだけ入る */
  costPerPage: number | null;
  /** 今日の時点で有効な税別価格。まだ登録が無ければ null */
  price: number | null;
  priceFrom: string | null;
  priceCount: number;
  /**
   * 無効にした日時。null なら有効。
   * **削除の代わり。** 無効にした品番は下の別枠に移り、受付や注文の候補からも外れる
   */
  disabledAt: string | null;
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

/**
 * 一覧の列。並べ替えの鍵も兼ねる。
 * printers は台数、recycled は純正を先にしたいので、どちらも数として比べる。
 * shown は出す品番を先に、pair は組の軸（純正の品番）で並べて組を隣り合わせる
 */
type SortKey =
  | 'shown'
  | 'id'
  | 'name'
  | 'color'
  | 'part'
  | 'recycled'
  | 'pair'
  | 'price'
  | 'priceFrom'
  | 'priceCount'
  | 'printers'
  | 'alertThreshold'
  | 'yieldPages'
  | 'costPerPage'
  | 'stock';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'shown', label: '表示', kind: 'number' },
  { key: 'id', label: 'トナーID', kind: 'text' },
  { key: 'name', label: 'トナー名', kind: 'text' },
  { key: 'color', label: '色', kind: 'text' },
  { key: 'part', label: '種類', kind: 'number' },
  { key: 'recycled', label: 'リサイクル', kind: 'number' },
  { key: 'pair', label: '純正品（組）', kind: 'text' },
  { key: 'price', label: '価格（税別）', kind: 'number', numeric: true },
  { key: 'yieldPages', label: '印刷可能枚数', kind: 'number', numeric: true },
  { key: 'costPerPage', label: '1 枚あたり', kind: 'number', numeric: true },
  { key: 'priceFrom', label: '適用開始', kind: 'date' },
  { key: 'priceCount', label: '改定', kind: 'number', numeric: true },
  { key: 'printers', label: '対応プリンター', kind: 'number' },
  { key: 'alertThreshold', label: '警告本数', kind: 'number', numeric: true },
  { key: 'stock', label: '在庫', kind: 'number', numeric: true },
];

/** 並べ替えの鍵。入れ子になっている値はここで平らにする */
function pick(toner: SavedToner, key: SortKey): unknown {
  switch (key) {
    case 'shown':
      // 他の画面に出す品番を先に
      return toner.hidden ? 1 : 0;
    case 'pair':
      // 組を作っていない品番は後ろへ。組は純正の品番でまとまり、純正が先に来る
      return toner.genuineId !== null
        ? `${toner.genuineId} 2`
        : toner.alternativeIds.length > 0
          ? `${toner.id} 1`
          : null;
    case 'recycled':
      // 純正（false）を先に集める
      return toner.recycled ? 1 : 0;
    case 'part':
      // トナー・インクを先に、部品を後ろに
      return PART_ORDER.indexOf(toner.part);
    case 'printers':
      return toner.printers.length;
    default:
      return toner[key];
  }
}

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

/**
 * 新規の欄の初期値。**呼んだ時点の今日を適用開始日に入れる。**
 * 定数にすると画面を読み込んだ日で固まり、開きっぱなしの端末では
 * 登録して空に戻すたびに何日も前の日付が初期値に出る
 */
const emptyForm = (): Form => ({
  id: '',
  name: '',
  color: '',
  part: 'TONER',
  recycled: false,
  genuineId: '',
  hidden: false,
  price: '',
  alertThreshold: '',
  yieldPages: '',
  effectiveFrom: todayIso(),
  printerAssetIds: [],
});

/**
 * 送る純正品。**リサイクル品のときだけ。**純正に戻したら null を送って組から外す
 * （欄を隠しても下書きには前の値が残っているので、ここで落とす）
 */
function genuineToSend(form: Form): string | null {
  return form.recycled && form.genuineId !== '' ? form.genuineId : null;
}

/** 空欄は「警告しない」なので null で送る。0 は「在庫 0 で警告」の意味で残す */
function toCount(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

/**
 * 在庫の状態。
 * 0 は切らしているので赤、閾値以下は補充の合図としてオレンジ。
 * 閾値が未設定なら 0 のときだけ赤にする
 */
function stockState(toner: SavedToner): 'out' | 'low' | null {
  if (toner.stock <= 0) return 'out';
  if (toner.alertThreshold !== null && toner.stock <= toner.alertThreshold) {
    return 'low';
  }
  return null;
}

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

/**
 * 一覧の狭いセルに出す短い呼び名。IP 未入力の台帳もあるので No. で代替する。
 *
 * ラベルプリンターや FAX のように IP も No. も持たない台があるので、
 * 最後の手前で型番を出す。ID だけだとどの機器か分からない
 */
const printerShort = (printer: Printer) =>
  printer.ipAddress ??
  (printer.no ? `No.${printer.no}` : null) ??
  printer.model ??
  `ID ${printer.id}`;

/**
 * CSV の 1 セルに機器を並べるときの呼び名。
 * 区切りに使う「 / 」は入れず、空白で繋ぐ（画面の `printerLabel` と別に持つ理由）
 */
const csvPrinterLabel = (printer: Printer) =>
  [
    printer.no ? `No.${printer.no}` : null,
    printer.department,
    printer.ipAddress,
    printer.model,
  ]
    .filter(Boolean)
    .join(' ') || `ID ${printer.id}`;

/** CSV に出す列。画面の COLUMNS に、台数と機器の中身を足したもの */
const CSV_COLUMNS: { label: string; value: (toner: SavedToner) => CsvValue }[] = [
  { label: '他の画面に表示', value: (toner) => (toner.hidden ? '' : '○') },
  { label: 'トナーID', value: (toner) => toner.id },
  { label: 'トナー名', value: (toner) => toner.name },
  { label: '色', value: (toner) => toner.color },
  { label: '種類', value: (toner) => PART_LABELS[toner.part] },
  { label: 'リサイクル', value: (toner) => (toner.recycled ? '○' : '') },
  { label: '純正品', value: (toner) => toner.genuineId },
  {
    label: 'この純正を選んでいるリサイクル品',
    value: (toner) => toner.alternativeIds.join(' / '),
  },
  { label: '価格（税別）', value: (toner) => toner.price },
  { label: '印刷可能枚数', value: (toner) => toner.yieldPages },
  {
    // 銭の桁まで。数として読ませたいので円は付けない
    label: '1 枚あたり',
    value: (toner) =>
      toner.costPerPage === null ? null : Number(toner.costPerPage.toFixed(2)),
  },
  { label: '適用開始', value: (toner) => toner.priceFrom },
  { label: '改定', value: (toner) => toner.priceCount },
  { label: '対応プリンター台数', value: (toner) => toner.printers.length },
  {
    label: '対応プリンター',
    value: (toner) => toner.printers.map(csvPrinterLabel).join(' / '),
  },
  { label: '警告本数', value: (toner) => toner.alertThreshold },
  { label: '在庫', value: (toner) => toner.stock },
];

/** 無効にした品番の CSV。画面の別枠と同じ列 */
const DISABLED_CSV_COLUMNS: { label: string; value: (toner: SavedToner) => CsvValue }[] = [
  { label: 'トナーID', value: (toner) => toner.id },
  { label: 'トナー名', value: (toner) => toner.name },
  { label: '色', value: (toner) => toner.color },
  { label: '在庫', value: (toner) => toner.stock },
  { label: '対応プリンター台数', value: (toner) => toner.printers.length },
  {
    label: '対応プリンター',
    value: (toner) => toner.printers.map(csvPrinterLabel).join(' / '),
  },
  {
    label: '無効にした日時',
    value: (toner) =>
      toner.disabledAt ? new Date(toner.disabledAt).toLocaleString('ja-JP') : null,
  },
];

/** 編集の小窓が持つもの。価格の履歴も一緒に持ち、改定したら取り直す */
type Editing = {
  id: string;
  /** 見出しに出す保存済みの名前。下書きの名前ではない */
  name: string | null;
  /** 下書き。price と effectiveFrom は改定の欄の値 */
  form: Form;
  prices: PriceRow[];
  /**
   * 紐づいているのに、有効な台帳の一覧に無い機器（無効にした台）。開いた時点で決める。
   * 選択肢は有効な台だけなので、足さないと「N 台選択中」に数えられるのに
   * 見えず、1 台ずつ外すこともできない
   */
  retired: Printer[];
  /**
   * 選んである純正品が無効になっていれば、その品番。開いた時点で決める。
   * 純正品の選択肢は有効な純正だけなので、足さないと選択欄が空に見え、
   * 別のものを選んだ途端に元へ戻せなくなる
   */
  retiredGenuine: SavedToner | null;
  /** 価格の改定に添える覚書（値上げの理由・見積の番号など）。改定するたびに空へ戻す */
  priceNote: string;
};

/**
 * 一覧の「純正品（組）」のセル。
 * リサイクル品は相手の純正の品番を、純正は自分を選んでいるリサイクル品の数を出す
 */
function PairCell({ toner, toners }: { toner: SavedToner; toners: SavedToner[] }) {
  if (toner.genuineId !== null) {
    const genuine = toners.find((candidate) => candidate.id === toner.genuineId);
    return (
      <span title={genuine ? genuineLabel(genuine) : undefined}>
        {toner.genuineId}
        {genuine?.disabledAt && <span className="tn-pair-retired">無効</span>}
      </span>
    );
  }
  if (toner.alternativeIds.length > 0) {
    return (
      <span className="tn-chip" title={toner.alternativeIds.join('\n')}>
        リサイクル {toner.alternativeIds.length} 件
      </span>
    );
  }
  return <span className="tn-muted">—</span>;
}

/** 純正品の選択肢 1 つ。無効にした純正は印を付けて並べる */
type GenuineChoice = { toner: SavedToner; retired: boolean };

const genuineLabel = (toner: SavedToner) =>
  [toner.id, toner.name, toner.color].filter(Boolean).join(' ／ ');

const NO_PRINTERS: Printer[] = [];

/**
 * 対応するプリンターの複数選択。
 * **絞り込みの文字は欄ごとに持つ**（新規の欄と編集の小窓で、別々に絞れるようにする）
 */
function PrinterPicker({
  printers,
  retired = NO_PRINTERS,
  selected,
  onChange,
}: {
  printers: Printer[];
  /** 紐づいている無効の台。有効な台の後ろに印を付けて並べる（編集の小窓だけ） */
  retired?: Printer[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [filter, setFilter] = useState('');

  const retiredIds = useMemo(() => new Set(retired.map((printer) => printer.id)), [retired]);
  const choices = useMemo(
    () => [...printers, ...retired.filter((r) => !printers.some((p) => p.id === r.id))],
    [printers, retired],
  );

  const shownPrinters = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return choices;
    return choices.filter((printer) =>
      `${printer.ipAddress ?? ''} ${printer.no ?? ''} ${printer.department ?? ''} ${
        printer.maker ?? ''
      } ${printer.model ?? ''}`
        .toLowerCase()
        .includes(needle),
    );
  }, [choices, filter]);

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  /** 表示中の機器がすべて選択済みか。押しても何も起きないボタンを止めるため */
  const shownAllSelected =
    shownPrinters.length > 0 && shownPrinters.every((printer) => selected.includes(printer.id));

  /**
   * いま表示している機器をまとめて選ぶ。
   *
   * 同じトナーが 20 台に対応することがあり、1 台ずつ押していられない。
   * **絞り込みの外で選んである機器は残す。** 絞り込みを変えながら
   * 「RICOH の分」「Canon の分」と足していけるようにするため、
   * 置き換えではなく追加にする（外すときは隣の「選択を外す」）
   */
  const selectShown = () =>
    onChange([
      ...selected,
      ...shownPrinters
        .filter((printer) => !selected.includes(printer.id))
        .map((printer) => printer.id),
    ]);

  return (
    <div className="tn-printers">
      <div className="tn-printers-head">
        <span>対応するプリンター（{selected.length} 台選択中）</span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="IP・No.・部署・機種で絞り込み"
        />
        <button
          type="button"
          onClick={selectShown}
          disabled={shownPrinters.length === 0 || shownAllSelected}
          title={
            shownAllSelected
              ? '表示中の機器はすべて選択済みです'
              : 'いま表示している機器をまとめて選びます。絞り込みの外で選んである機器はそのまま残ります'
          }
        >
          表示中の {shownPrinters.length} 台を選ぶ
        </button>
        <button type="button" onClick={() => onChange([])}>
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
                checked={selected.includes(printer.id)}
                onChange={() => toggle(printer.id)}
              />
              <span className="tn-ip">{printer.ipAddress ?? '—'}</span>
              <span className="tn-no">{printer.no ? `No.${printer.no}` : ''}</span>
              <span className="tn-model">
                {[printer.department, printer.model].filter(Boolean).join(' / ') || '—'}
              </span>
              {retiredIds.has(printer.id) && (
                <span
                  className="tn-retired"
                  title="無効にした機器です。紐づけは残っています。外すときは印を外して更新してください"
                >
                  無効
                </span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * 入力欄。新規登録の欄と、編集の小窓で同じものを使う。
 * 親の `.tn-fields`（3 列の格子）にそのまま並ぶよう、囲みを持たずに返す
 */
function TonerFields({
  form,
  onChange,
  printers,
  retired,
  genuines,
  nameHints,
  head,
  price,
  onPartTouched,
}: {
  form: Form;
  onChange: <K extends keyof Form>(key: K, value: Form[K]) => void;
  /** 種類を手で選んだ。新規の欄の親は、以後トナーID・トナー名から推し量らない */
  onPartTouched?: () => void;
  printers: Printer[];
  /** 紐づいている無効の台（編集の小窓だけ）。`Editing.retired` を参照 */
  retired?: Printer[];
  /** 純正品の選択肢。有効な純正に、選んである無効の純正を足したもの */
  genuines: GenuineChoice[];
  nameHints: string[];
  /** 先頭の欄。新規はトナーID の入力、編集は変えられない ID の表示 */
  head: ReactNode;
  /**
   * 印刷可能枚数の後ろに入れる欄。新規だけ初回の価格を入れる
   * （編集では価格を上書きさせず、小窓の中に改定の欄を別に置く）
   */
  price?: ReactNode;
}) {
  // 新規の欄と小窓が同時に並ぶので、datalist の id を欄ごとに分ける
  const namesId = useId();
  const colorsId = useId();

  return (
    <>
      {head}

      <label>
        <span>トナー名</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="トナーカートリッジ P500H"
          list={namesId}
        />
        {/* 候補は縛りではない。一覧に無い名前もそのまま打てる */}
        <datalist id={namesId}>
          {nameHints.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      </label>

      <label>
        <span>色</span>
        <input
          type="text"
          list={colorsId}
          value={form.color}
          onChange={(e) => onChange('color', e.target.value)}
          placeholder="ブラック"
        />
        <datalist id={colorsId}>
          {COLORS.map((color) => (
            <option key={color} value={color} />
          ))}
        </datalist>
      </label>

      <label>
        <span>種類</span>
        <select
          value={form.part}
          onChange={(e) => {
            onPartTouched?.();
            onChange('part', e.target.value as SupplyPart);
          }}
          title={`${PART_HINTS[form.part]}。トナー価格比較は種類と色が同じものどうしで比べます（黒のドラムを黒のトナーと比べないため）`}
        >
          {PART_ORDER.map((part) => (
            <option key={part} value={part} title={PART_HINTS[part]}>
              {PART_LABELS[part]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>この本数以下で警告</span>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={form.alertThreshold}
          onChange={(e) => onChange('alertThreshold', e.target.value)}
          placeholder="空欄なら警告しない"
        />
      </label>

      <label>
        <span>印刷可能枚数（1 本あたり）</span>
        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={form.yieldPages}
          onChange={(e) => onChange('yieldPages', e.target.value)}
          placeholder="カタログ値（A4・5%）"
        />
      </label>

      {price}

      <label className="tn-check">
        <input
          type="checkbox"
          checked={form.recycled}
          onChange={(e) => onChange('recycled', e.target.checked)}
        />
        <span>リサイクル品・互換品</span>
      </label>

      {/*
        純正とリサイクル品の組は、リサイクル品の側から純正を 1 つ選んで作る。
        純正の側には何も持たせない（両側から結ぶと食い違いが起きるため）
      */}
      {form.recycled && (
        <label>
          <span>純正品（価格を比べる相手）</span>
          <select value={form.genuineId} onChange={(e) => onChange('genuineId', e.target.value)}>
            <option value="">選ばない</option>
            {genuines.map(({ toner, retired: gone }) => (
              <option key={toner.id} value={toner.id}>
                {genuineLabel(toner)}
                {gone ? '（無効）' : ''}
              </option>
            ))}
          </select>
          <span className="tn-field-note">
            選ぶと、トナー価格比較で純正と並べて比べられます
          </span>
        </label>
      )}

      <label className="tn-check" title="外すと、受付・注文の候補やトナー個数状況などに出なくなります">
        <input
          type="checkbox"
          checked={!form.hidden}
          onChange={(e) => onChange('hidden', !e.target.checked)}
        />
        <span>他の画面に表示する</span>
      </label>

      <PrinterPicker
        printers={printers}
        retired={retired}
        selected={form.printerAssetIds}
        onChange={(ids) => onChange('printerAssetIds', ids)}
      />
    </>
  );
}

export default function TonerScreen() {
  /** 新規登録の欄。**新規専用。** 登録済みの品番を直すのは下の小窓 */
  const [form, setForm] = useState<Form>(emptyForm);
  /** 編集の小窓。null なら閉じている。新規の欄とは別に下書きを持つ */
  const [editing, setEditing] = useState<Editing | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  /** 小窓を閉じずに済む操作（価格の改定）の結果 */
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [toners, setToners] = useState<SavedToner[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'id',
    dir: 'asc',
  });
  /** 一覧を絞る文字。**取ってある品番をこの場で絞るだけで、API は叩かない** */
  const [query, setQuery] = useState('');
  /** 無効にした品番の別枠を絞る文字。上の一覧とは別に持つ（表が別なので） */
  const [disabledQuery, setDisabledQuery] = useState('');
  /** 一覧を「他の画面に出すか」で絞る。チェックを外した品番だけを見直せるように */
  const [shownFilter, setShownFilter] = useState<'all' | 'shown' | 'hidden'>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [tonerRows, printerRows] = await Promise.all([
        // この画面だけは無効にした品番も要る。下の別枠に出して元に戻せるようにするため
        request<SavedToner[]>('/toners?includeDisabled=1'),
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

  /** 新規の欄の種類を手で選んだか。選ぶまではトナーID・トナー名から推し量って入れる */
  const [partTouched, setPartTouched] = useState(false);

  /**
   * 新規の欄の書き換え。**種類を手で選ぶまでは、トナーID・トナー名を打つたびに種類を選び直す**
   * （「ドラムユニット …」と打てばドラムに）。編集の小窓は保存済みの値を動かさない（setDraft）
   */
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (!partTouched && (key === 'id' || key === 'name')) {
        next.part = guessPart(next.id, next.name || null);
      }
      return next;
    });

  const setDraft = <K extends keyof Form>(key: K, value: Form[K]) =>
    setEditing((prev) => prev && { ...prev, form: { ...prev.form, [key]: value } });

  /** 有効な品番だけ。無効にしたものは下の別枠に分ける */
  const active = useMemo(
    () => toners.filter((toner) => toner.disabledAt === null),
    [toners],
  );

  /** 無効にした品番。止めた日の新しい順に並べる（直前に間違えた分が上に来る） */
  const disabled = useMemo(
    () =>
      toners
        .filter((toner) => toner.disabledAt !== null)
        .sort((a, b) => (a.disabledAt! < b.disabledAt! ? 1 : -1)),
    [toners],
  );

  /** 別枠に出す無効の品番。並びはそのままで、探す欄のぶんだけ絞る */
  const shownDisabled = useMemo(() => {
    const words = searchWords(disabledQuery);
    return disabled.filter((toner) =>
      hits(
        [
          toner.id,
          toner.name,
          toner.color,
          ...toner.printers.flatMap((printer) => [
            printer.department,
            printer.no,
            printer.ipAddress,
            printer.maker,
            printer.model,
          ]),
        ],
        words,
      ),
    );
  }, [disabled, disabledQuery]);

  /**
   * トナー名の候補。**無効にした品番のぶんも混ぜる。**
   * 「トナーカートリッジ 054H（MF644Cdw）」のような定型が多く、
   * 同じ機種の色違いを続けて登録するときに打ち直しが減る。
   *
   * **色は候補を増やさない。**あちらは `COLORS` の固定 8 件のままにする
   */
  const nameHints = useMemo(
    () => suggestions(toners.map((toner) => toner.name)),
    [toners],
  );

  /**
   * 新規の欄の純正品の選択肢。**有効な純正だけ。**
   * 組の軸は純正なので、リサイクル品は並べない（API も断る）
   */
  const genuineChoices = useMemo<GenuineChoice[]>(
    () =>
      active
        .filter((toner) => !toner.recycled)
        .sort((a, b) => a.id.localeCompare(b.id, 'ja', { numeric: true }))
        .map((toner) => ({ toner, retired: false })),
    [active],
  );

  /** 小窓の純正品の選択肢。自分は外し、選んである無効の純正は開いた時点の分を足す */
  const editGenuineChoices = useMemo<GenuineChoice[]>(() => {
    if (editing === null) return [];
    const choices = genuineChoices.filter(({ toner }) => toner.id !== editing.id);
    return editing.retiredGenuine
      ? [...choices, { toner: editing.retiredGenuine, retired: true }]
      : choices;
  }, [editing, genuineChoices]);

  /** 凡例に出す件数。一覧の色分けと同じ判定を使う。無効の品番は数えない */
  const counts = useMemo(
    () => ({
      out: active.filter((toner) => stockState(toner) === 'out').length,
      low: active.filter((toner) => stockState(toner) === 'low').length,
      hidden: active.filter((toner) => toner.hidden).length,
    }),
    [active],
  );

  /** 見出しを押した列で並べ替えた一覧 */
  const shown = useMemo(() => {
    const words = searchWords(query);
    // 対応プリンターでも引けるようにする（「予約外来のトナー」を探せるように）
    const found = active.filter((toner) =>
      (shownFilter === 'all' || toner.hidden === (shownFilter === 'hidden')) &&
      hits(
        [
          toner.id,
          toner.name,
          toner.color,
          PART_LABELS[toner.part],
          // 組の相手の品番でも引ける（「P500H」で純正とリサイクル品の両方が出る）
          toner.genuineId,
          ...toner.alternativeIds,
          ...toner.printers.flatMap((printer) => [
            printer.department,
            printer.no,
            printer.ipAddress,
            printer.maker,
            printer.model,
          ]),
        ],
        words,
      ),
    );

    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      found,
      (toner) => pick(toner, sort.key),
      column?.kind ?? 'text',
      sort.dir,
      // 値が並んだときは API が返した順（トナー名 → 品番）で安定させる
      (toner) => active.indexOf(toner),
    );
  }, [active, sort, query, shownFilter]);

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
          part: form.part,
          recycled: form.recycled,
          genuineId: genuineToSend(form),
          hidden: form.hidden,
          alertThreshold: toCount(form.alertThreshold),
          yieldPages: toCount(form.yieldPages),
          printerAssetIds: form.printerAssetIds,
          price: form.price.trim() === '' ? null : Number(form.price),
          effectiveFrom: form.price.trim() === '' ? null : form.effectiveFrom,
        }),
      });
      setNotice(`${saved.name ?? saved.id} を登録しました`);
      // 上の欄は新規専用。空に戻して、続けて押しても二重に登録しないようにする
      setForm(emptyForm());
      setPartTouched(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 小窓の保存。名前・色・リサイクル区分・純正品・他の画面に出すか・対応機器。
   * **価格はここでは変えない**（改定の欄で足す）。
   * 失敗したら小窓を開いたまま、中に文面を出す（閉じると直した値が消える）
   */
  const update = async () => {
    if (editing === null) return;
    const { id, form: draft } = editing;
    setBusy(true);
    setEditError(null);
    setEditNotice(null);
    try {
      const saved = await request<SavedToner>(`/toners/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: orNull(draft.name),
          color: orNull(draft.color),
          part: draft.part,
          recycled: draft.recycled,
          genuineId: genuineToSend(draft),
          hidden: draft.hidden,
          alertThreshold: toCount(draft.alertThreshold),
          yieldPages: toCount(draft.yieldPages),
          printerAssetIds: draft.printerAssetIds,
        }),
      });
      setNotice(`${saved.name ?? saved.id} を更新しました`);
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
   * 価格改定。過去の価格は残したまま、適用開始日を持つ行を足す
   * （同じ適用開始日なら API がその日の価格を上書きする。打ち間違いの直し）。
   *
   * **押した時点で保存する。** 小窓は開いたまま履歴だけ取り直し、
   * 他の欄は読み直さない（書きかけの修正を消さないため）
   */
  const addPrice = async () => {
    if (editing === null) return;
    const { id, form: draft, priceNote } = editing;
    if (draft.price.trim() === '') {
      setEditError('価格を入力してください');
      return;
    }

    setBusy(true);
    setEditError(null);
    setEditNotice(null);
    try {
      await request<SavedToner>(`/toners/${encodeURIComponent(id)}/prices`, {
        method: 'POST',
        body: JSON.stringify({
          price: Number(draft.price),
          effectiveFrom: draft.effectiveFrom,
          note: orNull(priceNote),
        }),
      });
      const history = await request<PriceRow[]>(`/toners/${encodeURIComponent(id)}/prices`);
      // 覚書はその改定の分だけ。次の改定に同じ文が付かないよう空へ戻す
      setEditing((prev) =>
        prev && prev.id === id ? { ...prev, prices: history, priceNote: '' } : prev,
      );
      setEditNotice(
        `${draft.effectiveFrom} から ${num.format(Number(draft.price))} 円（税別）にしました`,
      );
      await load();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 一覧の「編集」。最新の値と価格の履歴を読んで小窓を開く。上の新規の欄には触らない。
   * 改定の欄は今の価格と適用開始日で埋めておく（そのまま直せば打ち間違いの訂正になる）
   */
  const edit = async (id: string) => {
    setError(null);
    setNotice(null);
    try {
      const [toner, history] = await Promise.all([
        request<SavedToner>(`/toners/${encodeURIComponent(id)}`),
        request<PriceRow[]>(`/toners/${encodeURIComponent(id)}/prices`),
      ]);

      setEditing({
        id: toner.id,
        name: toner.name,
        form: {
          id: toner.id,
          name: toner.name ?? '',
          color: toner.color ?? '',
          part: toner.part,
          recycled: toner.recycled,
          genuineId: toner.genuineId ?? '',
          hidden: toner.hidden,
          alertThreshold:
            toner.alertThreshold === null ? '' : String(toner.alertThreshold),
          yieldPages: toner.yieldPages === null ? '' : String(toner.yieldPages),
          price: toner.price === null ? '' : String(toner.price),
          effectiveFrom: toner.priceFrom ?? todayIso(),
          printerAssetIds: toner.printers.map((printer) => printer.id),
        },
        prices: history,
        retired: toner.printers.filter(
          (linked) => !printers.some((printer) => printer.id === linked.id),
        ),
        retiredGenuine:
          toners.find(
            (candidate) =>
              candidate.id === toner.genuineId && candidate.disabledAt !== null,
          ) ?? null,
        priceNote: '',
      });
      setEditError(null);
      setEditNotice(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  /**
   * 使わなくなった品番を無効にする／元に戻す。**削除は用意していない。**
   *
   * 消すと受付の履歴・注文・請求書の明細から相手が居なくなり、
   * 価格の履歴も道連れで消える。消さずに下の別枠へ移し、いつでも戻せるようにする。
   *
   * 無効にすると受付の検索・注文・請求書の候補からも外れる
   * （API が既定で有効な品番だけを返すため）。
   * 在庫が残ったまま無効にしてもよいが、廃棄したくなったら先に元に戻す
   */
  const setDisabled = async (toner: SavedToner, disable: boolean) => {
    const label = toner.name ?? toner.id;

    if (disable) {
      const warning =
        toner.stock > 0
          ? `\n\nこの品番はまだ在庫が ${toner.stock} 本あります。` +
            '廃棄や持ち出しで処理したい場合は、先に元に戻してから受付で操作してください。'
          : '';
      if (
        !window.confirm(
          `${label}（${toner.id}）を無効にします。\n\n` +
            '一覧の下の「無効にした品番」へ移り、受付・注文・請求書の候補からも外れます。\n' +
            '受付の履歴・注文・価格の履歴は消えません。いつでも元に戻せます。' +
            warning,
        )
      ) {
        return;
      }
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<SavedToner>(
        `/toners/${encodeURIComponent(toner.id)}/${disable ? 'disable' : 'enable'}`,
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
   * 一覧の「表示」。**押した時点で保存する**（他の列は送らない）。
   *
   * 外した品番は受付・注文・請求書の候補、トナー個数状況、トナー入出状況、
   * 運用コストから外れる。トナー登録とトナー価格比較には残る。
   * 価格を比べるためだけに登録した純正を、日々の画面に出さないための印
   */
  const toggleHidden = async (toner: SavedToner) => {
    const label = toner.name ?? toner.id;
    const hide = !toner.hidden;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request<SavedToner>(`/toners/${encodeURIComponent(toner.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ hidden: hide }),
      });
      setNotice(
        hide
          ? `${label} を他の画面に出さないようにしました` +
              '（受付・注文の候補、トナー個数状況、トナー入出状況などから外れます。' +
              'トナー登録とトナー価格比較には残ります）'
          : `${label} を他の画面にも出すようにしました`,
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * 無効にした品番を完全に消す。**登録し間違えたものの後始末。**
   *
   * 普段は無効のままにしておけばよく、これは戻す必要が無いと分かっている行だけ。
   * 元に戻せないので、何が一緒に消えるかを数えて確認の文面に出す。
   * 受付の履歴・注文・請求書から指されているものは API 側が断る
   */
  const remove = async (toner: SavedToner) => {
    const label = toner.name ?? toner.id;
    const alsoGone = [
      toner.printers.length > 0 ? `対応プリンター ${toner.printers.length} 台の紐づけ` : null,
      toner.priceCount > 0 ? `価格の履歴 ${toner.priceCount} 件` : null,
      toner.alternativeIds.length > 0
        ? `この品番を純正に選んでいるリサイクル品 ${toner.alternativeIds.length} 件の組`
        : null,
    ].filter(Boolean);

    if (
      !window.confirm(
        `${label}（${toner.id}）を完全に削除します。\n\n` +
          'この操作は元に戻せません。\n' +
          (alsoGone.length > 0 ? `一緒に消えるもの: ${alsoGone.join('・')}\n` : '') +
          '\n受付の履歴・注文・請求書から使われている品番は削除できません。\n' +
          '記録を残したまま一覧から外しておきたいだけなら、無効のままにしておいてください。',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await request(`/toners/${encodeURIComponent(toner.id)}`, { method: 'DELETE' });
      setNotice(`${label} を削除しました`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setForm(emptyForm());
    setPartTouched(false);
    setError(null);
    setNotice(null);
  };

  /**
   * 小窓の価格の履歴で「現在」を付ける行。**適用開始日が今日以前の最初の行**
   * （API の currentPrice と同じ決め方。一覧の価格の列もこれ）。
   * 先の日付で改定を入れてあると、先頭の行はまだ効いていない
   */
  const currentPriceId =
    editing?.prices.find((row) => row.effectiveFrom <= todayIso())?.id ?? null;

  return (
    <div className="tn">
      <header className="tn-head">
        <h1>トナー登録</h1>
        <p>
          トナーの品番ごとに、対応する機器・色・リサイクル品かどうか・税別価格を登録します。
          対応する機器は端末情報の台帳から選ぶので、1 種類のトナーを複数台で共用していても
          登録は 1 件で済みます。価格は上書きせず履歴として積み、統計はその日に有効だった
          価格で計算できます。リサイクル品は「純正品」を選んでおくと、トナー価格比較で
          純正と並べて比べられます。
        </p>
      </header>

      {/* 新規登録専用。登録済みの品番は一覧の「編集」から小窓で直す */}
      <section className="tn-form tn-fields">
        <TonerFields
          form={form}
          onChange={set}
          onPartTouched={() => setPartTouched(true)}
          printers={printers}
          genuines={genuineChoices}
          nameHints={nameHints}
          head={
            <label>
              <span>トナーID（品番・バーコード）</span>
              <input
                type="text"
                value={form.id}
                onChange={(e) => set('id', e.target.value)}
                placeholder="P500H"
              />
            </label>
          }
          price={
            <>
              <label>
                <span>価格（税別・円）</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="7200"
                />
              </label>

              <label>
                <span>この価格の適用開始日</span>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => set('effectiveFrom', e.target.value)}
                />
              </label>
            </>
          }
        />

        <div className="tn-actions">
          <button onClick={() => void create()} disabled={busy || !form.id.trim()}>
            登録
          </button>
          <button className="tn-sub" onClick={clear} disabled={busy} type="button">
            クリア
          </button>
        </div>
      </section>

      {error && <p className="tn-msg tn-msg-error">{error}</p>}
      {notice && <p className="tn-msg tn-msg-ok">{notice}</p>}

      <section className="tn-list">
        <h2>
          {/* 数えるのは下に並べる有効な品番だけ。無効の品番は別枠で数える */}
          登録したトナー（{active.length} 件）
          <CsvButton
            name="トナー登録"
            header={CSV_COLUMNS.map((col) => col.label)}
            rows={() => shown.map((toner) => CSV_COLUMNS.map((col) => col.value(toner)))}
            count={shown.length}
          />
        </h2>
        <p className="tn-hint">
          価格は今日の時点で有効なものです。「編集」を押すと、価格の履歴を見て改定できます。
        </p>

        <p className="tn-legend">
          <span className="tn-swatch tn-swatch-out" aria-hidden />
          在庫なし（{counts.out} 件）
          <span className="tn-swatch tn-swatch-low" aria-hidden />
          警告本数以下（{counts.low} 件）
          <span className="tn-muted">
            警告する本数は品番ごとに設定します。空欄なら在庫 0 のときだけ赤にします。
          </span>
        </p>
        <p className="tn-hint">
          <strong>「表示」の印を外すと、その品番は他の画面に出なくなります</strong>
          （押した時点で保存します。いま {counts.hidden} 件）。外れるのは受付・注文・請求書の候補、
          トナー個数状況、トナー入出状況、運用コストで、トナー登録とトナー価格比較には残ります。
          棚卸しには在庫が残っている拠点でだけ出ます。使わなくなった品番を止めるときは、これまでどおり「無効」です。
          <strong>使っていないトナーの値段を比べたいだけなら、ここではなく「トナー情報登録」に入れてください</strong>
          （販売店・購入形態ごとに入れられ、トナー価格比較にだけ出ます）。
        </p>

        <div className="sbx-row">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="品番・トナー名・色・対応プリンター"
            count={shown.length}
            total={active.length}
          />
          <label className="tn-shown-filter">
            <span>表示</span>
            <select
              value={shownFilter}
              onChange={(e) => setShownFilter(e.target.value as typeof shownFilter)}
            >
              <option value="all">すべて</option>
              <option value="shown">他の画面に出す品番</option>
              <option value="hidden">出さない品番（{counts.hidden} 件）</option>
            </select>
          </label>
        </div>

        {toners.length === 0 ? (
          <p className="tn-empty">まだ登録がありません。上の欄を入力して登録してください。</p>
        ) : shown.length === 0 && (query.trim() !== '' || shownFilter !== 'all') ? (
          <p className="tn-empty">
            {query.trim() !== '' ? `「${query}」に` : '絞り込みに'}
            当てはまる品番がありません（登録は {active.length} 件）。
          </p>
        ) : (
          <TableBox className="tn-table-wrap" memoryKey="toners.list">
            <table className="tn-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={col.numeric ? 'tn-num' : undefined}
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
                        <span className="tn-arrow" aria-hidden>
                          {sort.key === col.key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="tn-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((toner) => (
                  <tr
                    key={toner.id}
                    className={
                      [
                        toner.id === editing?.id ? 'tn-row-on' : '',
                        toner.hidden ? 'tn-row-hidden' : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                  >
                    <td className="tn-show-cell">
                      <input
                        type="checkbox"
                        checked={!toner.hidden}
                        onChange={() => void toggleHidden(toner)}
                        disabled={busy}
                        aria-label={`${toner.id} を他の画面に表示する`}
                        title={
                          toner.hidden
                            ? '他の画面に出していません。印を付けると受付・注文の候補などに出ます'
                            : '外すと、受付・注文の候補やトナー個数状況などに出なくなります（押した時点で保存）'
                        }
                      />
                    </td>
                    <td className="tn-mono">{toner.id}</td>
                    <td>{toner.name ?? '—'}</td>
                    <td>{toner.color ?? '—'}</td>
                    <td className={toner.part === 'TONER' ? undefined : 'tn-part'}>
                      {PART_LABELS[toner.part]}
                    </td>
                    <td>{toner.recycled ? '○' : '—'}</td>
                    <td className="tn-pair">
                      <PairCell toner={toner} toners={toners} />
                    </td>
                    <td className="tn-num">
                      {toner.price === null ? '—' : `${num.format(toner.price)} 円`}
                    </td>
                    <td className="tn-num">
                      {toner.yieldPages === null ? (
                        <span className="tn-muted">—</span>
                      ) : (
                        `${num.format(toner.yieldPages)} 枚`
                      )}
                    </td>
                    <td
                      className={toner.costPerPage === null ? 'tn-num tn-muted' : 'tn-num tn-cpp'}
                      title={
                        toner.costPerPage === null
                          ? '価格と印刷可能枚数の両方が入っている品番だけ出します'
                          : `${num.format(toner.price ?? 0)} 円 ÷ ${num.format(
                              toner.yieldPages ?? 0,
                            )} 枚（カタログ値・A4 5% 基準）`
                      }
                    >
                      {toner.costPerPage === null ? '—' : `${toner.costPerPage.toFixed(2)} 円`}
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
                    <td className="tn-num">
                      {toner.alertThreshold === null ? (
                        <span className="tn-muted">—</span>
                      ) : (
                        `${toner.alertThreshold} 本以下`
                      )}
                    </td>
                    <td
                      className={
                        stockState(toner) === 'out'
                          ? 'tn-num tn-stock-out'
                          : stockState(toner) === 'low'
                            ? 'tn-num tn-stock-low'
                            : 'tn-num'
                      }
                      title={
                        stockState(toner) === 'out'
                          ? '在庫がありません'
                          : stockState(toner) === 'low'
                            ? `警告する本数（${toner.alertThreshold} 本）以下です`
                            : undefined
                      }
                    >
                      {toner.stock}
                    </td>
                    <td className="tn-ops">
                      <button onClick={() => void edit(toner.id)} disabled={busy} type="button">
                        編集
                      </button>
                      <button
                        className="tn-danger"
                        onClick={() => void setDisabled(toner, true)}
                        disabled={busy}
                        type="button"
                        title="一覧の下の「無効にした品番」へ移します。記録は消えません"
                      >
                        無効
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableBox>
        )}
      </section>

      {disabled.length > 0 && (
        <section className="tn-list tn-disabled">
          <h2>
            無効にした品番（{disabled.length} 件）
            <CsvButton
              name="トナー登録_無効"
              header={DISABLED_CSV_COLUMNS.map((col) => col.label)}
              rows={() =>
                shownDisabled.map((toner) =>
                  DISABLED_CSV_COLUMNS.map((col) => col.value(toner)),
                )
              }
              count={shownDisabled.length}
            />
          </h2>
          <p className="tn-hint">
            使わなくなった品番です。<strong>受付の履歴・注文・価格の履歴は消えていません。</strong>
            受付の検索・注文・請求書の候補からは外れています。
            「元に戻す」を押せば、そのまま元の一覧に戻ります。
            在庫が残っている品番を廃棄したいときは、先に元に戻してから受付で処理してください。
            <br />
            登録し間違えた品番は「削除」で完全に消せます。<strong>元に戻せません。</strong>
            受付の履歴・注文・請求書から使われている品番や、在庫が残っている品番は削除できません
            （そのまま無効にしておけば記録が残ります）。
          </p>

          <div className="sbx-row">
            <SearchBox
              value={disabledQuery}
              onChange={setDisabledQuery}
              label="探す（無効にした品番）"
              placeholder="品番・トナー名・色・対応プリンター"
              count={shownDisabled.length}
              total={disabled.length}
            />
          </div>

          {shownDisabled.length === 0 ? (
            <p className="tn-empty">
              「{disabledQuery}」に当てはまる品番がありません（無効は {disabled.length} 件）。
            </p>
          ) : (
          <TableBox className="tn-table-wrap" memoryKey="toners.disabled">
            <table className="tn-table">
              <thead>
                <tr>
                  <th className="tn-plain">トナーID</th>
                  <th className="tn-plain">トナー名</th>
                  <th className="tn-plain">色</th>
                  <th className="tn-plain tn-num">在庫</th>
                  <th className="tn-plain">対応プリンター</th>
                  <th className="tn-plain">無効にした日時</th>
                  <th className="tn-plain">操作</th>
                </tr>
              </thead>
              <tbody>
                {shownDisabled.map((toner) => (
                  <tr key={toner.id}>
                    <td className="tn-mono">{toner.id}</td>
                    <td>{toner.name ?? '—'}</td>
                    <td>{toner.color ?? '—'}</td>
                    <td className={toner.stock > 0 ? 'tn-num tn-stock-left' : 'tn-num'}>
                      {toner.stock}
                    </td>
                    <td title={toner.printers.map(printerLabel).join('\n')}>
                      {toner.printers.length === 0
                        ? '—'
                        : `${toner.printers.length} 台`}
                    </td>
                    <td>
                      {toner.disabledAt
                        ? new Date(toner.disabledAt).toLocaleString('ja-JP')
                        : '—'}
                    </td>
                    <td className="tn-ops">
                      <button
                        onClick={() => void setDisabled(toner, false)}
                        disabled={busy}
                        type="button"
                        title="元の一覧に戻します"
                      >
                        元に戻す
                      </button>
                      <button
                        className="tn-danger"
                        onClick={() => void remove(toner)}
                        disabled={busy}
                        type="button"
                        title="完全に削除します。元に戻せません。受付の履歴・注文・請求書から使われている品番は削除できません"
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
          title={`${editing.name ?? editing.id} を編集`}
          onClose={() => setEditing(null)}
          busy={busy}
          error={editError}
          notice={editNotice}
          width={1000}
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
              <button type="button" onClick={() => void update()} disabled={busy}>
                {busy ? '保存中…' : '更新'}
              </button>
            </>
          }
        >
          <div className="tn-fields">
            <TonerFields
              form={editing.form}
              onChange={setDraft}
              printers={printers}
              retired={editing.retired}
              genuines={editGenuineChoices}
              nameHints={nameHints}
              head={
                <label>
                  <span>トナーID（品番・バーコード）</span>
                  <input
                    type="text"
                    value={editing.id}
                    disabled
                    title="品番は変えられません。間違えて登録したときは、無効にしてから登録し直してください"
                  />
                </label>
              }
            />
          </div>

          <section className="md-section">
            <h3>価格の改定と履歴（{editing.prices.length} 件）</h3>
            <p className="md-section-hint">
              <strong>「この価格で改定」を押した時点で保存します</strong>
              （下の「更新」では価格は変わりません）。過去の価格は残したまま、
              適用開始日を持つ行を足します。今の価格と同じ適用開始日のまま直すと、
              その日の価格を置き換えます（打ち間違いの直し）。
            </p>

            <div className="tn-fields">
              <label>
                <span>価格（税別・円）</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={editing.form.price}
                  onChange={(e) => setDraft('price', e.target.value)}
                  placeholder="7200"
                />
              </label>

              <label>
                <span>この価格の適用開始日</span>
                <input
                  type="date"
                  value={editing.form.effectiveFrom}
                  onChange={(e) => setDraft('effectiveFrom', e.target.value)}
                />
              </label>

              <label>
                <span>覚書（任意）</span>
                <input
                  type="text"
                  value={editing.priceNote}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, priceNote: e.target.value })
                  }
                  placeholder="値上げの理由・見積の番号など"
                  maxLength={200}
                />
              </label>

              <div className="tn-price-go">
                <button
                  type="button"
                  onClick={() => void addPrice()}
                  disabled={busy || editing.form.price.trim() === ''}
                >
                  この価格で改定
                </button>
              </div>
            </div>

            {editing.prices.length === 0 ? (
              <p className="tn-muted tn-prices-empty">価格はまだ登録されていません。</p>
            ) : (
              <ol className="tn-prices" aria-label="価格の履歴">
                {editing.prices.map((row) => (
                  <li key={row.id}>
                    <span className="tn-from">{row.effectiveFrom} 〜</span>
                    <span>{num.format(row.price)} 円</span>
                    {row.id === currentPriceId && <span className="tn-now">現在</span>}
                    {row.effectiveFrom > todayIso() && <span className="tn-soon">予定</span>}
                    {row.note && <span className="tn-note">{row.note}</span>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </Modal>
      )}
    </div>
  );
}
