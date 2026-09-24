/**
 * 一覧の絞り込み（「探す」の入力欄）。
 *
 * **打つたびに API を叩かない。** 画面が開いたときに取ってある行を、
 * この場（React の中）で絞るだけ。1 文字ごとに問い合わせると、
 * 1000 件の履歴では毎回 DB を舐めることになり、打った端から遅れて追いつかなくなる。
 *
 * 畳み方は `lib/fold.ts` の `foldKey()` と同じ **NFKC ＋ 小文字**。
 * `ＲＩＣＯＨ` と `Ricoh`、`ｷﾔﾉﾝ` と `キヤノン` が同じに引ける。
 * **ただしこれは「同じものか」の判定ではない**（あちらはマスタの突き合わせ）。
 * ここは部分一致で探すためのものなので、`foldKey` とは別に持つ。
 *
 * 日付は行が ISO（`2026-09-14`）で持っているが、画面には `2026/09/14` と出る。
 * 見えている通りに打っても引けるよう、`/` は `-` に寄せてから比べる。
 */

/** 探し先に混ぜてよい値。null と undefined は落ちる */
export type SearchPart = string | number | null | undefined;

function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\//g, '-');
}

/**
 * 打った文字を語に分ける。**空白で区切ると AND**（`予約外来 canon` で両方を含む行）。
 * 空欄・空白だけなら空の配列＝絞り込まない
 */
export function searchWords(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/**
 * その行が全部の語を含むか。`words` が空なら常に true（絞り込まない）。
 *
 * `parts` はその行の探し先。**画面に出している列だけでなく、
 * 見えていないが探したい値（シリアル・拠点名など）も入れてよい。**
 */
export function hits(parts: SearchPart[], words: string[]): boolean {
  if (words.length === 0) return true;

  const text = normalize(
    parts.filter((part) => part !== null && part !== undefined && part !== '').join(' '),
  );
  return words.every((word) => text.includes(word));
}
