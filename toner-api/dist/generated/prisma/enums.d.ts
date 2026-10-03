export declare const TonerAction: {
    readonly REGISTER: "REGISTER";
    readonly RECEIVE: "RECEIVE";
    readonly ISSUE: "ISSUE";
    readonly DISPOSE: "DISPOSE";
    readonly ADJUST: "ADJUST";
};
export type TonerAction = (typeof TonerAction)[keyof typeof TonerAction];
export declare const SnmpVersion: {
    readonly V1: "V1";
    readonly V2C: "V2C";
};
export type SnmpVersion = (typeof SnmpVersion)[keyof typeof SnmpVersion];
export declare const PrinterProtocol: {
    readonly SNMP: "SNMP";
    readonly SATO_ENQ: "SATO_ENQ";
};
export type PrinterProtocol = (typeof PrinterProtocol)[keyof typeof PrinterProtocol];
export declare const RepairCategory: {
    readonly PART_REPLACEMENT: "PART_REPLACEMENT";
    readonly SENSOR_DIRT: "SENSOR_DIRT";
    readonly PAPER_JAM: "PAPER_JAM";
    readonly PRINT_QUALITY: "PRINT_QUALITY";
    readonly SERVICE_CALL: "SERVICE_CALL";
    readonly FEED_FAILURE: "FEED_FAILURE";
    readonly FUSING_FAILURE: "FUSING_FAILURE";
    readonly NETWORK: "NETWORK";
    readonly NOISE_SMELL: "NOISE_SMELL";
    readonly NO_POWER: "NO_POWER";
    readonly OTHER: "OTHER";
};
export type RepairCategory = (typeof RepairCategory)[keyof typeof RepairCategory];
export declare const RepairHandler: {
    readonly IN_HOUSE: "IN_HOUSE";
    readonly VENDOR: "VENDOR";
};
export type RepairHandler = (typeof RepairHandler)[keyof typeof RepairHandler];
export declare const RepairStatus: {
    readonly INVESTIGATING: "INVESTIGATING";
    readonly INQUIRING: "INQUIRING";
    readonly AWAITING_REPLY: "AWAITING_REPLY";
    readonly QUOTING: "QUOTING";
    readonly SETTLING: "SETTLING";
    readonly SHIPPED: "SHIPPED";
    readonly RECEIVED: "RECEIVED";
    readonly DONE: "DONE";
};
export type RepairStatus = (typeof RepairStatus)[keyof typeof RepairStatus];
export declare const CountLayout: {
    readonly TOTAL: "TOTAL";
    readonly MONO_COLOR: "MONO_COLOR";
    readonly COLOR_MONO: "COLOR_MONO";
};
export type CountLayout = (typeof CountLayout)[keyof typeof CountLayout];
export declare const OrderStatus: {
    readonly PENDING: "PENDING";
    readonly RECEIVED: "RECEIVED";
    readonly CANCELED: "CANCELED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const SupplyPart: {
    readonly TONER: "TONER";
    readonly DRUM: "DRUM";
    readonly WASTE: "WASTE";
    readonly MAINTENANCE: "MAINTENANCE";
    readonly OTHER: "OTHER";
};
export type SupplyPart = (typeof SupplyPart)[keyof typeof SupplyPart];
export declare const OfferKind: {
    readonly GENUINE: "GENUINE";
    readonly RECYCLED: "RECYCLED";
    readonly COMPATIBLE: "COMPATIBLE";
};
export type OfferKind = (typeof OfferKind)[keyof typeof OfferKind];
export declare const PurchaseType: {
    readonly SPOT: "SPOT";
    readonly ONLINE: "ONLINE";
    readonly CONTRACT: "CONTRACT";
    readonly SUBSCRIPTION: "SUBSCRIPTION";
    readonly OTHER: "OTHER";
};
export type PurchaseType = (typeof PurchaseType)[keyof typeof PurchaseType];
