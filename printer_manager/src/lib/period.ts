import { useMemo, useState } from 'react';
import { isoDaysAgo, todayIso } from './date';

/**
 * 一覧を絞る期間。「直近 N 日」か、開始日・終了日（YYYY-MM-DD・両端を含む）。
 * 選ぶ部品は `components/PeriodPicker`。印刷状況とトナー入出状況が使う
 */
export type Period = { days: number } | { from: string; to: string };

/**
 * API に渡すクエリ。日付を指定したときは日付だけを、そうでなければ日数を渡す
 * （受け取る側は from / to があればそちらを使う。`common/date.ts` の `periodOf`）。
 * 空の日付は送らない —— 欄を消したときに `from=` を送ると形が崩れたとして断られる
 */
export function periodQuery(period: Period): string {
  if ('days' in period) return `days=${period.days}`;
  const params = new URLSearchParams();
  if (period.from) params.set('from', period.from);
  if (period.to) params.set('to', period.to);
  return params.toString();
}

/**
 * 期間の状態。直近の日数と指定の日付を別々に持つので、
 * 行き来しても打った日付も選んだ日数も消えない。
 * 指定の日付の初期値は、最初に見ている直近の期間に合わせる
 */
export function usePeriod(initialDays: number) {
  const [days, setDays] = useState(initialDays);
  /** 日付を直に指定するか。false のときは直近 days 日 */
  const [byDate, setByDate] = useState(false);
  const [from, setFrom] = useState(() => isoDaysAgo(initialDays - 1));
  const [to, setTo] = useState(() => todayIso());

  return useMemo(() => {
    const period: Period = byDate ? { from, to } : { days };
    return {
      days,
      byDate,
      from,
      to,
      setDays,
      setByDate,
      setFrom,
      setTo,
      /** 読み込みの依存に入れる値。期間が変わったときだけ変わる */
      period,
      /** 見出しに出す期間。指定か直近かで書き分ける */
      label: byDate ? `${from} 〜 ${to}` : `直近 ${days} 日`,
    };
  }, [byDate, days, from, to]);
}

export type PeriodState = ReturnType<typeof usePeriod>;
