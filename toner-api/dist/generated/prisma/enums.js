"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.CountLayout = exports.RepairStatus = exports.RepairHandler = exports.RepairCategory = exports.SnmpVersion = exports.TonerAction = void 0;
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
exports.OrderStatus = {
    PENDING: 'PENDING',
    RECEIVED: 'RECEIVED',
    CANCELED: 'CANCELED'
};
//# sourceMappingURL=enums.js.map