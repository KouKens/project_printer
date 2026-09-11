import { useState } from 'react';
import { saveCsv } from '../lib/csv';
import type { CsvValue } from '../lib/csv';
import './CsvButton.css';

/**
 * その表を CSV に落とすボタン。**どの画面にも同じ形で置く。**
 *
 * 出すのは**今その画面に出ている行**（絞り込みと並べ替えを通したもの）。
 * 押した時点で持っている値をそのまま書くので、API にも実機にも問い合わせない。
 *
 * 行は関数で受け取る。表が大きい画面（機器一覧は 60 台 × 30 列）で、
 * 描き直しのたびに書き出し用の行まで作り直さないため
 */
type Props = {
  /** ファイル名の頭。日付と拡張子は `csvFileName` が付ける */
  name: string;
  /** 見出しの行。行の並びと同じ数・同じ順にすること */
  header: string[];
  /** 押したときに本文を作る */
  rows: () => CsvValue[][];
  /** 出せる行数。0 なら押せない */
  count: number;
  /** 1 画面に表が 2 つ以上あるときは、どちらの表かが分かる文言にする */
  label?: string;
  title?: string;
};

export default function CsvButton({
  name,
  header,
  rows,
  count,
  label = 'CSV で保存',
  title,
}: Props) {
  /** 押したことが分かる状態。ダウンロードは画面が変わらないので合図が要る */
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveCsv(name, header, rows());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button
      className="csv-btn"
      type="button"
      disabled={count === 0}
      onClick={save}
      title={
        title ??
        (count === 0
          ? '出せる行がありません'
          : `いま出ている ${count} 行を CSV（Excel で開けます）に保存します`)
      }
    >
      {saved ? '保存しました' : label}
    </button>
  );
}
