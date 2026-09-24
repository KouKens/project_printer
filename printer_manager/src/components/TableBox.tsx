import { useEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import './TableBox.css';

/**
 * 一覧表を入れる、高さを変えられる箱。**各画面の `<div className="…-wrap">` をこれに差し替える。**
 *
 * 表は箱の中でスクロールさせている（ページ全体に任せると、横スクロールバーが
 * 表の最下端＝ずっと下に付いて掴めなくなるため）。ただし高さを CSS で決め打ちにすると、
 * 縦に長い窓では十数行しか見えず、何度もスクロールしないと見比べられない。
 *
 * そこで**下端に掴み手を置き、上下にドラッグして高さを変えられるようにする。**
 * 左右は窓の幅に任せる（列が多いので、狭めても得がない）。
 *
 * - 掴み手の上だけカーソルが ns-resize になる。表の中を掴んでも動かない
 * - ダブルクリック（キーボードは Home）で既定の高さに戻す
 * - 決めた高さは端末に覚えさせる。画面を移るたびに広げ直さずに済む
 * - **決めるのは高さそのものではなく max-height。** 絞り込んで 3 行になったときは
 *   これまで通り中身の高さまで縮む（高さで指定すると、下に空白が残る）
 * - **窓の高さでは止めない。** 表の上には見出し・絞り込み・凡例が乗っていて、
 *   一覧はたいてい画面の下端より先から始まる。窓に収まる分で止めると、
 *   掴んだとたんに縮んで「広げられない」ことになる。窓より高くしたぶんは
 *   ページごとスクロールになる（そのぶん sticky の見出しは上に流れる）
 */
type Props = {
  /** 箱のクラス。画面ごとの `dt-wrap` などをそのまま渡す（見た目はこれまで通り） */
  className: string;
  /**
   * 高さを覚える鍵。**画面 × 表で一意にする**（同じ鍵を 2 つの表に付けると、
   * 片方で決めた高さがもう片方にも出る）。省くとその表だけ覚えない
   */
  memoryKey?: string;
  children: ReactNode;
};

/** これより低いと見出しと数行しか見えない */
const MIN_HEIGHT = 120;
/** 矢印キー 1 回ぶんの変化 */
const STEP = 32;

const STORAGE_PREFIX = 'printer-manager.tableHeight.';

/** 端末が覚えている高さ。未設定・壊れた値は null（＝ CSS の既定に任せる） */
function readStored(key: string | undefined): number | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return null;
    const px = Number(raw);
    return Number.isFinite(px) && px >= MIN_HEIGHT ? px : null;
  } catch {
    // プライベートウィンドウなどで読めないことがある。既定に任せる
    return null;
  }
}

function writeStored(key: string | undefined, px: number | null) {
  if (!key) return;
  try {
    if (px === null) window.localStorage.removeItem(STORAGE_PREFIX + key);
    else window.localStorage.setItem(STORAGE_PREFIX + key, String(Math.round(px)));
  } catch {
    // 覚えられなくても画面は動く。次に開いたとき既定の高さに戻るだけ
  }
}

/**
 * ここまでは伸ばせる、という高さ＝中身（表）が全部見える高さ。
 * これより先へ引いても箱は伸びないので、覚える値もここで止める
 * （止めないと、引いた分だけ数字が育って、次に上へ戻すとき何度も引くことになる）
 */
function maxHeightOf(box: HTMLDivElement): number {
  const table = box.firstElementChild;
  if (!table) return Number.POSITIVE_INFINITY;

  // 表の高さ ＋ 枠と横スクロールバーのぶん（offsetHeight と clientHeight の差）
  const content = table.getBoundingClientRect().height + (box.offsetHeight - box.clientHeight);
  return Math.max(content, MIN_HEIGHT);
}

export default function TableBox({ className, memoryKey, children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  /** 出している高さ。null なら CSS の既定（max-height）のまま */
  const [height, setHeight] = useState<number | null>(() => readStored(memoryKey));
  /**
   * 最後に決めた高さ。state と同じ値だが、指を離した時点で覚えさせるために ref でも持つ
   * （state は描き直しのあとでないと新しい値にならない）
   */
  const wanted = useRef<number | null>(height);
  /** ドラッグの起点。掴んでいないときは null */
  const from = useRef<{ y: number; height: number } | null>(null);

  // 掴んだまま画面が切り替わっても、body に付けた印を残さない
  useEffect(() => () => document.body.classList.remove('tb-resizing'), []);

  const apply = (px: number) => {
    const box = boxRef.current;
    if (!box) return;
    const next = Math.max(Math.min(px, maxHeightOf(box)), MIN_HEIGHT);
    wanted.current = next;
    setHeight(next);
    return next;
  };

  /** 既定（CSS の max-height）に戻す */
  const reset = () => {
    wanted.current = null;
    setHeight(null);
    writeStored(memoryKey, null);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = boxRef.current;
    if (!box || e.button !== 0) return;
    // 掴んだまま動かしたときに、後ろの表の文字が選択されるのを止める
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    from.current = { y: e.clientY, height: box.getBoundingClientRect().height };
    document.body.classList.add('tb-resizing');
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = from.current;
    if (!start) return;
    apply(start.height + (e.clientY - start.y));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!from.current) return;
    from.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.classList.remove('tb-resizing');
    writeStored(memoryKey, wanted.current);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const box = boxRef.current;
    if (!box) return;

    if (e.key === 'Home') {
      e.preventDefault();
      reset();
      return;
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    // 矢印でページが動いてしまわないようにする
    e.preventDefault();
    // 起点は「いま見えている高さ」。ドラッグと同じで、目に見えている端が動く
    const base = box.getBoundingClientRect().height;
    writeStored(memoryKey, apply(base + (e.key === 'ArrowDown' ? STEP : -STEP)) ?? null);
  };

  return (
    <div className="tb">
      <div
        ref={boxRef}
        className={`tb-box ${className}`}
        /* CSS の min-height（220px）も外す。狭くしたいときに効いてしまうため */
        style={height === null ? undefined : { maxHeight: height, minHeight: MIN_HEIGHT }}
      >
        {children}
      </div>
      <div
        className="tb-grip"
        role="separator"
        aria-orientation="horizontal"
        aria-label="表の高さを変える"
        title="上下にドラッグすると表の高さが変わります（ダブルクリックで元の高さ）"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={reset}
        onKeyDown={onKeyDown}
      >
        <span className="tb-grip-bar" aria-hidden="true" />
      </div>
    </div>
  );
}
