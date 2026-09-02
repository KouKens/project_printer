/**
 * prtMarkerSuppliesType（RFC 3805）の分類。
 *
 * **「印刷のたびに減って、無くなったら補充するもの」と「交換部品」を分ける。**
 * 前者は残量として一覧に出し、後者は交換時期の警告として扱う。
 *
 * 同じ判定を実機の取得（snmp.service）と機種の色数（printer-assets.service）で
 * 使うのでここに置く。画面側にも同じ表があるが、別のバンドルなので
 * import できない。片方を直したらもう片方も直すこと
 * （printer_manager の PrinterListScreen.tsx）。
 */

/**
 * 印刷に使う消耗品。これ以外は交換部品として扱う。
 *
 * リボン（7・13）はラベルプリンターの消耗品。トナーやインクと同じく
 * 印刷のたびに減り、無くなったら巻き替えるものなので消耗品側に入れる。
 * 部品扱いにすると、ふつうのリボン交換が「交換部品の交換時期」の警告になってしまう
 */
export const CONSUMABLE_TYPES = [
  3, // toner
  5, // ink
  6, // inkCartridge
  7, // inkRibbon — 熱転写リボン（SATO などのラベルプリンター）
  13, // ribbonWax — ワックスリボン
  21, // tonerCartridge
];

/** トナー・インク・リボン以外の交換部品か */
export function isReplaceablePart(supply: {
  supplyType: number | null;
}): boolean {
  // 種別を返さない機種は判断できないので、部品扱いにはしない
  if (supply.supplyType === null) return false;
  return !CONSUMABLE_TYPES.includes(supply.supplyType);
}
