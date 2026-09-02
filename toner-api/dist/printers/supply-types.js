"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSUMABLE_TYPES = void 0;
exports.isReplaceablePart = isReplaceablePart;
exports.CONSUMABLE_TYPES = [
    3,
    5,
    6,
    7,
    13,
    21,
];
function isReplaceablePart(supply) {
    if (supply.supplyType === null)
        return false;
    return !exports.CONSUMABLE_TYPES.includes(supply.supplyType);
}
//# sourceMappingURL=supply-types.js.map