export declare class StockTakeCountDto {
    tonerId: string;
    counted: number;
}
export declare class StockTakeDto {
    userId?: string;
    companyId: number;
    counts: StockTakeCountDto[];
}
