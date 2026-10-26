/**
 * 画面と DB のあいだの日付の受け渡し。
 *
 * **`@db.Date` の列は Date の UTC 成分しか見ない。** ローカル 0 時の Date を渡すと
 * JST では 9 時間戻って前日として保存される。器は UTC 0 時に揃え、読むときも
 * `getUTCFullYear()` 系で取り出す。
 *
 * 同じものが 6 つのサービスに並んでいたのでここにまとめた。
 */
import { BadRequestException } from '@nestjs/common';

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

/**
 * 画面から来た 'YYYY-MM-DD' を UTC 0 時の Date にする。`toDate` と違い形を確かめ、
 * 崩れていれば 400 で断る（クエリ文字列は検証の DTO を通らないため）。
 * 2 月 31 日のような無い日も断る（Date.UTC は黙って 3 月に繰り越す）
 */
export function parseDateKey(value: string, label: string): Date {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = parts
    ? new Date(
        Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])),
      )
    : null;

  if (
    date === null ||
    Number.isNaN(date.getTime()) ||
    fromDate(date) !== value
  ) {
    throw new BadRequestException(
      `${label}は YYYY-MM-DD の形式で指定してください`,
    );
  }
  return date;
}

/**
 * 一覧を絞る期間。両端を含む。
 *
 * **器を 2 つ持つ。** 搬入日のような `@db.Date` の列は UTC 0 時の `firstDay` / `lastDay` と、
 * createdAt のような時刻を持つ列はローカル 0 時の `since` / `until` と比べる。
 * createdAt を UTC 0 時の器と比べると JST では丸ごと 9 時間ずれる
 * （costs.service の期間と同じ理由。どの日かはローカル時刻で決める）
 */
export type Period = {
  /** 開始日のローカル 0 時 */
  since: Date;
  /** 終了日の翌日のローカル 0 時（含まない）。終了日を指定しないときは null で、先は開いたまま */
  until: Date | null;
  /** 開始日の UTC 0 時 */
  firstDay: Date;
  /** 終了日の UTC 0 時（含む）。null のときは先が開いている */
  lastDay: Date | null;
};

/**
 * 期間を決める。from / to（YYYY-MM-DD）があればその範囲、無ければ直近 days 日。
 * 片方だけの指定も受ける。開始日が無ければ直近 days 日の始まり、終了日が無ければ開いたまま
 * （直近 N 日はまだ来ていない搬入日も入れる）
 */
export function periodOf(days: number, from?: string, to?: string): Period {
  const firstDay = from
    ? parseDateKey(from, '開始日')
    : new Date(today().getTime() - days * 86_400_000);
  const lastDay = to ? parseDateKey(to, '終了日') : null;

  if (lastDay !== null && firstDay > lastDay) {
    throw new BadRequestException(
      '開始日は終了日より前の日付を指定してください',
    );
  }

  /** UTC 0 時の器が表す暦日の、ローカル 0 時 */
  const localMidnight = (day: Date, offset = 0) =>
    new Date(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate() + offset,
    );

  return {
    since: localMidnight(firstDay),
    until: lastDay === null ? null : localMidnight(lastDay, 1),
    firstDay,
    lastDay,
  };
}

/** 時刻を持つ列（createdAt など）に当てる Prisma の条件 */
export function timeRange(period: Period) {
  return period.until === null
    ? { gte: period.since }
    : { gte: period.since, lt: period.until };
}

/** `@db.Date` の列（搬入日など）に当てる Prisma の条件 */
export function dayRange(period: Period) {
  return period.lastDay === null
    ? { gte: period.firstDay }
    : { gte: period.firstDay, lte: period.lastDay };
}
