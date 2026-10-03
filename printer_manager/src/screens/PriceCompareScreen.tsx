import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import CsvButton from '../components/CsvButton';
import SearchBox from '../components/SearchBox';
import TableBox from '../components/TableBox';
import type { CsvValue } from '../lib/csv';
import { todayIso } from '../lib/date';
import { num } from '../lib/format';
import { colorRank, diffOf, diffText } from '../lib/offer';
import type { Diff, Offer, OfferList, SupplyPart } from '../lib/offer';
import { request } from '../lib/request';
import { hits, searchWords } from '../lib/search';
import { nextSort, sortRows } from '../lib/table';
import type { CellKind, SortDir } from '../lib/table';
import OfferCompare from './OfferCompare';
import type { CompareAsset } from './OfferCompare';
import './DataTable.css';
import './PriceCompareScreen.css';

/**
 * トナー価格比較。**見るだけの画面。** 入力はトナー登録（使っているトナーの価格）と
 * トナー情報登録（比較用の販売店ごとの値段）で行う。
 *
 * 上半分（OfferCompare）は、トナー登録の品番とトナー情報を 1 つの表に並べ、
 * プリンターを選ぶとその台に使えるものを色ごとに比べる。
 * **トナー情報が出るのはこの画面だけ**（受付・注文・在庫などはトナー登録だけを使う）。
 *
 * 下半分はトナー登録の品番だけを見る、価格の推移と純正との差。
 *
 * 比べる単位は「組」= 純正 1 ＋ その代わりのリサイクル品 N。
 * 組はトナー登録でリサイクル品の側から純正を選んで作る（`genuineId`）。
 * 組を作っていない品番は、それ 1 つだけの組として並べる。
 *
 * 機種は対応プリンターの台帳から引き、**組の中で足し合わせる。**
 * 比較のためだけに登録した純正は対応プリンターを付けていないことが多いが、
 * 相手のリサイクル品が付けていれば、その機種で一緒に引けるようにするため。
 *
 * 全品番を 1 回で取り、絞り込みも並べ替えもこの場で行う（API は叩き直さない）。
 */

type PricePoint = { effectiveFrom: string; price: number; note: string | null };

type CompareToner = {
  id: string;
  name: string | null;
  color: string | null;
  /** 種類（トナー・ドラム…）。上の比較の表がこれと色でまとめる */
  part: SupplyPart;
  recycled: boolean;
  genuineId: string | null;
  /** 他の画面に出さない品番。ここには出す（比べるために登録したものなので） */
  hidden: boolean;
  disabledAt: string | null;
  yieldPages: number | null;
  /** 今日の時点の税別価格 */
  price: number | null;
  priceFrom: string | null;
  costPerPage: number | null;
  /** 価格の履歴。古い順 */
  prices: PricePoint[];
  printers: {
    id: number;
    no: string | null;
    department: string | null;
    maker: string | null;
    model: string | null;
    companyName: string | null;
  }[];
  modelKeys: string[];
};

type Model = { key: string; label: string; assetCount: number };

type Compare = {
  models: Model[];
  /** 台の月の印刷枚数を出すのに見た日数 */
  volumeDays: number;
  assets: CompareAsset[];
  toners: CompareToner[];
};

/** 純正 1 ＋ リサイクル N の組。組を作っていない品番は 1 つだけの組 */
type Family = {
  /** 組の軸の品番（純正の品番）。組を作っていなければ自分の品番 */
  key: string;
  /** 比べる基準の純正。リサイクル品 1 つだけの組では null */
  genuine: CompareToner | null;
  /** 純正を先に、リサイクル品は品番の順 */
  members: CompareToner[];
  /** 組の中で足し合わせた機種 */
  modelKeys: string[];
};

type Row = {
  toner: CompareToner;
  family: Family;
  priceDiff: Diff | null;
  cppDiff: Diff | null;
};

/** グラフに出す 1 本。slot は組ごとの色の番号（0 始まり） */
type Series = { toner: CompareToner; family: Family; slot: number };

/**
 * グラフに同時に出せる組の数。**色を 8 つより増やさない**
 * （9 つ目からは見分けられる色が無い）。CSS の --series-1〜8 と揃える
 */
const MAX_FAMILIES = 8;

/** 機種の絞り込みで「対応プリンターが 1 台も無い組」を選ぶ値 */
const NO_MODEL = '\u0000none';
/** 色の絞り込みで「色の無い消耗品」を選ぶ値 */
const NO_COLOR = '\u0000none';

type SortKey =
  | 'family'
  | 'models'
  | 'kind'
  | 'id'
  | 'name'
  | 'color'
  | 'price'
  | 'priceDiff'
  | 'yieldPages'
  | 'costPerPage'
  | 'cppDiff'
  | 'priceFrom'
  | 'priceCount';

