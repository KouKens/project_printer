import { useCallback, useEffect, useMemo, useState } from 'react';
import { MANUAL_MAINT, maintStatus } from '../lib/maint';

import { num, orNull } from '../lib/format';
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
   * 持っている会社。**必須。**
   * トナーの在庫と受け払いをこの単位で数えるので、機器には必ず持たせる。
   * 入力欄の値なので、他の欄と同じく文字列で持つ
   */
  companyId: string;
  department: string;
  no: string;
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
  /** 持っている会社。在庫と受け払いを分ける単位 */
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

const EMPTY: Asset = {
  companyId: '',
  department: '',
  no: '',
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
  // 全社をまとめて出す画面なので、どこの機器かが分かるよう会社を先頭に置く
  { key: 'company', label: '会社', kind: 'text' },
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

function toPayload(asset: Asset) {
  return {
    // 会社は必須。空のまま送ると API が 400 で断る
    companyId: asset.companyId === '' ? null : Number(asset.companyId),
    department: orNull(asset.department),
    no: orNull(asset.no),
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

function toForm(saved: SavedAsset): Asset {
  return {
    companyId: String(saved.companyId),
    department: saved.department ?? '',
    no: saved.no ?? '',
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

/** 台帳の値と実機の値を突き合わせる。どちらか空なら判定しない */
function compare(input: string, actual: string | null): 'same' | 'diff' | null {
  const a = input.trim().toLowerCase();
  const b = (actual ?? '').trim().toLowerCase();
  if (!a || !b) return null;
  return a === b ? 'same' : 'diff';
}

export default function AssetScreen() {
  const { companies, companyId: selectedCompanyId } = useCompany();
  const [asset, setAsset] = useState<Asset>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedAsset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

  const sorted = useMemo(() => {
    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(
      active,
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
  }, [active, sort]);

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

  const edit = (row: SavedAsset) => {
    setAsset(toForm(row));
    setEditingId(row.id);
    setProbe(null);
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
      // 無効にした台を編集中だったなら、入力欄も空に戻す
      if (disable && editingId === row.id) {
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

  /** 新規入力の初期値。会社だけは右上で選んでいるものを入れておく */
  const blank = useCallback(
    (): Asset => ({
      ...EMPTY,
      companyId: selectedCompanyId === null ? '' : String(selectedCompanyId),
    }),
    [selectedCompanyId],
  );

  /*
   * 会社の一覧が届く前に画面が立ち上がるので、届いてから初期値を入れる。
   * 入力の途中や編集中は触らない（選び直したものを勝手に戻さないため）
   */
  useEffect(() => {
    if (editingId !== null || selectedCompanyId === null) return;
    setAsset((prev) =>
      prev.companyId === '' ? { ...prev, companyId: String(selectedCompanyId) } : prev,
    );
  }, [selectedCompanyId, editingId]);

  const clear = () => {
    setAsset(blank());
    setEditingId(null);
    setProbe(null);
    setError(null);
    setNotice(null);
  };

  /** 入力中のメーカーに対する既定の業者。選択欄の見出しに出す */
  const defaultVendor =
    vendors.find((vendor) =>
      vendor.makers.some(
        (maker) =>
          maker.trim().toLowerCase() === asset.maker.trim().toLowerCase(),
      ),
    ) ?? null;

  const serialMatch = probe ? compare(asset.serialNumber, probe.serialNumber) : null;
  const makerMatch =
    probe && asset.maker.trim() && probe.model
      ? probe.model.toLowerCase().includes(asset.maker.trim().toLowerCase())
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
          そちらは表示のみで保存しません。
        </p>
      </header>

      <section className="as-form">
        <label>
          <span>部署</span>
          <input value={asset.department} onChange={(e) => set('department')(e.target.value)} />
        </label>

        {/*
          * 会社は必須。トナーの在庫と受け払いをこの単位で数えるため。
          * 新規のときは画面右上で選んでいる会社を初期値にする
          */}
        <label>
          <span>会社</span>
          <select
            value={asset.companyId}
            onChange={(e) => set('companyId')(e.target.value)}
            title="この機器を持っている会社です。トナーの在庫と受け払いがこの単位で分かれます"
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
          <span>購入金額（円）</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={asset.purchasePrice}
            onChange={(e) => set('purchasePrice')(e.target.value)}
            placeholder="0"
          />
        </label>

        <label>
          <span>契約 No.</span>
          <input value={asset.contractNo} onChange={(e) => set('contractNo')(e.target.value)} />
        </label>

        <label>
          <span>保守企業</span>
          <select
            value={asset.maintVendorId}
            onChange={(e) => set('maintVendorId')(e.target.value)}
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
          </div>
        )}
      </section>

      {disabled.length > 0 && (
        <section className="as-list as-disabled">
          <h2>無効にした機器（{disabled.length} 台）</h2>
          <p className="as-hint">
            使わなくなった機器です。<strong>記録は消えていません。</strong>
            プリンター状況・修理履歴・トナー登録・保守登録の一覧と選択肢からは外れています。
            「元に戻す」を押せば、そのまま元の一覧に戻ります。
            <br />
            登録し間違えた機器は「削除」で台帳から完全に消せます。<strong>元に戻せません。</strong>
            <strong>修理履歴がある機器は削除できません</strong>
            （消すと履歴まで道連れになるため。そのまま無効にしておけば履歴が残ります）。
          </p>

          <div className="as-table-wrap">
            <table className="as-table">
              <thead>
                <tr>
                  <th>会社</th>
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
                {disabled.map((row) => (
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
          </div>
        </section>
      )}
    </div>
  );
}
