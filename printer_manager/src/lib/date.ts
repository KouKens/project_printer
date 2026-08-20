/**
 * 画面で使う日付の道具。
 * <input type="date"> と API の @db.Date に合わせて YYYY-MM-DD の文字列で扱う。
 * Date に戻さず文字列のまま比べれば、JST での前日ずれを踏まない。
 */

/** ローカルの暦日で YYYY-MM-DD にする */
export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 今日 */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/** 今日から n 日前 */
export function isoDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return toIsoDate(date);
}
