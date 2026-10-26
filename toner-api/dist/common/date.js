"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDate = toDate;
exports.fromDate = fromDate;
exports.startOfDay = startOfDay;
exports.today = today;
exports.parseDateKey = parseDateKey;
exports.periodOf = periodOf;
exports.timeRange = timeRange;
exports.dayRange = dayRange;
const common_1 = require("@nestjs/common");
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
function parseDateKey(value, label) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const date = parts
        ? new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])))
        : null;
    if (date === null ||
        Number.isNaN(date.getTime()) ||
        fromDate(date) !== value) {
        throw new common_1.BadRequestException(`${label}は YYYY-MM-DD の形式で指定してください`);
    }
    return date;
}
function periodOf(days, from, to) {
    const firstDay = from
        ? parseDateKey(from, '開始日')
        : new Date(today().getTime() - days * 86_400_000);
    const lastDay = to ? parseDateKey(to, '終了日') : null;
    if (lastDay !== null && firstDay > lastDay) {
        throw new common_1.BadRequestException('開始日は終了日より前の日付を指定してください');
    }
    const localMidnight = (day, offset = 0) => new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + offset);
    return {
        since: localMidnight(firstDay),
        until: lastDay === null ? null : localMidnight(lastDay, 1),
        firstDay,
        lastDay,
    };
}
function timeRange(period) {
    return period.until === null
        ? { gte: period.since }
        : { gte: period.since, lt: period.until };
}
function dayRange(period) {
    return period.lastDay === null
        ? { gte: period.firstDay }
        : { gte: period.firstDay, lte: period.lastDay };
}
//# sourceMappingURL=date.js.map