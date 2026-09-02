export declare class CreateTonerDto {
    id: string;
    name?: string | null;
    color?: string | null;
    recycled?: boolean;
    alertThreshold?: number | null;
    yieldPages?: number | null;
    printerAssetIds?: number[];
    price?: number | null;
    effectiveFrom?: string | null;
}
