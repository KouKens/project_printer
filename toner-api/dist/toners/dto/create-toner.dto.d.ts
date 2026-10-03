import type { SupplyPartInput } from '../../common/supply-part';
export declare class CreateTonerDto {
    id: string;
    name?: string | null;
    color?: string | null;
    part?: SupplyPartInput;
    recycled?: boolean;
    genuineId?: string | null;
    hidden?: boolean;
    alertThreshold?: number | null;
    yieldPages?: number | null;
    printerAssetIds?: number[];
    price?: number | null;
    effectiveFrom?: string | null;
}
