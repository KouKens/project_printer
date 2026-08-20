/** 一覧の並べ替え。列の中身によって比べ方を変える */
export type SortDir = 'asc' | 'desc';

/** text = 日本語の照合順 / number = 数値 / date = ISO 文字列 / ip = オクテット */
export type CellKind = 'text' | 'number' | 'date' | 'ip';

/** 172.31.3.206 が 172.31.13.211 より先に来るよう、オクテットの数値で比べる */
export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n))) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parts.reduce((total, octet) => total * 256 + octet, 0);
}

function compareCells(a: unknown, b: unknown, kind: CellKind): number {
  if (kind === 'ip') return ipToNumber(String(a)) - ipToNumber(String(b));
  if (kind === 'number') return Number(a) - Number(b);

  // 日付・日時は ISO 形式なので、文字列のまま比べれば時系列になる
  if (kind === 'date') {
    const x = String(a);
    const y = String(b);
    return x < y ? -1 : x > y ? 1 : 0;
  }

  return String(a).localeCompare(String(b), 'ja', { numeric: true });
}

/**
 * 空欄は向きによらず末尾に置く。
 * 降順にしたときに未入力の行が先頭を占めると、一覧として読めなくなるため。
 * 値が並んだときは tieBreak で order を安定させる。
 */
export function sortRows<T>(
  rows: T[],
  pick: (row: T) => unknown,
  kind: CellKind,
  dir: SortDir,
  tieBreak: (row: T) => number,
): T[] {
  return [...rows].sort((x, y) => {
    const a = pick(x) ?? null;
    const b = pick(y) ?? null;

    if (a === null && b === null) return tieBreak(x) - tieBreak(y);
    if (a === null) return 1;
    if (b === null) return -1;

    const result = compareCells(a, b, kind);
    return (dir === 'asc' ? result : -result) || tieBreak(x) - tieBreak(y);
  });
}

/** 見出しを押したときの状態遷移。同じ列なら反転、別の列なら昇順から */
export function nextSort<K>(
  current: { key: K; dir: SortDir },
  key: K,
): { key: K; dir: SortDir } {
  if (current.key === key) {
    return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
  }
  return { key, dir: 'asc' };
}
