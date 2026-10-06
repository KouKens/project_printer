"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseType = exports.OfferKind = exports.SupplyPart = exports.OrderStatus = exports.ReceiveMode = exports.CountLayout = exports.RepairStatus = exports.RepairHandler = exports.RepairCategory = exports.PrinterProtocol = exports.SnmpVersion = exports.TonerAction = void 0;
exports.TonerAction = {
    REGISTER: 'REGISTER',
    RECEIVE: 'RECEIVE',
    ISSUE: 'ISSUE',
    DISPOSE: 'DISPOSE',
    ADJUST: 'ADJUST'
};
exports.SnmpVersion = {
    V1: 'V1',
    V2C: 'V2C'
};
exports.PrinterProtocol = {
    SNMP: 'SNMP',
    SATO_ENQ: 'SATO_ENQ'
};
exports.RepairCategory = {
    PART_REPLACEMENT: 'PART_REPLACEMENT',
    SENSOR_DIRT: 'SENSOR_DIRT',
    PAPER_JAM: 'PAPER_JAM',
    PRINT_QUALITY: 'PRINT_QUALITY',
    SERVICE_CALL: 'SERVICE_CALL',
    FEED_FAILURE: 'FEED_FAILURE',
    FUSING_FAILURE: 'FUSING_FAILURE',
    NETWORK: 'NETWORK',
    NOISE_SMELL: 'NOISE_SMELL',
    NO_POWER: 'NO_POWER',
    OTHER: 'OTHER'
};
exports.RepairHandler = {
    IN_HOUSE: 'IN_HOUSE',
    VENDOR: 'VENDOR'
};
exports.RepairStatus = {
    INVESTIGATING: 'INVESTIGATING',
    INQUIRING: 'INQUIRING',
    AWAITING_REPLY: 'AWAITING_REPLY',
    QUOTING: 'QUOTING',
    SETTLING: 'SETTLING',
    SHIPPED: 'SHIPPED',
    RECEIVED: 'RECEIVED',
    DONE: 'DONE'
};
exports.CountLayout = {
    TOTAL: 'TOTAL',
    MONO_COLOR: 'MONO_COLOR',
    COLOR_MONO: 'COLOR_MONO'
};
exports.ReceiveMode = {
    AUTO: 'AUTO',
    MANUAL: 'MANUAL'
};
exports.OrderStatus = {
    PENDING: 'PENDING',
    RECEIVED: 'RECEIVED',
    CANCELED: 'CANCELED'
};
exports.SupplyPart = {
    TONER: 'TONER',
    DRUM: 'DRUM',
    WASTE: 'WASTE',
    MAINTENANCE: 'MAINTENANCE',
    OTHER: 'OTHER'
};
exports.OfferKind = {
    GENUINE: 'GENUINE',
    RECYCLED: 'RECYCLED',
    COMPATIBLE: 'COMPATIBLE'
};
exports.PurchaseType = {
    SPOT: 'SPOT',
    ONLINE: 'ONLINE',
    CONTRACT: 'CONTRACT',
    SUBSCRIPTION: 'SUBSCRIPTION',
    OTHER: 'OTHER'
};
//# sourceMappingURL=enums.js.map