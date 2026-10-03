import { useCompany } from '../lib/company';
import './CompanyPicker.css';

/**
 * 拠点を選ぶ欄。**拠点ごとに数える 4 画面（持出/廃棄・注文/搬入・棚卸・トナー個数状況）
 * だけに置く。**それ以外の画面は全拠点をまとめて出すので置かない。
 *
 * 選んだ拠点は 4 画面で共通で、端末にも覚えさせる（`lib/company.ts`）。
 * 同じ端末は同じ拠点で使い続けることがほとんどで、画面を移るたびに
 * 選び直させると、選び忘れたまま別の拠点の在庫を動かしてしまうため。
 *
 * 見た目は置いた先の道具欄（`dt-tools` など）の label ＋ select に合わせる。
 * 伝票の画面（持出/廃棄・注文/搬入）では見出しの横に置く。
 */
type Props = {
  /**
   * 切り替える前に呼ぶ。false を返すと切り替えない。
   * 入力途中のものがその拠点に属しているとき（棚卸の実数）に、
   * 確かめてから捨てるために使う。残したまま切り替えると別の拠点へ書き戻してしまう
   */
  beforeChange?: () => boolean;
  disabled?: boolean;
};

export default function CompanyPicker({ beforeChange, disabled }: Props) {
  const { companies, companyId, select } = useCompany();

  return (
    <label className="cpk">
      <span className="cpk-label">拠点</span>
      <select
        className="cpk-select"
        value={companyId ?? ''}
        onChange={(e) => {
          // 断られたら選択は元のまま（value は companyId から描き直される）
          if (beforeChange && !beforeChange()) return;
          select(Number(e.target.value));
        }}
        disabled={disabled || companies.length === 0}
        title={
          companies.length === 0
            ? '拠点が登録されていません。「登録 → 拠点登録」で追加してください'
            : 'この画面は選んだ拠点の在庫と受け払いだけを扱います。' +
              '選んだ拠点は持出/廃棄・注文/搬入・棚卸・トナー個数状況で共通です'
        }
      >
        {companies.length === 0 ? (
          <option value="">拠点が未登録</option>
        ) : (
          companies.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
