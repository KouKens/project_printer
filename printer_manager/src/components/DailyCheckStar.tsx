import './DailyCheckStar.css';

/**
 * 毎日チェックの ★。プリンター状況とプリンター登録の一覧で同じものを使う。
 *
 * **押した時点で保存する**（呼ぶ側が `saveDailyCheck` を叩く）。
 * 行の背景色は修理中・交換部品・保守切れがもう使っているので、
 * 印は色の付いた ★ にして行の色とは重ねない
 */
export default function DailyCheckStar({
  on,
  label,
  disabled,
  onToggle,
}: {
  on: boolean;
  /** 読み上げと説明に使う、その台の呼び名（「医事課 No.012」など） */
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={on ? 'dcs dcs-on' : 'dcs'}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      aria-label={`${label} を毎日チェックする`}
      title={
        on
          ? '毎日チェックに入っています。押すと外します（押した時点で保存）'
          : '押すと毎日チェックに入れ、プリンター状況の上の表に並べます（押した時点で保存）'
      }
    >
      {on ? '★' : '☆'}
    </button>
  );
}
