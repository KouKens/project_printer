export type PrinterKeys = {
    ipAddress: string;
    serialNumber: string | null;
};
export type AssetKeys = {
    ipAddress: string | null;
    serialNumber: string | null;
};
export type PrinterIndex<T> = {
    bySerial: Map<string, T>;
    byIp: Map<string, T>;
    claimedIps: Set<string>;
};
export declare function indexPrinters<T extends PrinterKeys>(printers: T[], assets: AssetKeys[]): PrinterIndex<T>;
export declare function matchPrinter<T>(asset: AssetKeys, index: PrinterIndex<T>): T | null;
