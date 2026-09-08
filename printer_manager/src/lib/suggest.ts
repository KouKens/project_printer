/**
 * 入力欄に出す「過去に入力した値」の候補。
 *
 * `<input list>` と `<datalist>` の組み合わせで出す。**候補は縛りではない。**
 * 一覧に無い値も自由に打てるので、表記を揃えたいが決め打ちにはできない欄
 * （部署・メーカー・型番など）に向く。
 *
 * 候補は登録済みの一覧から作る。どの画面も保存済みの行を最初から読み込んで
 * いるので、**新しい API も追加のリクエストも要らない。**
 */
import { foldKey } from './fold';

/**
 * 値の並べ方。
 *
 * `count` = よく使われている順。同じ型番の機器が何台もある、という偏りを
 *   そのまま活かせるので、候補の先頭に「いつも打つ値」が来る。
 * `name`  = 五十音・英数順。件数に差が無く、探して選ぶほうが早い欄向け。
 */
export type SuggestOrder = 'count' | 'name';

/**
 * 畳んだグループの中で、候補として見せる 1 つを選ぶ。
 *
 * **いちばん多く使われている表記を採る。** 実際の台帳で優勢な書き方が
 * そのまま「その職場の正しい書き方」になっているため。
 * 同数のときは名前順にして、呼ぶたびに並びが変わらないようにする
 */
function representative(variants: Map<string, number>): string {
  let best = '';
  let bestCount = -1;

  for (const [text, count] of variants) {
    const wins =
      count > bestCount ||
      (count === bestCount &&
        text.localeCompare(best, 'ja', { numeric: true }) < 0);
    if (wins) {
      best = text;
      bestCount = count;
    }
  }
  return best;
}

/**
 * 保存済みの値から候補を作る。
 *
 * 前後の空白を落とし、空欄と重複を除く。**大文字小文字と全角半角は畳む**ので、
 * `RICOH` と `Ricoh`、`3階病棟` と `３階病棟` はそれぞれ 1 件にまとまり、
 * 多いほうの表記で出る。候補から選んでいれば表記が寄っていく。
 *
 * 畳むと、台帳に残っている少数派の表記は候補に出なくなる。**それでも
 * 自由入力はできる**ので、あえて別表記で登録したいときは打てばよい。
 *
 * @param values 保存済みの値（未入力は null で混ざっていてよい）
 * @param order  並べ方。既定はよく使われている順
 */
export function suggestions(
  values: (string | null | undefined)[],
  order: SuggestOrder = 'count',
): string[] {
  /** 畳んだ鍵 → 表記ごとの件数 */
  const groups = new Map<string, Map<string, number>>();

  for (const value of values) {
    const text = value?.trim();
    if (!text) continue;

    const key = foldKey(text);
    const variants = groups.get(key) ?? new Map<string, number>();
    variants.set(text, (variants.get(text) ?? 0) + 1);
    groups.set(key, variants);
  }

  const rows = [...groups.values()].map((variants) => ({
    label: representative(variants),
    // 畳んだぶんを合わせた件数。並べ替えはグループ単位で見る
    total: [...variants.values()].reduce((sum, count) => sum + count, 0),
  }));

  if (order === 'name') {
    return rows
      .map((row) => row.label)
      .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
  }

  return rows
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.label.localeCompare(b.label, 'ja', { numeric: true }),
    )
    .map((row) => row.label);
}
