export declare class CreatePrinterAssetDto {
    companyId: number;
    department?: string | null;
    no?: string | null;
    ipAddress?: string | null;
    maker?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    purchasedOn?: string | null;
    purchasePrice?: number | null;
    contractNo?: string | null;
    countLayout?: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
    maintVendorId?: number | null;
    maintContract?: string | null;
    maintStartOn?: string | null;
    maintEndOn?: string | null;
    maintDealOn?: string | null;
    maintFee?: number | null;
    note?: string | null;
    dailyCheck?: boolean;
}
export declare class DailyCheckDto {
    dailyCheck: boolean;
}
