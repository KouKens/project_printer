import { BadRequestException } from '@nestjs/common';
import { dayRange, parseDateKey, periodOf, timeRange, today } from './date';

/**
 * 一覧を絞る期間。@db.Date の列と時刻を持つ列で器が違うので、
 * 片方の器でもう片方を比べると JST では 9 時間ずれる
 */
describe('periodOf', () => {
  it('日付の指定は両端を含む。時刻の列は終了日の翌日 0 時（ローカル）の手前まで', () => {
    const period = periodOf(90, '2026-09-01', '2026-09-30');

    expect(dayRange(period)).toEqual({
      gte: new Date(Date.UTC(2026, 8, 1)),
      lte: new Date(Date.UTC(2026, 8, 30)),
    });
    expect(timeRange(period)).toEqual({
      gte: new Date(2026, 8, 1),
      lt: new Date(2026, 9, 1),
    });
  });

  it('同じ日を開始日と終了日にすれば、その 1 日だけ', () => {
    const period = periodOf(90, '2026-09-14', '2026-09-14');

    expect(timeRange(period)).toEqual({
      gte: new Date(2026, 8, 14),
      lt: new Date(2026, 8, 15),
    });
  });

  it('日付が無ければ直近 days 日で、先は開いたまま', () => {
    const period = periodOf(30);

    const start = new Date(today().getTime() - 30 * 86_400_000);
    expect(dayRange(period)).toEqual({ gte: start });
    expect(timeRange(period)).toEqual({
      gte: new Date(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate(),
      ),
    });
  });

  it('開始日が終了日より後なら 400', () => {
    expect(() => periodOf(90, '2026-09-30', '2026-09-01')).toThrow(
      BadRequestException,
    );
  });
});

describe('parseDateKey', () => {
  it('YYYY-MM-DD を UTC 0 時にする', () => {
    expect(parseDateKey('2026-09-01', '開始日')).toEqual(
      new Date(Date.UTC(2026, 8, 1)),
    );
  });

  it('形が崩れていれば 400', () => {
    expect(() => parseDateKey('2026/09/01', '開始日')).toThrow(
      '開始日は YYYY-MM-DD の形式で指定してください',
    );
  });

  it('無い日は 3 月に繰り越さずに断る', () => {
    expect(() => parseDateKey('2026-02-31', '終了日')).toThrow(
      BadRequestException,
    );
  });
});
