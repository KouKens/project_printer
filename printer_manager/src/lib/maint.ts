/**
 * 保守の有無は、台帳の保守開始日・終了日から出す。
 * 日付が無くて判定できないときだけ、手入力の「有」「×」を使う。
 * 端末情報の画面と機器一覧で同じ判定を使う。
 */
import { todayIso } from './date';

export type MaintStatus = '有' | '×' | '不整合';

/** 手で選べる値。日付から判定できないときだけ使う */
export const MANUAL_MAINT: MaintStatus[] = ['有', '×'];

/** 手入力の値。'有' '×' 以外（元台帳の書き込みなど）は判定に使わない */
function manualStatus(maintContract: string | null): MaintStatus | null {
  const value = maintContract?.trim() ?? '';
  return MANUAL_MAINT.find((allowed) => allowed === value) ?? null;
}

/**
 * 保守の状態を出す。
 *
 * - 終了日が開始日より前 → 不整合。入力の誤りなので有無を判定しない
 * - 終了日が今日を過ぎていなければ有、過ぎていれば ×
 * - 終了日が未入力なら、手入力の「有」「×」があればそれ。無ければ判定しない
 *
 * 開始日は判定には使わず、終了日との前後関係を見るためだけに受け取る。
 * 開始日が無い機器（2 件ある）は前後を比べようがないので不整合にはならない。
 *
 * **日付があるときは日付を優先する。** 期限の過ぎた契約を手入力の「有」で
 * 上書きできてしまうと、保守切れの機器が一覧から消えるため。
 */
export function maintStatus(
  maintEndOn: string | null,
  maintStartOn: string | null = null,
  maintContract: string | null = null,
): MaintStatus | null {
  if (!maintEndOn) return manualStatus(maintContract);
  // ISO の日付文字列は桁が揃っているので、そのまま比べてよい
  if (maintStartOn && maintEndOn < maintStartOn) return '不整合';
  return maintEndOn >= todayIso() ? '有' : '×';
}

/** 期限切れか。終了日が過ぎているものだけを指し、不整合は含めない */
export function isMaintExpired(
  maintEndOn: string | null,
  maintStartOn: string | null = null,
  maintContract: string | null = null,
): boolean {
  return maintStatus(maintEndOn, maintStartOn, maintContract) === '×';
}
