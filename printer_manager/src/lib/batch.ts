/**
 * まとめ処理（持出/廃棄・注文/搬入）の明細。
 * 2 画面で同じ形を持つので、行の足し方をここにまとめる。
 */

/** 明細 1 行。本数は入力欄から来るので文字列のまま持つ */
export type BatchLine = { tonerId: string; name: string; quantity: string };

/** 1 行の本数の上限。入力欄（max=999）と揃える */
export const MAX_LINE_QUANTITY = 999;

/**
 * 明細に足す。**同じ品番の行があれば、新しい行を作らずその本数に足す。**
 *
 * 候補を押すたび・読み取るたびに積むので、同じトナーを 2 回選ぶことがよくある。
 * 行が分かれると合計が見えにくく、−／＋ で直すときにどちらを触るか迷う
 */
export function addToLines(lines: BatchLine[], line: BatchLine): BatchLine[] {
  const index = lines.findIndex((item) => item.tonerId === line.tonerId);
  if (index === -1) return [...lines, line];

  const total = Math.min(
    Number(lines[index].quantity) + Number(line.quantity),
    MAX_LINE_QUANTITY,
  );
  return lines.map((item, i) => (i === index ? { ...item, quantity: String(total) } : item));
}