const COLUMNS: { key: SortKey; label: string; kind: CellKind; numeric?: boolean }[] = [
  { key: 'family', label: '組（純正）', kind: 'text' },
  { key: 'models', label: '使える機種', kind: 'text' },
  { key: 'kind', label: '区分', kind: 'number' },
  { key: 'id', label: 'トナーID', kind: 'text' },
  { key: 'name', label: 'トナー名', kind: 'text' },
  { key: 'color', label: '色', kind: 'text' },
  { key: 'price', label: '価格（税別）', kind: 'number', numeric: true },
  { key: 'priceDiff', label: '純正との差', kind: 'number', numeric: true },
  { key: 'yieldPages', label: '印刷可能枚数', kind: 'number', numeric: true },
  { key: 'costPerPage', label: '1 枚あたり', kind: 'number', numeric: true },
  { key: 'cppDiff', label: '1 枚あたりの差', kind: 'number', numeric: true },
  { key: 'priceFrom', label: '適用開始', kind: 'date' },
  { key: 'priceCount', label: '価格の履歴', kind: 'number', numeric: true },
];

/** 組を作る。純正を指しているリサイクル品は、その純正の組に入る */
function familiesOf(toners: CompareToner[]): Map<string, Family> {
  const byId = new Map(toners.map((toner) => [toner.id, toner]));
  const families = new Map<string, Family>();

  for (const toner of toners) {
    const key =
      toner.genuineId !== null && byId.has(toner.genuineId) ? toner.genuineId : toner.id;
    const family = families.get(key) ?? { key, genuine: null, members: [], modelKeys: [] };
    family.members.push(toner);
    families.set(key, family);
  }

  for (const family of families.values()) {
    const anchor = byId.get(family.key);
    family.genuine = anchor && !anchor.recycled ? anchor : null;
    family.members.sort(
      (a, b) =>
        Number(a.recycled) - Number(b.recycled) ||
        a.id.localeCompare(b.id, 'ja', { numeric: true }),
    );
    family.modelKeys = [...new Set(family.members.flatMap((member) => member.modelKeys))];
  }
  return families;
}

const kindLabel = (toner: CompareToner) => (toner.recycled ? 'リサイクル' : '純正');

const tonerLabel = (toner: CompareToner) =>
  [toner.id, kindLabel(toner), toner.color].filter(Boolean).join(' ');

/** 機種の呼び名。メーカーも型番も未入力の台帳は空文字で届く */
const modelName = (model: Model | undefined) =>
  model === undefined ? '' : model.label || '（型番未入力）';

/** YYYY-MM-DD を UTC のミリ秒に。@db.Date と同じく日付だけを見る */
function dayMs(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

const DAY = 86_400_000;

/** ミリ秒を YYYY-MM-DD に戻す（UTC の暦日） */
function isoOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** 目盛りの上限。1・2・2.5・5 の刻みに丸めて軸を読みやすくする */
function niceMax(value: number): number {
  if (value <= 0) return 10;
  const base = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * base) return step * base;
  }
  return 10 * base;
}

/** その日に効いていた価格。最初の価格より前は null（線を引かない） */
function priceAt(points: PricePoint[], ms: number): PricePoint | null {
  let found: PricePoint | null = null;
  for (const point of points) {
    if (dayMs(point.effectiveFrom) <= ms) found = point;
    else break;
  }
  return found;
}

/** グラフの色。CSS の --series-n を引く */
const seriesColor = (slot: number) => `var(--series-${slot + 1})`;

/** リサイクル品は破線。色は組で揃え、純正かどうかは線の形で見分ける */
const DASH = '7 4';

/** 凡例と読み取りの線の見本。色だけに頼らず、実線か破線かも添える */
function LineKey({ slot, recycled }: { slot: number; recycled: boolean }) {
  return (
    <svg className="pc-linekey" width="24" height="8" aria-hidden>
      <line
        x1="1"
        x2="23"
        y1="4"
        y2="4"
        stroke={seriesColor(slot)}
        strokeWidth="2"
        strokeDasharray={recycled ? '5 3' : undefined}
      />
    </svg>
  );
}

/**
 * 価格の推移。**階段の線**で描く（価格は改定日にだけ変わり、その間は平らなので、
 * 点を斜めに結ぶと途中の日に存在しない値が見えてしまう）。
 * 縦軸は 0 から。差を大きく見せないため
 */
const CHART = { width: 960, height: 300, top: 24, bottom: 34, left: 72 };

