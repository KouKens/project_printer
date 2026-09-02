"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDate = toDate;
exports.fromDate = fromDate;
exports.startOfDay = startOfDay;
exports.today = today;
function toDate(value) {
    if (!value)
        return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function fromDate(value) {
    if (!value)
        return null;
    const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${value.getUTCDate()}`.padStart(2, '0');
    return `${value.getUTCFullYear()}-${month}-${day}`;
}
function startOfDay(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
function today() {
    return startOfDay(new Date());
}
//# sourceMappingURL=date.js.map