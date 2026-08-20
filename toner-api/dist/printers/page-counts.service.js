"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PageCountsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageCountsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const snmp_service_1 = require("./snmp.service");
function delta(current, previous) {
    if (current === null || previous === null)
        return null;
    const diff = current - previous;
    return diff < 0 ? null : diff;
}
function startOfDay(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
function addDays(date, days) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}
function diffDays(later, earlier) {
    return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}
function fromDateKey(value, label) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const date = parts
        ? new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])))
        : null;
    if (date === null || Number.isNaN(date.getTime())) {
        throw new common_1.BadRequestException(`${label}は YYYY-MM-DD の形式で指定してください`);
    }
    return date;
}
function rangeOf(days, from, to) {
    const start = from
        ? fromDateKey(from, '開始日')
        : addDays(startOfDay(new Date()), -days);
    const end = to ? fromDateKey(to, '終了日') : null;
    if (end !== null && start > end) {
        throw new common_1.BadRequestException('開始日は終了日より前の日付を指定してください');
    }
    return end === null ? { gte: start } : { gte: start, lte: end };
}
function toDateKey(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
let PageCountsService = PageCountsService_1 = class PageCountsService {
    prisma;
    snmp;
    logger = new common_1.Logger(PageCountsService_1.name);
    constructor(prisma, snmp) {
        this.prisma = prisma;
        this.snmp = snmp;
    }
    async captureScheduled() {
        this.logger.log('日次の印刷枚数を記録します');
        const rows = await this.captureAll();
        const recorded = rows.filter((r) => r.status === 'recorded').length;
        const failed = rows.filter((r) => r.status === 'unreachable').length;
        this.logger.log(`記録 ${recorded} 台 / 応答なし ${failed} 台`);
    }
    async captureAll(now = new Date()) {
        const printers = await this.prisma.printer.findMany({
            orderBy: { ipAddress: 'asc' },
        });
        const rows = [];
        for (const printer of printers) {
            rows.push(await this.captureOne(printer.id, now));
        }
        return rows;
    }
    async captureOne(printerId, now = new Date()) {
        const printer = await this.prisma.printer.findUnique({
            where: { id: printerId },
        });
        if (!printer) {
            throw new common_1.NotFoundException(`ID ${printerId} のプリンターは登録されていません`);
        }
        const date = startOfDay(now);
        const base = {
            printerId: printer.id,
            ipAddress: printer.ipAddress,
            date: toDateKey(date),
        };
        const empty = {
            total: null,
            totalMono: null,
            totalColor: null,
            pages: null,
            monoPages: null,
            colorPages: null,
            spanDays: 0,
        };
        let total;
        let totalMono;
        let totalColor;
        try {
            const snapshot = await this.snmp.poll(printer.ipAddress, printer.community, printer.version);
            total = snapshot.pageCount;
            totalMono = snapshot.monoCount;
            totalColor = snapshot.colorCount;
            await this.prisma.printer.update({
                where: { id: printer.id },
                data: {
                    pageCount: snapshot.pageCount,
                    reachable: true,
                    lastError: null,
                    lastPolledAt: now,
                },
            });
        }
        catch (error) {
            if (!(error instanceof snmp_service_1.SnmpUnreachableError))
                throw error;
            await this.prisma.printer.update({
                where: { id: printer.id },
                data: { reachable: false, lastError: error.message, lastPolledAt: now },
            });
            return {
                ...base,
                ...empty,
                status: 'unreachable',
                note: error.message,
            };
        }
        if (total === null) {
            return {
                ...base,
                ...empty,
                status: 'skipped',
                note: 'この機種は累計印刷枚数を返しません',
            };
        }
        const previous = await this.prisma.pageCountDaily.findFirst({
            where: { printerId: printer.id, date: { lt: date } },
            orderBy: { date: 'desc' },
        });
        let pages = null;
        let monoPages = null;
        let colorPages = null;
        let spanDays = 1;
        let note;
        if (!previous) {
            note = '初回の記録なので 1 日分は出せません';
        }
        else {
            spanDays = Math.max(1, diffDays(date, previous.date));
            pages = delta(total, previous.total);
            monoPages = delta(totalMono, previous.totalMono);
            colorPages = delta(totalColor, previous.totalColor);
            if (pages === null) {
                note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
            }
            else if (spanDays > 1) {
                note = `${spanDays} 日分をまとめた値です（前回の記録は ${toDateKey(previous.date)}）`;
            }
        }
        const values = {
            total,
            totalMono,
            totalColor,
            pages,
            monoPages,
            colorPages,
            spanDays,
        };
        await this.prisma.pageCountDaily.upsert({
            where: { printerId_date: { printerId: printer.id, date } },
            create: { printerId: printer.id, date, ...values, capturedAt: now },
            update: { ...values, capturedAt: now },
        });
        return { ...base, ...values, status: 'recorded', note };
    }
    async findAllDaily(days = 30, from, to) {
        const rows = await this.prisma.pageCountDaily.findMany({
            where: { date: rangeOf(days, from, to) },
            orderBy: [{ date: 'desc' }, { printerId: 'asc' }],
            include: { printer: { select: { ipAddress: true, model: true } } },
        });
        return rows.map((row) => ({
            id: row.id,
            printerId: row.printerId,
            ipAddress: row.printer.ipAddress,
            model: row.printer.model,
            date: toDateKey(row.date),
            total: row.total,
            totalMono: row.totalMono,
            totalColor: row.totalColor,
            pages: row.pages,
            monoPages: row.monoPages,
            colorPages: row.colorPages,
            spanDays: row.spanDays,
            capturedAt: row.capturedAt,
        }));
    }
    async findDaily(printerId, days = 30, from, to) {
        const rows = await this.prisma.pageCountDaily.findMany({
            where: { printerId, date: rangeOf(days, from, to) },
            orderBy: { date: 'desc' },
        });
        return rows.map((row) => ({
            date: toDateKey(row.date),
            pages: row.pages,
            monoPages: row.monoPages,
            colorPages: row.colorPages,
            total: row.total,
            totalMono: row.totalMono,
            totalColor: row.totalColor,
            spanDays: row.spanDays,
            capturedAt: row.capturedAt,
        }));
    }
};
exports.PageCountsService = PageCountsService;
__decorate([
    (0, schedule_1.Cron)('0 12 * * *', { name: 'capture-page-counts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageCountsService.prototype, "captureScheduled", null);
exports.PageCountsService = PageCountsService = PageCountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        snmp_service_1.SnmpService])
], PageCountsService);
//# sourceMappingURL=page-counts.service.js.map