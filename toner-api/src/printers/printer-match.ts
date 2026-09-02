/**
 * 端末台帳と SNMP の実機マスタの突き合わせ。
 *
 * 台帳と実機は別のテーブルで外部キーも無いので、読むときに毎回突き合わせる。
 * **シリアルを先に見て、当たらなければ IP で引く。**
 * 台帳のシリアルは手入力で、機器の交換や書き写しの間違いで実機と食い違う。
 * そこで諦めると、IP が合っていて実機も応答しているのに画面が空欄のままになる。
 *
 * ただし **他の台帳がシリアルで名指ししている実機は IP では渡さない。**
 * 同じ IP に 2 台ぶら下がっている台帳（No.041 と No.051）があり、素通しにすると
 * 実機が 1 台しか無いのに両方へ同じ情報が付く。名指しのほうが確かなので、
 * シリアルで当たった台帳が優先で、IP しか手がかりのない台帳は引き下がる。
 *
 * 同じ突き合わせを台帳の一覧・機種別の一覧・運用コストの 3 か所で行うので、
 * 順序を変えたときに 1 か所だけ直し漏れないようここに置く。
 * 逆向き（実機 → 台帳）は page-counts.service に別にある。あちらは 1 つの IP に
 * 台帳が複数当たるため、絞れないときは決めない、という扱いが要る。
 */

/** 突き合わせに使う実機の列 */
export type PrinterKeys = { ipAddress: string; serialNumber: string | null };

/** 突き合わせに使う台帳の列。どちらも未入力があり得る */
export type AssetKeys = {
  ipAddress: string | null;
  serialNumber: string | null;
};

export type PrinterIndex<T> = {
  /** 小文字にしたシリアル → 実機 */
  bySerial: Map<string, T>;
  byIp: Map<string, T>;
  /** どれかの台帳がシリアルで名指ししている実機の IP。IP 引きでは渡さない */
  claimedIps: Set<string>;
};

/**
 * 実機の一覧から索引を作る。台数分の走査を 1 回で済ませる。
 *
 * 台帳も受け取るのは、**どの実機がシリアルで名指しされているかを先に決める**ため。
 * 1 台ずつ突き合わせながらでは、後ろに出てくる台帳の名指しが分からず、
 * 台帳の並び順で結果が変わってしまう
 */
export function indexPrinters<T extends PrinterKeys>(
  printers: T[],
  assets: AssetKeys[],
): PrinterIndex<T> {
  const bySerial = new Map<string, T>();
  const byIp = new Map<string, T>();

  for (const printer of printers) {
    if (printer.serialNumber) {
      bySerial.set(printer.serialNumber.toLowerCase(), printer);
    }
    byIp.set(printer.ipAddress, printer);
  }

  const claimedIps = new Set<string>();
  for (const asset of assets) {
    if (!asset.serialNumber) continue;
    const claimed = bySerial.get(asset.serialNumber.toLowerCase());
    if (claimed) claimedIps.add(claimed.ipAddress);
  }

  return { bySerial, byIp, claimedIps };
}

/**
 * その台帳に対応する実機。見つからなければ null。
 *
 * シリアルで当たればそれ。当たらなければ IP で引く（台帳のシリアルが
 * 空でも、実機と食い違っていても同じ扱い。どちらも「手がかりは IP だけ」）。
 *
 * IP で引けるのは、その実機を他の台帳がシリアルで名指ししていないときだけ。
 * 名指しされているなら、そちらが本物でこの台帳は別の機器を指している
 */
export function matchPrinter<T>(
  asset: AssetKeys,
  index: PrinterIndex<T>,
): T | null {
  if (asset.serialNumber) {
    const bySerial = index.bySerial.get(asset.serialNumber.toLowerCase());
    if (bySerial) return bySerial;
  }

  if (!asset.ipAddress) return null;
  if (index.claimedIps.has(asset.ipAddress)) return null;
  return index.byIp.get(asset.ipAddress) ?? null;
}
