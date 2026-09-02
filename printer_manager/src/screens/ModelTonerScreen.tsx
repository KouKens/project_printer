import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { num } from '../lib/format';
import { ipToNumber, nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import { request } from '../lib/request';
import './DataTable.css';
import './ModelTonerScreen.css';

/** そのトナーを使っているプリンター 1 台。同じトナーを使う別機種の台も含む */
type TonerPrinter = {
  id: number;
  /** プリンター名。台帳のメーカー＋型番 */
  name: string | null;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  /** 今見ている機種の台か。false なら同じトナーを使う別機種の台 */
  sameModel: boolean;
};

/** その機種で使うトナー 1 件 */
type ModelToner = {
  id: string;
  name: string | null;
  color: string | null;
  recycled: boolean;
  alertThreshold: number | null;
  /** 今日の時点で有効な税別価格 */
  price: number | null;
  stock: number;
  /** その機種のうち、このトナーを紐づけている台数 */
  assetCount: number;
  /** このトナーを使っている台。同じ機種のものが先に並ぶ */
  printers: TonerPrinter[];
};

/** 機種にぶら下がる台帳 1 台 */
type ModelAsset = {
  id: number;
  department: string | null;
  no: string | null;
  ipAddress: string | null;
  maker: string | null;
  model: string | null;
  serialNumber: string | null;
  tonerIds: string[];
};

/** 機種（メーカー＋型番）で 1 行 */
type Row = {
  key: string;
  maker: string | null;
  model: string | null;
  /** 台帳での実際の書き方。2 つ以上あれば表記が揺れている */
  spellings: string[];
  assetCount: number;
  linkedCount: number;
  /** 同じ機種なのに台ごとに紐づけが違う */
  mixed: boolean;
  /** その機種が使う色。K C M Y の順。分からないときは空 */
  colors: string[];
  /** 色の出どころ。実機の消耗品か、登録してあるトナーか */
  colorSource: 'printer' | 'toner' | null;
  /** 実機から消耗品を取得できている台数 */
  polled: number;
  toners: ModelToner[];
  assets: ModelAsset[];
};

type SortKey =
  | 'maker'
  | 'model'
  | 'colorKind'
  | 'assetCount'
  | 'linkedCount'
  | 'tonerCount'
  | 'minStock';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'maker', label: 'メーカー', kind: 'text' },
  { key: 'model', label: '型番', kind: 'text' },
  { key: 'colorKind', label: '色', kind: 'text' },
  { key: 'assetCount', label: '台数', kind: 'number', numeric: true },
  { key: 'linkedCount', label: 'トナー登録済', kind: 'number', numeric: true },
  { key: 'tonerCount', label: 'トナー種類', kind: 'number', numeric: true },
  { key: 'minStock', label: '最少在庫', kind: 'number', numeric: true },
];

/**
 * 色の点に使う色。台帳のトナーは色を日本語の名前で持つので、名前で引く。
 * 一覧に無い色（4色パックなど）は点を付けない
 */
const COLOR_HEX: Record<string, string> = {
  ブラック: '#2b3440',
  シアン: '#20a6c9',
  ライトシアン: '#7fcbdd',
  マゼンタ: '#c9407f',
  ライトマゼンタ: '#dd8fb2',
  イエロー: '#e0b420',
};

/** 機種の色。API は英名で返すので、見出しの点と頭文字はここで引く */
const INK: Record<string, { hex: string; initial: string; label: string }> = {
  black: { hex: '#2b3440', initial: 'K', label: 'ブラック' },
  cyan: { hex: '#20a6c9', initial: 'C', label: 'シアン' },
  magenta: { hex: '#c9407f', initial: 'M', label: 'マゼンタ' },
  yellow: { hex: '#e0b420', initial: 'Y', label: 'イエロー' },
};

/** モノクロ機かカラー機か。黒しか使わない機種をモノクロとする */
function colorKind(row: Row): 'mono' | 'color' | null {
  if (row.colors.length === 0) return null;
  return row.colors.some((color) => color !== 'black') ? 'color' : 'mono';
}

