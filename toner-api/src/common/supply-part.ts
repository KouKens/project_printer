/**
 * 消耗品の種類（トナー登録・トナー情報の `part`）。スキーマの enum SupplyPart と同じ並び。
 *
 * **比べる相手を揃えるために持つ。** ドラムにも色が付いているので、色だけでまとめると
 * 黒のドラムが黒のトナーと同じ並びに入り、トナー価格比較の基準が狂う
 */
export const SUPPLY_PARTS = [
  'TONER',
  'DRUM',
  'WASTE',
  'MAINTENANCE',
  'OTHER',
] as const;

export type SupplyPartInput = (typeof SUPPLY_PARTS)[number];
