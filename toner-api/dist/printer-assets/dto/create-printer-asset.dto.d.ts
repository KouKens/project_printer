export declare class CreatePrinterAssetDto {
    department?: string | null;
    no?: string | null;
    ipAddress?: string | null;
    maker?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    purchasedOn?: string | null;
    contractNo?: string | null;
    countLayout?: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';
    maintContract?: string | null;
    maintStartOn?: string | null;
    maintEndOn?: string | null;
    maintDealOn?: string | null;
    maintFee?: number | null;
    note?: string | null;
}
