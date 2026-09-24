import { useId } from 'react';
import './SearchBox.css';

/**
 * 一覧を絞り込む「探す」欄。**どの画面にも同じ形で置く。**
 *
 * **打つたびに API を叩かない。** 絞るのは画面が持っている行だけで、
 * 当てるのは `lib/search.ts` の `searchWords()` と `hits()`。
 * 取り直すのは各画面の「一覧を更新」や、画面を開き直したとき。
 *
 * 出るのは**いま出ている行数**。0 件になったときに、
 * 記録が無いのか絞り込みで消えたのかが分かるようにするため
 * （1 画面に表が 2 つ以上あるときは `label` でどちらの表かを添える）。
 */
type Props = {
  value: string;
  onChange: (value: string) => void;
  /** 何で探せるかを並べる（例: 部署・No.・IP・型番） */
  placeholder: string;
  /** 絞り込んだあとの行数 */
  count: number;
  /** 絞り込む前の行数 */
  total: number;
  /** 欄の名前。1 画面に表が 2 つ以上あるときは「探す（履歴）」のようにする */
  label?: string;
  /** 数える単位。「台」「件」「品番」など */
  unit?: string;
};

export default function SearchBox({
  value,
  onChange,
  placeholder,
  count,
  total,
  label = '探す',
  unit = '件',
}: Props) {
  const id = useId();

  return (
    <label className="sbx" htmlFor={id}>
      <span className="sbx-label">
        {label}
        {/* 打っている間だけ結果を添える。0 件でも欄は消さない（打ち直せるように） */}
        {value.trim() !== '' && (
          <span className={`sbx-count${count === 0 ? ' sbx-count-none' : ''}`}>
            {count} / {total} {unit}
          </span>
        )}
      </span>
      <input
        id={id}
        className="sbx-input"
        // search にすると Edge / Chrome が消す × と Esc での取り消しを出してくれる
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // 空白で区切ると AND。狭い欄なので、置き場所は説明ではなく title に持たせる
        title={`${placeholder} で探します。空白で区切ると、どちらも含む行だけになります（例: 予約外来 canon）`}
      />
    </label>
  );
}
