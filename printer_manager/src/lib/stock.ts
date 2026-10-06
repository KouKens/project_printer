/**
 * 在庫の状態。0 は切らしているので out（赤）、警告本数以下は low（オレンジ）。
 *
 * トナー個数状況とプリンター状況の「毎日チェック」で同じ判定を使う。
 * 警告本数（`alertThreshold`）は品番ごとにトナー登録で決めるもので、
 * 未設定（null）なら 0 本のときだけ知らせる
 */
export function stockState(toner: {
  stock: number;
  alertThreshold: number | null;
}): 'out' | 'low' | null {
  if (toner.stock <= 0) return 'out';
  if (toner.alertThreshold !== null && toner.stock <= toner.alertThreshold) {
    return 'low';
  }
  return null;
}
