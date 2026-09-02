/**
 * 実機の累計カウンタの単位（prtMarkerCounterUnit）。
 *
 * **枚数とは限らない。** 一般のプリンターは 7（インプレッション＝枚）を返すが、
 * SATO のラベルプリンター（HC4-LX）は 17（メートル）で印字した長さを返してくる。
 * 単位を見ずに足すと長さと枚数が混ざるので、集計の前に必ず分ける。
 *
 * API 側の printers/snmp.service.ts と同じ内容。別のバンドルなので写しになっている
 */

export const COUNTER_UNIT = {
  /** インプレッション。一般のプリンターの「枚」 */
  IMPRESSIONS: 7,
  SHEETS: 8,
  /** メートル。SATO のラベルプリンター */
  METERS: 17,
} as const;

/**
 * 枚で数える機器か。
 * 単位を返さない（null）機種は、これまでどおり枚として扱う
 */
export function isSheetUnit(unit: number | null): boolean {
  if (unit === null) return true;
  return unit === COUNTER_UNIT.IMPRESSIONS || unit === COUNTER_UNIT.SHEETS;
}

/** 長さ（メートル）で数える機器か */
export function isMeterUnit(unit: number | null): boolean {
  return unit === COUNTER_UNIT.METERS;
}