function PriceHistoryChart({ series, today }: { series: Series[]; today: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  /** 読み取りの線を置いている日（ミリ秒）。null なら出さない */
  const [cursor, setCursor] = useState<number | null>(null);
  /** 読み取りの箱の横位置（箱の左端からの割合 0〜1） */
  const [cursorRatio, setCursorRatio] = useState(0);

  const drawn = series.filter((item) => item.toner.prices.length > 0);
  /** 線が 4 本までなら右端に名前を直接添える。多いと重なるので凡例だけにする */
  const direct = drawn.length <= 4;
  const right = direct ? 150 : 24;

  const todayMs = dayMs(today);
  const allDates = drawn.flatMap((item) => item.toner.prices.map((p) => dayMs(p.effectiveFrom)));
  const lastChange = Math.max(...allDates, todayMs);
  // 先の日付の改定（予定）は、その段が見えるよう 30 日ぶん右に余白を取る
  const end = lastChange > todayMs ? lastChange + 30 * DAY : todayMs;
  let start = Math.min(...allDates, todayMs);
  if (end - start < 30 * DAY) start = end - 30 * DAY;

  const maxPrice = Math.max(...drawn.flatMap((item) => item.toner.prices.map((p) => p.price)), 0);
  const yMax = niceMax(maxPrice);
  const plotWidth = CHART.width - CHART.left - right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const x = (ms: number) => CHART.left + ((ms - start) / (end - start)) * plotWidth;
  const y = (value: number) => CHART.top + plotHeight - (value / yMax) * plotHeight;

  /** キーボードで止まる日。どれかの線が変わる日と今日 */
  const stops = [...new Set([...allDates, todayMs])]
    .filter((ms) => ms >= start && ms <= end)
    .sort((a, b) => a - b);

  if (drawn.length === 0) {
    return <p className="dt-empty">選んだ組には、まだ価格が登録されていません。</p>;
  }

  // 横軸は月の頭に目盛りを置く。8 個を超えるときは間引く
  const months: number[] = [];
  const first = new Date(start);
  for (
    let cursorMonth = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1);
    cursorMonth <= end;
    cursorMonth = Date.UTC(
      new Date(cursorMonth).getUTCFullYear(),
      new Date(cursorMonth).getUTCMonth() + 1,
      1,
    )
  ) {
    months.push(cursorMonth);
  }
  const monthStep = Math.max(1, Math.ceil(months.length / 8));
  const monthTicks = months.filter((_, index) => index % monthStep === 0);
  const monthLabel = (ms: number, index: number) => {
    const date = new Date(ms);
    const month = date.getUTCMonth() + 1;
    return index === 0 || month === 1 ? `${date.getUTCFullYear()}/${month}` : `${month}月`;
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => yMax * ratio);

  /** 階段の線。最後の段は右端（今日か予定の先）まで伸ばす */
  const pathOf = (points: PricePoint[]) => {
    const parts: string[] = [];
    points.forEach((point, index) => {
      const px = x(dayMs(point.effectiveFrom));
      const py = y(point.price);
      parts.push(index === 0 ? `M${px},${py}` : `H${px} V${py}`);
    });
    parts.push(`H${x(end)}`);
    return parts.join(' ');
  };

  // 右端の名前。値の順に並べ、重なる分だけ下へずらす
  const labels = direct
    ? drawn
        .map((item) => {
          const last = item.toner.prices[item.toner.prices.length - 1];
          return { item, value: last.price, y: y(last.price) };
        })
        .sort((a, b) => a.y - b.y)
        .reduce<{ item: Series; value: number; y: number }[]>((placed, label) => {
          const prev = placed[placed.length - 1];
          placed.push({ ...label, y: prev && label.y - prev.y < 14 ? prev.y + 14 : label.y });
          return placed;
        }, [])
    : [];

  /** 指している位置から日を出す。**日ごとに止める**（価格は日単位でしか変わらない） */
  const pointAt = (clientX: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    const ratio = (clientX - box.left) / box.width;
    const vx = ratio * CHART.width;
    const ms = start + ((vx - CHART.left) / plotWidth) * (end - start);
    const clamped = Math.min(end, Math.max(start, Math.round(ms / DAY) * DAY));
    setCursor(clamped);
    setCursorRatio(x(clamped) / CHART.width);
  };

  const moveTo = (ms: number) => {
    setCursor(ms);
    setCursorRatio(x(ms) / CHART.width);
  };

  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (stops.length === 0) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = stops.find((ms) => cursor === null || ms > cursor) ?? stops[stops.length - 1];
      moveTo(next);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev =
        [...stops].reverse().find((ms) => cursor === null || ms < cursor) ?? stops[0];
      moveTo(prev);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveTo(stops[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveTo(stops[stops.length - 1]);
    } else if (event.key === 'Escape') {
      setCursor(null);
    }
  };

  /** 読み取りの箱の中身。値の大きい順に、どの線にも当たっていなくても全部出す */
  const readout =
    cursor === null
      ? []
      : drawn
          .map((item) => ({ item, point: priceAt(item.toner.prices, cursor) }))
          .sort((a, b) => (b.point?.price ?? -1) - (a.point?.price ?? -1));

  return (
    <div className="pc-history">
      <div className="pc-plot" ref={wrapRef}>
        <svg
          className="dt-chart-svg pc-svg"
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label="選んだトナーの税別価格の推移。矢印キーで改定日を順に読めます"
          tabIndex={0}
          onKeyDown={onKey}
          onFocus={() => cursor === null && moveTo(todayMs)}
          onBlur={() => setCursor(null)}
          onPointerMove={(event: PointerEvent<SVGSVGElement>) => pointAt(event.clientX)}
          onPointerLeave={() => setCursor(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                className="dt-chart-grid"
                x1={CHART.left}
                x2={CHART.left + plotWidth}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text className="dt-chart-axis" x={CHART.left - 8} y={y(tick) + 4} textAnchor="end">
                {num.format(Math.round(tick))} 円
              </text>
            </g>
          ))}

          {monthTicks.map((ms, index) => (
            <text
              className="dt-chart-axis"
              key={ms}
              x={x(ms)}
              y={CHART.height - 12}
              textAnchor="middle"
            >
              {monthLabel(ms, index)}
            </text>
          ))}

          {todayMs >= start && todayMs <= end && (
            <g className="pc-today">
              <line x1={x(todayMs)} x2={x(todayMs)} y1={CHART.top - 6} y2={CHART.top + plotHeight} />
              <text x={x(todayMs)} y={CHART.top - 10} textAnchor="middle">
                今日
              </text>
            </g>
          )}

          {drawn.map((item) => (
            <g key={item.toner.id}>
              <path
                className="pc-step"
                d={pathOf(item.toner.prices)}
                stroke={seriesColor(item.slot)}
                strokeDasharray={item.toner.recycled ? DASH : undefined}
              />
              {item.toner.prices.map((point) => (
                <circle
                  className="pc-dot"
                  key={point.effectiveFrom}
                  cx={x(dayMs(point.effectiveFrom))}
                  cy={y(point.price)}
                  r={4}
                  fill={seriesColor(item.slot)}
                />
              ))}
            </g>
          ))}

          {labels.map((label) => (
            <text
              className="pc-direct"
              key={label.item.toner.id}
              x={CHART.left + plotWidth + 8}
              y={label.y + 4}
            >
              {label.item.toner.id} {num.format(label.value)} 円
            </text>
          ))}

          {cursor !== null && (
            <line
              className="pc-cross"
              x1={x(cursor)}
              x2={x(cursor)}
              y1={CHART.top}
              y2={CHART.top + plotHeight}
            />
          )}
        </svg>

        {cursor !== null && (
          <div
            className={`pc-tip${cursorRatio > 0.6 ? ' pc-tip-left' : ''}`}
            style={{ left: `${cursorRatio * 100}%` }}
            role="status"
          >
            <div className="pc-tip-date">
              {isoOf(cursor).replace(/-/g, '/')}
              {/* 先の日付の改定は入れてあるだけで、まだ効いていない */}
              {cursor > todayMs && '（予定）'}
            </div>
            {readout.map(({ item, point }) => (
              <div className="pc-tip-row" key={item.toner.id}>
                <LineKey slot={item.slot} recycled={item.toner.recycled} />
                <strong>{point === null ? '—' : `${num.format(point.price)} 円`}</strong>
                <span>{tonerLabel(item.toner)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="dt-chart-legend">
        {drawn.map((item) => (
          <span className="dt-chart-key" key={item.toner.id} title={item.toner.name ?? undefined}>
            <LineKey slot={item.slot} recycled={item.toner.recycled} />
            {tonerLabel(item.toner)}
          </span>
        ))}
        <span className="dt-chart-note">
          実線が純正、破線がリサイクル品です（色は組ごと）。グラフの上にカーソルを置くか、
          グラフを選んで矢印キーを押すと、その日の価格が出ます。
        </span>
      </p>
    </div>
  );
}

/** 横棒で比べる値。1 本の値段か、印刷可能枚数で割った 1 枚あたりか */
type Measure = 'costPerPage' | 'price';

/**
 * 今の価格を横棒で並べる。**組ごとに純正 → リサイクル品の順。**
 * どの棒にも値を書くので、読み取りの箱は持たない（title で同じ文を出す）
 */
function PriceBars({ series, measure }: { series: Series[]; measure: Measure }) {
  const valueOf = (toner: CompareToner) =>
    measure === 'costPerPage' ? toner.costPerPage : toner.price;
  const format = (value: number) =>
    measure === 'costPerPage' ? `${value.toFixed(2)} 円` : `${num.format(value)} 円`;

  const max = niceMax(Math.max(...series.map((item) => valueOf(item.toner) ?? 0), 0));

  return (
    <div className="pc-bars" role="list">
      {series.map((item) => {
        const value = valueOf(item.toner);
        const base = item.family.genuine;
        const diff =
          item.toner.recycled && base ? diffOf(value, valueOf(base)) : null;
        const text =
          value === null
            ? measure === 'costPerPage'
              ? '価格か印刷可能枚数が未入力'
              : '価格が未入力'
            : `${format(value)}${
                diff ? ` ／ 純正より ${diffText(diff, measure === 'costPerPage' ? 2 : 0)}` : ''
              }`;

        return (
          <div
            className="pc-bar-row"
            key={item.toner.id}
            role="listitem"
            title={`${tonerLabel(item.toner)}：${text}`}
          >
            <span className="pc-bar-label">
              <span className="pc-bar-id">{item.toner.id}</span>
              <span className={`pc-kind${item.toner.recycled ? ' pc-kind-recycled' : ''}`}>
                {kindLabel(item.toner)}
              </span>
            </span>
            <span className="pc-bar-track">
              {value !== null && (
                <span
                  className="pc-bar"
                  style={{
                    width: `${Math.max((value / max) * 100, 0.5)}%`,
                    background: seriesColor(item.slot),
                  }}
                />
              )}
            </span>
            <span className={value === null ? 'pc-bar-value dt-muted' : 'pc-bar-value'}>{text}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 表の 1 セルに機種を並べる。多いときは件数でまとめる */
function modelsText(keys: string[], models: Map<string, Model>): string {
  if (keys.length === 0) return '';
  const names = keys.map((key) => modelName(models.get(key))).sort((a, b) => a.localeCompare(b, 'ja'));
  return names.length > 2 ? `${names.slice(0, 2).join('、')} ほか ${names.length - 2}` : names.join('、');
}

export default function PriceCompareScreen() {
  const [data, setData] = useState<Compare | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** 「読み直す」で増やす。取り直しの合図 */
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [kind, setKind] = useState<'' | 'genuine' | 'recycled'>('');
  /** 純正とリサイクル品の両方がある組だけにする */
  const [pairsOnly, setPairsOnly] = useState(false);
  /** 無効にした品番も出す。既定は出さない（使っていない品番なので） */
  const [withDisabled, setWithDisabled] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'family', dir: 'asc' });

  /**
   * グラフに出している組と、その色の番号。**色は組に付けて、並びでは決めない。**
   * 1 つ外しても残りの色が塗り替わらないよう、外した番号は空けておき、
   * 次に足す組がいちばん若い空き番号を使う
   */
  const [picked, setPicked] = useState<{ key: string; slot: number }[]>([]);
  const [limitHit, setLimitHit] = useState(false);
  const [measure, setMeasure] = useState<Measure>('costPerPage');

  /** 比較用のトナー情報。上の表だけが使う。読めなかったときはトナー登録の品番だけで比べる */
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [offersError, setOffersError] = useState<string | null>(null);
  /** 上の表で選んでいるプリンター。'' / `asset:<id>` / `model:<key>` */
  const [target, setTarget] = useState('');

  useEffect(() => {
    let alive = true;
    request<Compare>('/toners/price-compare')
      .then((loaded) => {
        if (!alive) return;
        setData(loaded);
        setError(null);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      });
    request<OfferList>('/toner-offers')
      .then((loaded) => {
        if (!alive) return;
        setOffers(loaded.offers);
        setOffersError(null);
      })
      .catch((err: Error) => {
        if (!alive) return;
        setOffers([]);
        setOffersError(err.message);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const today = todayIso();
  const toners = useMemo(() => data?.toners ?? [], [data]);
  const models = useMemo(
    () => new Map((data?.models ?? []).map((item) => [item.key, item])),
    [data],
  );
  const families = useMemo(() => familiesOf(toners), [toners]);

  /** 無効の品番を出さないときは、組の中からも外す（グラフにも出さない） */
  const usable = (toner: CompareToner) => withDisabled || toner.disabledAt === null;

  const rows = useMemo<Row[]>(
    () =>
      toners.map((toner) => {
        const family = families.get(toner.genuineId ?? toner.id) ?? families.get(toner.id)!;
        const base = toner.recycled ? family.genuine : null;
        return {
          toner,
          family,
          priceDiff: base ? diffOf(toner.price, base.price) : null,
          cppDiff: base ? diffOf(toner.costPerPage, base.costPerPage) : null,
        };
      }),
    [toners, families],
  );

  /** 絞り込みの選択肢に出す機種。どれかの組が使っているものだけ */
  const modelChoices = useMemo(() => {
    const used = new Set([...families.values()].flatMap((family) => family.modelKeys));
    return [...used]
      .map((key) => models.get(key))
      .filter((item): item is Model => item !== undefined)
      .sort((a, b) => modelName(a).localeCompare(modelName(b), 'ja', { numeric: true }));
  }, [families, models]);

  const colorChoices = useMemo(
    () =>
      [...new Set(toners.map((toner) => toner.color).filter((c): c is string => c !== null))].sort(
        (a, b) => colorRank(a) - colorRank(b) || a.localeCompare(b, 'ja'),
      ),
    [toners],
  );

  const shown = useMemo(() => {
    const words = searchWords(query);
    const found = rows.filter(({ toner, family }) => {
      if (!(withDisabled || toner.disabledAt === null)) return false;
      if (model === NO_MODEL ? family.modelKeys.length > 0 : model !== '' && !family.modelKeys.includes(model))
        return false;
      if (color === NO_COLOR ? toner.color !== null : color !== '' && toner.color !== color) return false;
      if (kind !== '' && toner.recycled !== (kind === 'recycled')) return false;
      if (
        pairsOnly &&
        !(family.genuine !== null && family.members.some((member) => member.recycled))
      )
        return false;
      return hits(
        [
          toner.id,
          toner.name,
          toner.color,
          kindLabel(toner),
          toner.hidden ? '非表示' : null,
          family.key,
          ...family.members.map((member) => member.id),
          ...family.modelKeys.map((key) => modelName(models.get(key))),
          ...toner.printers.flatMap((printer) => [
            printer.department,
            printer.no,
            printer.companyName,
          ]),
        ],
        words,
      );
    });

    const column = COLUMNS.find((col) => col.key === sort.key);
    return sortRows(
      found,
      (row) => {
        switch (sort.key) {
          case 'family':
            // 組でまとめ、組の中は純正 → リサイクル品の順
            return `${row.family.key} ${row.toner.recycled ? 2 : 1} ${row.toner.id}`;
          case 'models':
            return modelsText(row.family.modelKeys, models) || null;
          case 'kind':
            return row.toner.recycled ? 1 : 0;
          case 'priceDiff':
            return row.priceDiff?.ratio ?? null;
          case 'cppDiff':
            return row.cppDiff?.ratio ?? null;
          case 'priceCount':
            return row.toner.prices.length;
          default:
            return row.toner[sort.key];
        }
      },
      column?.kind ?? 'text',
      sort.dir,
      (row) => rows.indexOf(row),
    );
  }, [rows, query, model, color, kind, pairsOnly, withDisabled, sort, models]);

  /** 表に出ている組。並びは表の順 */
  const shownFamilies = useMemo(
    () => [...new Set(shown.map((row) => row.family.key))],
    [shown],
  );

  const slotOf = useMemo(() => new Map(picked.map((item) => [item.key, item.slot])), [picked]);

  /** 空いているいちばん若い色の番号 */
  const freeSlot = (taken: { slot: number }[]) => {
    for (let slot = 0; slot < MAX_FAMILIES; slot++) {
      if (!taken.some((item) => item.slot === slot)) return slot;
    }
    return -1;
  };

  const toggleFamily = (key: string) => {
    if (slotOf.has(key)) {
      setPicked((prev) => prev.filter((item) => item.key !== key));
      setLimitHit(false);
      return;
    }
    if (picked.length >= MAX_FAMILIES) {
      setLimitHit(true);
      return;
    }
    setPicked((prev) => [...prev, { key, slot: freeSlot(prev) }]);
  };

  /**
   * 表に出ている組を、空いている色の数だけ上から順にグラフに足す（選んである組は残す）。
   * 入りきらなかった組があれば断りを出す
   */
  const pickShown = () => {
    const next = [...picked];
    let left = 0;
    for (const key of shownFamilies) {
      if (next.some((item) => item.key === key)) continue;
      if (next.length >= MAX_FAMILIES) {
        left += 1;
        continue;
      }
      next.push({ key, slot: freeSlot(next) });
    }
    setPicked(next);
    setLimitHit(left > 0);
  };

  /** グラフの線と棒。色の番号の順に、組の中は純正 → リサイクル品 */
  const series = useMemo<Series[]>(
    () =>
      [...picked]
        .sort((a, b) => a.slot - b.slot)
        .flatMap(({ key, slot }) => {
          const family = families.get(key);
          if (!family) return [];
          return family.members
            .filter((member) => withDisabled || member.disabledAt === null)
            .map((toner) => ({ toner, family, slot }));
        }),
    [picked, families, withDisabled],
  );

  /** 上の集計。表に出ている行から数える */
  const summary = useMemo(() => {
    const comparable = shown.filter((row) => row.priceDiff !== null);
    return {
      toners: shown.length,
      genuine: shown.filter((row) => !row.toner.recycled).length,
      recycled: shown.filter((row) => row.toner.recycled).length,
      families: shownFamilies.length,
      comparable: comparable.length,
      cheaper: comparable.filter((row) => row.priceDiff!.value < 0).length,
      revised: shown.filter((row) => row.toner.prices.length > 1).length,
    };
  }, [shown, shownFamilies]);

  const filtered =
    query.trim() !== '' || model !== '' || color !== '' || kind !== '' || pairsOnly;

  /**
   * 上の表でプリンターを選んだら、下の価格の推移も同じ機種で絞る。
   * 下の選択肢に無い機種（トナー登録の品番がどれも紐づいていない）なら絞らない。
   * 下の機種はあとから選び直してよい（上の選択には戻さない）
   */
  const pickTarget = (value: string) => {
    setTarget(value);
    const key = value.startsWith('asset:')
      ? data?.assets.find((asset) => asset.id === Number(value.slice('asset:'.length)))?.modelKey
      : value.startsWith('model:')
        ? value.slice('model:'.length)
        : '';
    setModel(key && modelChoices.some((item) => item.key === key) ? key : '');
  };

  const CSV_HEADER = [
    '組（純正）',
    '使える機種',
    '区分',
    'トナーID',
    'トナー名',
    '色',
    '他の画面に表示',
    '価格（税別）',
    '純正との差（円）',
    '純正との差（%）',
    '印刷可能枚数',
    '1 枚あたり',
    '1 枚あたりの差（円）',
    '適用開始',
    '価格の履歴（件）',
  ];

  const csvRows = (): CsvValue[][] =>
    shown.map(({ toner, family, priceDiff, cppDiff }) => [
      family.members.length > 1 ? family.key : null,
      family.modelKeys.map((key) => modelName(models.get(key))).join(' / '),
      kindLabel(toner),
      toner.id,
      toner.name,
      toner.color,
      toner.hidden ? '' : '○',
      toner.price,
      priceDiff ? Math.round(priceDiff.value) : null,
      priceDiff ? Math.round(priceDiff.ratio * 100) : null,
      toner.yieldPages,
      toner.costPerPage === null ? null : Number(toner.costPerPage.toFixed(2)),
      cppDiff ? Number(cppDiff.value.toFixed(2)) : null,
      toner.priceFrom,
      toner.prices.length,
    ]);

  /** 表で見る価格の履歴（グラフの値をそのまま文字で） */
  const historyRows = series.flatMap((item) =>
    item.toner.prices.map((point, index) => ({
      item,
      point,
      change: index === 0 ? null : point.price - item.toner.prices[index - 1].price,
    })),
  );

  return (
    <div className="dt pc">
      <header className="dt-head pc-head">
        <div>
          <h1>トナー価格比較</h1>
          <p>
            使っているプリンターに使えるトナーの値段を比べます。上の表は、トナー登録の品番
            （実際に使っているトナー）と、トナー情報登録で入れた<strong>比較用のトナー</strong>
            （販売店・購入形態ごとの値段）を並べたものです。プリンターを選ぶと、その台に使えるものを
            色ごとに並べ、今使っているトナーと 1 枚あたりで比べます。下は、トナー登録の品番の
            価格の推移と、純正とリサイクル品の組の比較です。
          </p>
        </div>
        <button
          type="button"
          className="pc-reload"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          読み直す
        </button>
      </header>

      {error && <p className="dt-msg dt-msg-error">{error}</p>}

      <OfferCompare
        models={data?.models ?? []}
        assets={data?.assets ?? []}
        toners={toners}
        offers={data === null ? null : offers}
        offersError={offersError}
        today={today}
        volumeDays={data?.volumeDays ?? 0}
        target={target}
        onTarget={pickTarget}
      />

      <div className="pc-part">
      <h2 className="pc-part-title">トナー登録の品番：価格の推移と純正との差</h2>
      <p className="dt-hint">
        ここはトナー登録の品番だけを見ます。比べる単位は<strong>「組」</strong>で、
        トナー登録でリサイクル品の「純正品」を選ぶと、その純正と同じ組になります。
        使える機種は対応プリンターから引き、組の中で足し合わせます（純正に対応プリンターを
        付けていなくても、相手のリサイクル品が付けていればその機種で出ます）。
        価格の改定はトナー登録の「編集」から入れてください。
      </p>

      <div className="dt-tools">
        <SearchBox
          value={query}
          onChange={setQuery}
          label="探す（価格の推移）"
          placeholder="品番・トナー名・機種・部署・拠点"
          count={shown.length}
          total={rows.filter((row) => usable(row.toner)).length}
          unit="品番"
        />

        <label>
          <span>機種</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">すべて</option>
            {modelChoices.map((item) => (
              <option key={item.key} value={item.key}>
                {modelName(item)}（{item.assetCount} 台）
              </option>
            ))}
            <option value={NO_MODEL}>対応プリンター未設定</option>
          </select>
        </label>

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
            <option value="genuine">純正</option>
            <option value="recycled">リサイクル品</option>
          </select>
        </label>

        <label className="pc-check">
          <input
            type="checkbox"
            checked={pairsOnly}
            onChange={(e) => setPairsOnly(e.target.checked)}
          />
          <span>純正とリサイクル品の両方がある組だけ</span>
        </label>

        <label className="pc-check">
          <input
            type="checkbox"
            checked={withDisabled}
            onChange={(e) => setWithDisabled(e.target.checked)}
          />
          <span>無効にした品番も出す</span>
        </label>
      </div>

      <dl className="dt-summary">
        <div>
          <dt>表に出ている品番</dt>
          <dd>
            {summary.toners} 件
            <span className="pc-sub">
              （純正 {summary.genuine} ／ リサイクル {summary.recycled}）
            </span>
          </dd>
        </div>
        <div>
          <dt>組</dt>
          <dd>{summary.families} 組</dd>
        </div>
        <div>
          <dt>純正と比べられるリサイクル品</dt>
          <dd>
            {summary.comparable} 件
            {summary.comparable > 0 && (
              <span className="pc-sub">（うち純正より安い {summary.cheaper} 件）</span>
            )}
          </dd>
        </div>
        <div>
          <dt>価格を改定したことがある品番</dt>
          <dd>{summary.revised} 件</dd>
        </div>
      </dl>

      <section className="dt-chart pc-chart">
        <div className="pc-chart-head">
          <h2>価格の推移（税別）</h2>
          <div className="pc-chart-tools">
            <button
              type="button"
              onClick={pickShown}
              disabled={shownFamilies.length === 0 || picked.length >= MAX_FAMILIES}
              title={`表に出ている組を、上から順に ${MAX_FAMILIES} 組までグラフに足します。選んである組は残ります`}
            >
              表に出ている組をグラフに出す
            </button>
            <button
              type="button"
              onClick={() => {
                setPicked([]);
                setLimitHit(false);
              }}
              disabled={picked.length === 0}
            >
              グラフを空にする
            </button>
          </div>
        </div>
        <p className="dt-chart-hint">
          表の左の印を付けた組を描きます（{picked.length} / {MAX_FAMILIES} 組）。
          機種で絞ってから「表に出ている組をグラフに出す」を押すと、その機種で使えるトナーをまとめて比べられます。
        </p>
        {limitHit && (
          <p className="dt-msg dt-msg-warn">
            グラフに出せるのは {MAX_FAMILIES} 組までです（色を見分けられる数の上限）。
            足したい組があれば、先にほかの組の印を外してください。
          </p>
        )}

        {series.length === 0 ? (
          <p className="dt-empty pc-empty">まだ組を選んでいません。</p>
        ) : (
          <>
            <PriceHistoryChart series={series} today={today} />

            <div className="pc-chart-head pc-bars-head">
              <h2>今の価格の比較</h2>
              <div className="pc-measure" role="radiogroup" aria-label="比べる値">
                {(
                  [
                    ['costPerPage', '1 枚あたり'],
                    ['price', '1 本の価格'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="pc-measure"
                      checked={measure === value}
                      onChange={() => setMeasure(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="dt-chart-hint">
              {measure === 'costPerPage'
                ? '価格 ÷ 印刷可能枚数（カタログ値・A4 5% 基準）。純正とリサイクル品で枚数が違うときは、こちらで比べるのが確かです。'
                : '1 本の税別価格。印刷可能枚数が違う品番どうしでは、安いほうが得とは限りません。'}
            </p>
            <PriceBars series={series} measure={measure} />

            <details className="pc-details">
              <summary>価格の履歴を表で見る（{historyRows.length} 行）</summary>
              <table className="dt-table pc-history-table">
                <thead>
                  <tr>
                    <th className="dt-plain">トナーID</th>
                    <th className="dt-plain">区分</th>
                    <th className="dt-plain">適用開始</th>
                    <th className="dt-plain dt-num">価格（税別）</th>
                    <th className="dt-plain dt-num">前の価格との差</th>
                    <th className="dt-plain">覚書</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map(({ item, point, change }) => (
                    <tr key={`${item.toner.id}-${point.effectiveFrom}`}>
                      <td className="dt-mono">
                        <LineKey slot={item.slot} recycled={item.toner.recycled} />{' '}
                        {item.toner.id}
                      </td>
                      <td>{kindLabel(item.toner)}</td>
                      <td className="dt-mono">
                        {point.effectiveFrom}
                        {point.effectiveFrom > today && <span className="pc-soon">予定</span>}
                      </td>
                      <td className="dt-num">{num.format(point.price)} 円</td>
                      <td className="dt-num">
                        {change === null
                          ? '—'
                          : change === 0
                            ? '±0 円'
                            : `${change > 0 ? '+' : '−'}${num.format(Math.abs(change))} 円`}
                      </td>
                      <td>{point.note ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </section>

      <section className="dt-section">
        <h2>
          品番の一覧（{shown.length} 件）
          <CsvButton name="トナー価格比較" header={CSV_HEADER} rows={csvRows} count={shown.length} />
        </h2>
        <p className="dt-hint">
          差は同じ組の純正に対してです（マイナスが安い）。1 枚あたりは価格と印刷可能枚数の両方が
          入っている品番だけ出します。「非表示」はトナー登録で他の画面に出さないようにした品番です。
        </p>

        {data === null ? (
          <p className="dt-empty">読み込んでいます…</p>
        ) : shown.length === 0 ? (
          <p className="dt-empty">
            {filtered ? '絞り込みに当てはまる品番がありません。' : '登録されている品番がありません。'}
          </p>
        ) : (
          <TableBox className="dt-wrap" memoryKey="priceCompare.list">
            <table className="dt-table pc-table">
              <thead>
                <tr>
                  <th className="dt-plain">グラフ</th>
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
                {shown.map(({ toner, family, priceDiff, cppDiff }) => {
                  const slot = slotOf.get(family.key);
                  const pair = family.members.length > 1;
                  return (
                    <tr
                      key={toner.id}
                      className={toner.disabledAt !== null ? 'pc-row-disabled' : undefined}
                    >
                      <td className="pc-pick">
                        <input
                          type="checkbox"
                          checked={slot !== undefined}
                          onChange={() => toggleFamily(family.key)}
                          aria-label={`${family.key} の組をグラフに出す`}
                          title="この品番の組（純正とリサイクル品）をグラフに出します"
                        />
                        {slot !== undefined && (
                          <span
                            className="pc-swatch"
                            style={{ background: seriesColor(slot) }}
                            aria-hidden
                          />
                        )}
                      </td>
                      <td className="dt-mono">{pair ? family.key : <span className="dt-muted">—</span>}</td>
                      <td
                        className="pc-models"
                        title={family.modelKeys.map((key) => modelName(models.get(key))).join('\n')}
                      >
                        {modelsText(family.modelKeys, models) || (
                          <span className="dt-muted">未設定</span>
                        )}
                      </td>
                      <td>
                        <span className={`pc-kind${toner.recycled ? ' pc-kind-recycled' : ''}`}>
                          {kindLabel(toner)}
                        </span>
                        {toner.hidden && (
                          <span
                            className="pc-flag"
                            title="トナー登録で他の画面に出さないようにした品番です"
                          >
                            非表示
                          </span>
                        )}
                        {toner.disabledAt !== null && <span className="pc-flag">無効</span>}
                      </td>
                      <td className="dt-mono">{toner.id}</td>
                      <td>{toner.name ?? <span className="dt-muted">—</span>}</td>
                      <td>{toner.color ?? <span className="dt-muted">—</span>}</td>
                      <td className="dt-num">
                        {toner.price === null ? (
                          <span className="dt-muted">—</span>
                        ) : (
                          `${num.format(toner.price)} 円`
                        )}
                      </td>
                      <td className="dt-num">
                        {priceDiff ? (
                          diffText(priceDiff)
                        ) : !toner.recycled && family.members.some((m) => m.recycled) ? (
                          <span className="dt-muted">基準</span>
                        ) : (
                          <span className="dt-muted">—</span>
                        )}
                      </td>
                      <td className="dt-num">
                        {toner.yieldPages === null ? (
                          <span className="dt-muted">—</span>
                        ) : (
                          `${num.format(toner.yieldPages)} 枚`
                        )}
                      </td>
                      <td className="dt-num">
                        {toner.costPerPage === null ? (
                          <span className="dt-muted">—</span>
                        ) : (
                          `${toner.costPerPage.toFixed(2)} 円`
                        )}
                      </td>
                      <td className="dt-num">
                        {cppDiff ? diffText(cppDiff, 2) : <span className="dt-muted">—</span>}
                      </td>
                      <td className="dt-mono">{toner.priceFrom ?? <span className="dt-muted">—</span>}</td>
                      <td className="dt-num">{toner.prices.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableBox>
        )}
      </section>
      </div>
    </div>
  );
}