/** その機種が使う色。黒のみなら「モノクロ」、色があれば K C M Y を並べる */
function ColorCell({ row }: { row: Row }) {
  const kind = colorKind(row);
  if (kind === null) {
    return (
      <span className="dt-muted" title="実機から消耗品を取得できておらず、トナーの登録も無いため分かりません">
        不明
      </span>
    );
  }

  const source =
    row.colorSource === 'printer'
      ? `実機 ${row.polled} 台から取得した消耗品の色です`
      : '登録してあるトナーの色から判断しています（実機から取得できていません）';

  return (
    <span
      className="mt-ink"
      title={`${row.colors.map((c) => INK[c]?.label ?? c).join('・')}\n${source}`}
    >
      <span className="mt-ink-dots">
        {row.colors.map((color) => (
          <span className="mt-ink-chip" key={color}>
            <span className="dt-dot" style={{ background: INK[color]?.hex }} aria-hidden />
            {INK[color]?.initial ?? color}
          </span>
        ))}
      </span>
      <span className={kind === 'mono' ? 'mt-ink-mono' : 'mt-ink-color'}>
        {kind === 'mono' ? 'モノクロ' : 'カラー'}
      </span>
      {row.colorSource === 'toner' && (
        <span className="dt-muted mt-ink-guess" aria-hidden>
          ※
        </span>
      )}
    </span>
  );
}

/** その機種のトナーで最も少ない在庫。トナーが無いときは null */
function minStock(row: Row): number | null {
  if (row.toners.length === 0) return null;
  return Math.min(...row.toners.map((toner) => toner.stock));
}

/** 在庫の状態。0 は切らしているので赤、警告本数以下はオレンジ */
function stockState(toner: ModelToner): 'out' | 'low' | null {
  if (toner.stock <= 0) return 'out';
  if (toner.alertThreshold !== null && toner.stock <= toner.alertThreshold) {
    return 'low';
  }
  return null;
}

/** 台の呼び名。IP 未入力の台帳もあるので No. で代替する */
const assetLabel = (asset: ModelAsset) =>
  [asset.no ? `No.${asset.no}` : null, asset.department, asset.ipAddress]
    .filter(Boolean)
    .join(' / ') || `ID ${asset.id}`;

/** 並べ替えの鍵。入れ子になっている値はここで平らにする */
function pick(row: Row, key: SortKey): unknown {
  switch (key) {
    case 'colorKind': {
      // カラー機を先に集めたいので、並べ替え用の頭に番号を付ける
      const kind = colorKind(row);
      return kind === null ? null : kind === 'color' ? '1カラー' : '2モノクロ';
    }
    case 'tonerCount':
      return row.toners.length;
    case 'minStock':
      return minStock(row);
    default:
      return row[key];
  }
}

/** その機種で使うトナー。色の点・在庫・台数を添えて並べる */
function TonerCell({ row }: { row: Row }) {
  if (row.toners.length === 0) {
    return <span className="dt-muted">未登録</span>;
  }

  return (
    <span className="mt-toners">
      {row.toners.map((toner) => {
        const state = stockState(toner);
        // 一部の台にしか付いていないトナーは、そのことが分かるように台数を添える
        const partial = toner.assetCount < row.assetCount;

        return (
          <span
            className="mt-toner"
            key={toner.id}
            title={[
              // 札には名前を出しているので、品番はここで拾えるようにする
              toner.id,
              toner.color ? `色: ${toner.color}` : null,
              toner.recycled ? 'リサイクル品・互換品' : '純正品',
              toner.price === null ? '価格未登録' : `${num.format(toner.price)} 円（税別）`,
              `在庫 ${toner.stock} 本`,
              partial
                ? `この機種 ${row.assetCount} 台のうち ${toner.assetCount} 台にだけ登録されています`
                : null,
            ]
              .filter(Boolean)
              .join('\n')}
          >
            <span
              className="dt-dot"
              style={{ background: COLOR_HEX[toner.color ?? ''] ?? '#c3ccd4' }}
              aria-hidden
            />
            {/* 名前で出す。品番より通じるため。名前が無いものだけ品番で代用する */}
            <span className="mt-toner-id">{toner.name ?? toner.id}</span>
            {/* 純正かリサイクル品か。発注先も価格も変わるので札で見えるようにする */}
            <span className={toner.recycled ? 'mt-kind mt-kind-recycled' : 'mt-kind mt-kind-genuine'}>
              {toner.recycled ? '再生' : '純正'}
            </span>
            <span
              className={
                state === 'out' ? 'dt-low' : state === 'low' ? 'dt-soon' : 'dt-muted'
              }
            >
              {toner.stock}
            </span>
            {partial && <span className="mt-partial">{toner.assetCount}/{row.assetCount}</span>}
          </span>
        );
      })}
    </span>
  );
}

/**
 * そのトナーを使っている台を、プリンター名でまとめる。
 * 7 台が同じ機種名を繰り返すと読めないので、名前は 1 回だけ出して台を並べる。
 * 同じ機種でも「この行の機種か、別機種か」は分けたいので鍵に入れる
 */
