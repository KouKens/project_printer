"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.field = field;
exports.asIs = asIs;
function field(mode, value, map, fallback) {
    if (value !== undefined)
        return map(value);
    return mode === 'create' ? fallback : undefined;
}
function asIs(value) {
    return value;
}
//# sourceMappingURL=write-mode.js.map