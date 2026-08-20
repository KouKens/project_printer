export declare class BulkPrinterEntryDto {
    ipAddress: string;
    location?: string;
}
export declare class BulkCreatePrintersDto {
    printers: BulkPrinterEntryDto[];
    community?: string;
    fillLocationFromLedger?: boolean;
}
