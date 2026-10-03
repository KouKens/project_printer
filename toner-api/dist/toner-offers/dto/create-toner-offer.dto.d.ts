import type { SupplyPartInput } from '../../common/supply-part';
export declare const OFFER_KINDS: readonly ["GENUINE", "RECYCLED", "COMPATIBLE"];
export declare const PURCHASE_TYPES: readonly ["SPOT", "ONLINE", "CONTRACT", "SUBSCRIPTION", "OTHER"];
export type OfferKindInput = (typeof OFFER_KINDS)[number];
export type PurchaseTypeInput = (typeof PURCHASE_TYPES)[number];
export declare class OfferModelDto {
    maker?: string | null;
    model: string;
}
export declare class CreateTonerOfferDto {
    code: string;
    name?: string | null;
    brand?: string | null;
    kind?: OfferKindInput;
    part?: SupplyPartInput;
    color?: string | null;
    yieldPages?: number | null;
    packQuantity?: number;
    seller: string;
    purchaseType?: PurchaseTypeInput;
    price?: number | null;
    pagePrice?: number | null;
    monthlyFee?: number | null;
    shippingFee?: number | null;
    minOrder?: number | null;
    leadTime?: string | null;
    warranty?: string | null;
    takesBack?: boolean | null;
    payment?: string | null;
    quotedOn?: string | null;
    validUntil?: string | null;
    reference?: string | null;
    url?: string | null;
    contact?: string | null;
    note?: string | null;
    models?: OfferModelDto[];
}
