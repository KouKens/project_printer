import { PAGE_COUNT_CRON } from './page-counts.service';
import { PRINTER_POLL_CRON } from './printers.service';

/**
 * 定期実行の 2 本が重ならないことを見張る。
 *
 * どちらも SNMP で全機器を順に歩くが、**順なのは各ジョブの中だけ**で、
 * 2 本の @Cron は別々の非同期処理として並走する。同じ時刻に置くと 1 台の機器に
 * 両方の問い合わせが同時に届き、UDP なので返事が落ちて消耗品の表が
 * 後ろから欠ける（ドラム・定着が「無い」ことにされる）。
 *
 * 実際に両方 '0 12 * * *' になっていた。時刻を直すのは 1 文字なので、
 * 気づかず戻せてしまう。ここで落とす
 */
describe('定期実行の時刻', () => {
  /** 'm h * * *' から「その日の何分目か」を出す。曜日・日の指定は使っていない */
  function minuteOfDay(expression: string): number {
    const [minute, hour, ...rest] = expression.split(' ');
    expect(rest).toEqual(['*', '*', '*']);

    const m = Number(minute);
    const h = Number(hour);
    // 「毎時」「*/5」のような書き方になったらこの計算は使えない
    expect(Number.isInteger(m)).toBe(true);
    expect(Number.isInteger(h)).toBe(true);
    return h * 60 + m;
  }

  it('枚数の記録と残量の取り直しが同じ時刻にならない', () => {
    expect(PAGE_COUNT_CRON).not.toBe(PRINTER_POLL_CRON);
  });

  it('2 本のあいだが 10 分以上空いている', () => {
    /*
     * 全 56 台で枚数は 2 分ほど、残量は 21 秒ほど。応答しない機器の
     * 待ち時間で伸びるので、余裕を見て 10 分を下限にしておく
     */
    const gap = Math.abs(
      minuteOfDay(PRINTER_POLL_CRON) - minuteOfDay(PAGE_COUNT_CRON),
    );
    expect(gap).toBeGreaterThanOrEqual(10);
  });
});
