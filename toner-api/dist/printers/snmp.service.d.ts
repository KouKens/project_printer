export type SnmpVersionKey = 'V1' | 'V2C';
export type SupplySnapshot = {
    supplyIndex: number;
    name: string;
    supplyType: number | null;
    supplyClass: number | null;
    colorant: string | null;
    level: number;
    maxCapacity: number;
    percent: number | null;
};
export type AlertSnapshot = {
    alertIndex: number;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
};
export declare function isReplaceablePart(supply: {
    supplyType: number | null;
}): boolean;
export type CountSource = 'vendor' | 'mono-only' | 'none';
export type PrinterSnapshot = {
    version: SnmpVersionKey;
    hostName: string | null;
    model: string | null;
    serialNumber: string | null;
    macAddress: string | null;
    pageCount: number | null;
    monoCount: number | null;
    colorCount: number | null;
    countSource: CountSource;
    supplies: SupplySnapshot[];
    alerts: AlertSnapshot[];
    consoleText: string | null;
};
export declare class SnmpUnreachableError extends Error {
}
export declare class SnmpService {
    private readonly logger;
    poll(ipAddress: string, community: string, preferred?: SnmpVersionKey): Promise<PrinterSnapshot>;
    private pollWith;
    private readAlerts;
    private readConsoleText;
    private readSupplies;
    private readCounts;
    private readCounterTable;
    private get;
    private walk;
}
