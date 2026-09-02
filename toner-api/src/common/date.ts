/**
 * 画面と DB のあいだの日付の受け渡し。
 *
 * **`@db.Date` の列は Date の UTC 成分しか見ない。** ローカル 0 時の Date を渡すと
 * JST では 9 時間戻って前日として保存される。器は UTC 0 時に揃え、読むときも
 * `getUTCFullYear()` 系で取り出す。
 *
 * 同じものが 6 つのサービスに並んでいたのでここにまとめた。
 */

/**
 * 'YYYY-MM-DD' を UTC 0 時の Date にする。
 * 未入力（null・undefined・空文字）は null のまま返す。
 */
export function toDate(value: string): Date;
export function toDate(value: string | null | undefined): Date | null;
export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** 読むときも UTC 成分で取り出す。画面の <input type="date"> にそのまま入る形 */
export function fromDate(value: Date): string;
export function fromDate(value: Date | null): string | null;
export function fromDate(value: Date | null): string | null {
  if (!value) return null;
  const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${value.getUTCDate()}`.padStart(2, '0');
  return `${value.getUTCFullYear()}-${month}-${day}`;
}

/**
 * ローカルの暦日を UTC 0 時の器に移す。
 * 「どの日か」はローカル時刻で決め、器だけ UTC に揃える。
 */
export function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

/** 今日をローカルの暦日で。UTC 0 時に揃えて @db.Date と比べられる形にする */
export function today(): Date {
  return startOfDay(new Date());
}
