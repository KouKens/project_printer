import type { PeriodState } from '../lib/period';

type Props = {
  /** `usePeriod()` の戻り */
  state: PeriodState;
  /** 「直近 N 日」の選択肢 */
  choices: readonly number[];
};

/**
 * 期間の選び方。「直近 N 日」のプルダウンの最後に「日付を指定」を置き、
 * 選ぶと開始日・終了日の欄が出る。
 * `dt-tools` の中に置く前提で、ラベルを横に並べるだけ（外側の箱は持たない）
 */
export default function PeriodPicker({ state, choices }: Props) {
  const { byDate, days, from, to, setByDate, setDays, setFrom, setTo } = state;

  return (
    <>
      <label>
        <span>期間</span>
        <select
          value={byDate ? 'range' : String(days)}
          onChange={(e) => {
            const value = e.target.value;
            setByDate(value === 'range');
            if (value !== 'range') setDays(Number(value));
          }}
        >
          {choices.map((d) => (
            <option key={d} value={d}>
              直近 {d} 日
            </option>
          ))}
          <option value="range">日付を指定</option>
        </select>
      </label>

      {byDate && (
        <>
          <label>
            <span>開始日</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            <span>終了日</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </>
      )}
    </>
  );
}
