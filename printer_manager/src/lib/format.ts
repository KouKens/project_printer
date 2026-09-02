/**
 * 画面で値を出すときの共通の整え方。
 * 同じものが画面ごとに置かれていたのでここにまとめた。
 */

/**
 * 3 桁区切り。金額（円）にも枚数にも同じものを使う。
 * 画面ごとに作り直すと、片方だけ書式を変えたときに表の中で桁の見え方が食い違う
 */
export const num = new Intl.NumberFormat('ja-JP');

/** 空文字・空白だけの入力は未入力として扱い、null で送る */
export function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
