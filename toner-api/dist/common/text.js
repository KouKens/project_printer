"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toText = toText;
function toText(value) {
    const text = value?.trim() ?? '';
    return text.length > 0 ? text : null;
}
//# sourceMappingURL=text.js.map