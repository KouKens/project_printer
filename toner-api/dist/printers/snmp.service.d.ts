export type SnmpVersionKey = 'V1' | 'V2C';
export declare const COUNTER_UNIT: {
    readonly IMPRESSIONS: 7;
    readonly SHEETS: 8;
    readonly METERS: 17;
};
export declare function isSheetUnit(unit: number | null): boolean;
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
export type ColumnStatus = {
    name: string;
    oid: string;
    rows: number;
    complete: boolean;
};
export type AlertSnapshot = {
    alertIndex: number;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
};
export type CountSource = 'vendor' | 'mono-only' | 'none';
export type CountMatrix = {
    printMono: number | null;
    printColor: number | null;
    copyMono: number | null;
    copyColor: number | null;
    scanMono: number | null;
    scanColor: number | null;
};
export type PrinterSnapshot = CountMatrix & {
    version: SnmpVersionKey;
    hostName: string | null;
    model: string | null;
    serialNumber: string | null;
    macAddress: string | null;
    pageCount: number | null;
    counterUnit: number | null;
    monoCount: number | null;
    colorCount: number | null;
    countSource: CountSource;
    supplies: SupplySnapshot[];
    suppliesComplete: boolean;
    alerts: AlertSnapshot[];
    consoleText: string | null;
};
export type SupplyDump = {
    version: SnmpVersionKey;
    sysDescr: string | null;
    columns: ColumnStatus[];
    supplies: SupplySnapshot[];
    alerts: AlertSnapshot[];
    consoleText: string | null;
};
export type CounterDump = {
    version: SnmpVersionKey;
    vendor: 'ricoh' | 'canon' | null;
    sysDescr: string | null;
    counters: {
        id: number;
        name: string | null;
        value: number;
    }[];
};
export declare class SnmpUnreachableError extends Error {
}
export declare class SnmpService {
    private readonly logger;
    poll(ipAddress: string, community: string, preferred?: SnmpVersionKey): Promise<PrinterSnapshot>;
    dumpCounters(ipAddress: string, community: string, preferred?: SnmpVersionKey): Promise<CounterDump>;
    private dumpCountersWith;
    private pollWith;
    dumpSupplies(ipAddress: string, community: string, preferred?: SnmpVersionKey): Promise<SupplyDump>;
    private dumpSuppliesWith;
    private readAlerts;
    private readConsoleText;
    private readSupplies;
    private readCounts;
    private ricohCounts;
    private canonCounts;
    private epsonCounts;
    private readCanonCounters;
    private readCounterTable;
    private get;
    private walkAll;
    private walk;
    private walkOnce;
}
