export declare class CreateTonerDto {
    id: string;
    name?: string | null;
    color?: string | null;
    recycled?: boolean;
    printerAssetIds?: number[];
    price?: number | null;
    effectiveFrom?: string | null;
}
