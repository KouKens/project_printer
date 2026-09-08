/**
 * 新規登録（POST）と部分更新（PATCH）で「未指定」の意味が違うので、
 * DTO を Prisma の data に写すときにそこだけを切り替える。
 *
 * **create は未指定を既定値に潰す。** 行を新しく作るので全列を埋める必要がある。
 *
 * **update は未指定を undefined のまま残す。** Prisma は data の undefined を
 * 「この列は変更しない」と読むので、画面が送らなかった項目が既定値に戻らない。
 *
 * 「値を消す」は画面が明示的に null を送る（DTO の `@IsOptional()` は
 * null と undefined のどちらも素通しするので、両者を区別できる）。
 *
 * 未指定と null を同じ扱いにしていたために、端末台帳の `countLayout` が
 * 保存のたび TOTAL に戻り、修理履歴の `status` が調査中に戻る事故が起きていた。
 * 入力欄を持たない列を足すたびに再発するので、仕組みの側で塞いでいる。
 */
export type WriteMode = 'create' | 'update';

/**
 * 1 つの列の値を決める。
 *
 * @param mode     create なら未指定を fallback に、update なら undefined にする
 * @param value    DTO の値。undefined は「送られてこなかった」
 * @param map      値が来ていたときの変換（文字列の trim、日付の解釈など）
 * @param fallback create で未指定だったときに入れる既定値
 */
export function field<In, Out>(
  mode: WriteMode,
  value: In | undefined,
  map: (value: In) => Out,
  fallback: Out,
): Out | undefined {
  if (value !== undefined) return map(value);
  return mode === 'create' ? fallback : undefined;
}

/** 変換の要らない列（数値・列挙）用。値をそのまま通す */
export function asIs<T>(value: T): T {
  return value;
}