function byPrinterName(printers: TonerPrinter[]) {
  const groups = new Map<
    string,
    { name: string | null; sameModel: boolean; printers: TonerPrinter[] }
  >();

  for (const printer of printers) {
    // 区切りは \0。機種名に現れない文字なので、名前との境目が動かない
    const key = `${printer.sameModel}\0${printer.name ?? ''}`;
    const group = groups.get(key) ?? {
      name: printer.name,
      sameModel: printer.sameModel,
      printers: [],
    };
    group.printers.push(printer);
    groups.set(key, group);
  }

  return [...groups.values()];
}

/**
 * 使っている台がまったく同じ品番は 1 行にまとめる。
 * カラー機は 4 色と回収ボトルが同じ台に付くので、品番ごとに並べると
 * 同じ台の一覧が 5 回繰り返されて読めなくなる
 */
function bySamePrinters(toners: ModelToner[]) {
  const groups = new Map<string, { toners: ModelToner[]; printers: TonerPrinter[] }>();

  for (const toner of toners) {
    const key = toner.printers.map((printer) => printer.id).join(',');
    const group = groups.get(key) ?? { toners: [], printers: toner.printers };
    group.toners.push(toner);
    groups.set(key, group);
  }

  return [...groups.values()];
}

/** 台の呼び名。部署が未入力の台帳もあるので No. で代替する */
const shortLabel = (printer: TonerPrinter) =>
  printer.department ?? (printer.no ? `No.${printer.no}` : `ID ${printer.id}`);

/**
 * そのトナーを使っているプリンター。品番ごとに、名前・部署・IP を並べる。
 *
 * **この機種の台だけではない。** 同じトナーを別の機種でも使うことがあるので
 * （C310H は SP C320・C341・C342）、その台には「他機種」の印を付けて出す。
 * 品番を切らしたときにどこが止まるかが、行を開かなくても分かるようにする
 */
