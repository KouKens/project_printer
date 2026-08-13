export type SnmpVersionKey = 'V1' | 'V2C';
export type SupplySnapshot = {
    supplyIndex: number;
    name: string;
    colorant: string | null;
    level: number;
    maxCapacity: number;
    percent: number | null;
};
export type PrinterSnapshot = {
    version: SnmpVersionKey;
    hostName: string | null;
    model: string | null;
    serialNumber: string | null;
    macAddress: string | null;
    pageCount: number | null;
    supplies: SupplySnapshot[];
};
export declare class SnmpUnreachableError extends Error {
}
export declare class SnmpService {
    private readonly logger;
    poll(ipAddress: string, community: string, preferred?: SnmpVersionKey): Promise<PrinterSnapshot>;
    private pollWith;
    private readSupplies;
    private get;
    private walk;
}