function UsedByCell({ row }: { row: Row }) {
  if (row.toners.length === 0) {
    return <span className="dt-muted">—</span>;
  }

  return (
    <div className="mt-uses">
      {bySamePrinters(row.toners).map((same) => (
        <div className="mt-use-row" key={same.toners.map((toner) => toner.id).join(',')}>
          <span className="mt-use-toner">
            {same.toners.map((toner) => (
              <span className="mt-toner-id" key={toner.id}>
                {toner.id}
              </span>
            ))}
          </span>
          <span className="mt-use-groups">
            {byPrinterName(same.printers).map((group) => (
              <span
                className={group.sameModel ? 'mt-use-group' : 'mt-use-group mt-use-other'}
                key={`${group.sameModel}-${group.name ?? ''}`}
              >
                <span className="mt-use-model">
                  {group.name ?? <span className="dt-muted">型番未設定</span>}
                  {!group.sameModel && (
                    <span
                      className="mt-badge mt-badge-other"
                      title="同じトナーを使う別の機種です。この品番を切らすとこの台も止まります"
                    >
                      他機種
                    </span>
                  )}
                </span>
                {group.printers.map((printer) => (
                  <span
                    className="mt-use"
                    key={printer.id}
                    title={[
                      group.name ?? '型番未設定',
                      printer.no ? `No.${printer.no}` : null,
                      printer.department,
                      printer.ipAddress ?? 'IP アドレス未入力',
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  >
                    <span className="mt-use-dept">{shortLabel(printer)}</span>
                    <span className="dt-mono mt-use-ip">
                      {printer.ipAddress ?? <span className="dt-muted">IP なし</span>}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 機種にぶら下がる台の一覧。行を開いたときだけ出す */
function AssetRows({ row }: { row: Row }) {
  const assets = [...row.assets].sort(
    (a, b) => ipToNumber(a.ipAddress ?? '') - ipToNumber(b.ipAddress ?? ''),
  );

  return (
    <table className="mt-assets">
      <thead>
        <tr>
          <th>部署</th>
          <th>No.</th>
          <th>IP アドレス</th>
          <th>シリアル</th>
          <th>台帳の型番</th>
          <th>この台のトナー</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr
            key={asset.id}
            className={asset.tonerIds.length === 0 ? 'mt-none' : undefined}
            title={assetLabel(asset)}
          >
            <td>{asset.department ?? '—'}</td>
            <td>{asset.no ? `No.${asset.no}` : '—'}</td>
            <td className="dt-mono">{asset.ipAddress ?? '—'}</td>
            <td className="dt-mono">{asset.serialNumber ?? '—'}</td>
            <td>{[asset.maker, asset.model].filter(Boolean).join(' ') || '—'}</td>
            <td>
              {asset.tonerIds.length === 0 ? (
                <span className="dt-muted">未登録</span>
              ) : (
                asset.tonerIds.join(', ')
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ModelTonerScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'maker',
    dir: 'asc',
  });
  const [filter, setFilter] = useState<'all' | 'linked' | 'none' | 'mixed'>('all');
  const [needle, setNeedle] = useState('');
  /** 開いている機種。台の一覧を出す */
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await request<Row[]>('/printer-assets/by-model'));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * トナー登録の画面で紐づけを直しても、この一覧は開いたときのまま。
   * 窓に戻ってきたときに読み直す（機器一覧と同じ扱い）
   */
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') void load();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);

  const counts = useMemo(
    () => ({
      models: rows.length,
      assets: rows.reduce((total, row) => total + row.assetCount, 0),
      none: rows.filter((row) => row.toners.length === 0).length,
      mixed: rows.filter((row) => row.mixed).length,
      // 紐づけが 1 件も無い台。機種ではなく台で数える
      unlinkedAssets: rows.reduce(
        (total, row) => total + (row.assetCount - row.linkedCount),
        0,
      ),
    }),
    [rows],
  );

  const shown = useMemo(() => {
    const text = needle.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (filter === 'linked' && row.toners.length === 0) return false;
      if (filter === 'none' && row.toners.length > 0) return false;
      if (filter === 'mixed' && !row.mixed) return false;
      if (!text) return true;

      // 機種名でも、そのトナーの品番・名前でも引けるようにする
      const haystack = [
        row.maker,
        row.model,
        ...row.spellings,
        ...row.toners.flatMap((toner) => [toner.id, toner.name, toner.color]),
        ...row.assets.flatMap((asset) => [asset.department, asset.no, asset.ipAddress]),
        // そのトナーを使う別機種の台も引けるようにする（この機種の台には含まれない）
        ...row.toners.flatMap((toner) =>
          toner.printers.flatMap((printer) => [
            printer.name,
            printer.department,
            printer.no,
            printer.ipAddress,
          ]),
        ),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.split(/\s+/).every((word) => haystack.includes(word));
    });

    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      filtered,
      (row) => pick(row, sort.key),
      column?.kind ?? 'text',
      sort.dir,
      // 鍵は文字列なので、並びを安定させるために出てきた順を使う
      (row) => rows.indexOf(row),
    );
  }, [rows, sort, filter, needle]);

  const cellOf = (row: Row, key: SortKey) => {
    switch (key) {
      case 'maker':
        return row.maker ?? <span className="dt-muted">未設定</span>;
      case 'model':
        return (
          <>
            {row.model ?? <span className="dt-muted">未設定</span>}
            {row.spellings.length > 1 && (
              <span
                className="mt-badge mt-badge-spell"
                title={`台帳にこの書き方が混じっています:\n${row.spellings.join('\n')}`}
              >
                表記ゆれ
              </span>
            )}
          </>
        );
      case 'colorKind':
        return <ColorCell row={row} />;
      case 'assetCount':
        return num.format(row.assetCount);
      case 'linkedCount':
        return (
          <span
            className={row.linkedCount < row.assetCount ? 'dt-soon' : undefined}
            title={
              row.linkedCount < row.assetCount
                ? `${row.assetCount - row.linkedCount} 台にトナーが登録されていません`
                : undefined
            }
          >
            {row.linkedCount} / {row.assetCount}
          </span>
        );
      case 'tonerCount':
        return row.toners.length === 0 ? (
          <span className="dt-muted">0</span>
        ) : (
          num.format(row.toners.length)
        );
      case 'minStock': {
        const stock = minStock(row);
        if (stock === null) return <span className="dt-muted">—</span>;
        return (
          <span className={stock <= 0 ? 'dt-low' : undefined}>{num.format(stock)}</span>
        );
      }
    }
  };

  return (
    <div className="dt mt">
      <header className="dt-head">
        <h1>機種別トナー</h1>
        <p>
          端末台帳 {counts.assets} 台をメーカー＋型番でまとめ、同じ機種を 1 行にした一覧です
          （{counts.models} 機種）。行にはその機種のどれかに登録されているトナーが並びます。
          台帳の書き方が揺れているもの（「P501」と「P 501」）は同じ機種として畳み、
          「表記ゆれ」の印を付けます。行を押すと、その機種の台と、台ごとの登録が見られます。
        </p>
      </header>

      <div className="dt-tools">
        <label>
          <span>絞り込み</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">すべて（{counts.models} 機種）</option>
            <option value="linked">トナー登録あり（{counts.models - counts.none} 機種）</option>
            <option value="none">トナー未登録（{counts.none} 機種）</option>
            <option value="mixed">台ごとに登録が違う（{counts.mixed} 機種）</option>
          </select>
        </label>

        <label>
          <span>探す</span>
          <input
            type="text"
            value={needle}
            onChange={(e) => setNeedle(e.target.value)}
            placeholder="メーカー・型番・トナーID・部署・IP"
          />
        </label>

        <button onClick={() => void load()} type="button">
          一覧を更新
        </button>
      </div>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}

      <p className="dt-legend">
        <span className="dt-swatch mt-swatch-none" aria-hidden />
        トナー未登録（{counts.none} 機種）
        <span className="dt-swatch mt-swatch-mixed" aria-hidden />
        台ごとに登録が違う（{counts.mixed} 機種）
        <span className="dt-legend-note">
          トナーの紐づけは台帳の 1 台ごとに持つので、同じ機種でも登録し忘れがあると
          台によって中身が変わります。「トナー登録済」が「10 / 12」のように欠けている機種と、
          中身そのものが違う機種に印を付けます。数字はその品番の在庫（本）で、
          0 本は赤、警告本数以下はオレンジです。登録は「トナー登録」の画面で直します。
        </span>
      </p>

      <p className="dt-legend">
        <span className="mt-kind mt-kind-genuine">純正</span>
        メーカー純正品
        <span className="mt-kind mt-kind-recycled">再生</span>
        リサイクル品・互換品
        <span className="dt-legend-note">
          「色」は、その機種が使うトナー・インクの色です。黒だけの機種は「モノクロ」、
          K（黒）C M Y を使う機種は「カラー」と出します。実機が SNMP で返す消耗品の色から
          判定し、一度も取得できていない機種だけ、登録してあるトナーの色で代えます
          （その場合は ※ を付けます）。どちらも無い機種は「不明」です。
        </span>
      </p>

      <p className="dt-legend">
        <span className="mt-badge mt-badge-other">他機種</span>
        同じトナーを使う別の機種
        <span className="dt-legend-note">
          右端の「このトナーを使うプリンター」は、品番ごとに、そのトナーを使っている台の
          部署と IP アドレスを並べます。プリンター名は台帳のメーカー＋型番です。
          トナーは機種をまたいで共用することがある（C310H は SP C320・C341・C342）ので、
          この行の機種以外の台にも「他機種」の印を付けて出します。
          使う台がまったく同じ品番（カラー機の 4 色と回収ボトルなど）は 1 行にまとめます。
          品番を切らしたときにどこが止まるかは、この列で分かります。
        </span>
      </p>

      {shown.length === 0 ? (
        <p className="dt-empty">表示できる機種がありません。</p>
      ) : (
        <div className="dt-wrap">
          <table className="dt-table">
            <thead>
              <tr>
                <th className="dt-plain mt-toggle-head" aria-label="台の一覧" />
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={col.numeric ? 'dt-num' : ''}
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
                <th className="dt-plain">この機種で使うトナー</th>
                <th className="dt-plain">このトナーを使うプリンター（部署・IP）</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <Fragment key={row.key}>
                  <tr
                    className={[
                      row.toners.length === 0 ? 'mt-row-none' : '',
                      row.mixed ? 'mt-row-mixed' : '',
                      open === row.key ? 'mt-row-open' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td className="mt-toggle">
                      <button
                        type="button"
                        aria-expanded={open === row.key}
                        title={`${row.assetCount} 台の内訳`}
                        onClick={() => setOpen(open === row.key ? null : row.key)}
                      >
                        {open === row.key ? '▾' : '▸'}
                      </button>
                    </td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className={col.numeric ? 'dt-num' : ''}>
                        {cellOf(row, col.key)}
                      </td>
                    ))}
                    <td>
                      <TonerCell row={row} />
                      {row.mixed && (
                        <span
                          className="mt-badge mt-badge-mixed"
                          title="同じ機種でも台によって登録されているトナーが違います。行を開くと台ごとの登録が見られます"
                        >
                          不揃い
                        </span>
                      )}
                    </td>
                    <td className="mt-used">
                      <UsedByCell row={row} />
                    </td>
                  </tr>

                  {open === row.key && (
                    <tr className="mt-detail">
                      <td colSpan={COLUMNS.length + 3}>
                        <AssetRows row={row} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="dt-hint">
        トナーが 1 件も登録されていない台は、台帳 {counts.assets} 台のうち{' '}
        {counts.unlinkedAssets} 台です。
      </p>
    </div>
  );
}
