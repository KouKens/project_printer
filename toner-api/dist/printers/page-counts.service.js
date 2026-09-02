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
const date_1 = require("../common/date");
const prisma_service_1 = require("../prisma/prisma.service");
const snmp_service_1 = require("./snmp.service");
function delta(current, previous) {
    if (current === null || previous === null)
        return null;
    const diff = current - previous;
    return diff < 0 ? null : diff;
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
        : addDays((0, date_1.startOfDay)(new Date()), -days);
    const end = to ? fromDateKey(to, '終了日') : null;
    if (end !== null && start > end) {
        throw new common_1.BadRequestException('開始日は終了日より前の日付を指定してください');
    }
    return end === null ? { gte: start } : { gte: start, lte: end };
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
            where: { protocol: 'SNMP' },
            orderBy: { ipAddress: 'asc' },
        });
        const rows = [];
        for (const printer of printers) {
            rows.push(await this.capture(printer, now));
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
        return this.capture(printer, now);
    }
    async capture(printer, now) {
        const date = (0, date_1.startOfDay)(now);
        const base = {
            printerId: printer.id,
            ipAddress: printer.ipAddress,
            date: (0, date_1.fromDate)(date),
        };
        const empty = {
            total: null,
            totalMono: null,
            totalColor: null,
            totalPrint: null,
            totalCopy: null,
            totalScan: null,
            pages: null,
            monoPages: null,
            colorPages: null,
            printPages: null,
            copyPages: null,
            scanPages: null,
            spanDays: 0,
        };
        let total;
        let totalMono;
        let totalColor;
        let totalPrint;
        let totalCopy;
        let totalScan;
        try {
            const snapshot = await this.snmp.poll(printer.ipAddress, printer.community, printer.version);
            total = snapshot.pageCount;
            totalMono = snapshot.monoCount;
            totalColor = snapshot.colorCount;
            totalPrint = snapshot.printCount;
            totalCopy = snapshot.copyCount;
            totalScan = snapshot.scanCount;
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
        let printPages = null;
        let copyPages = null;
        let scanPages = null;
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
            printPages = delta(totalPrint, previous.totalPrint);
            copyPages = delta(totalCopy, previous.totalCopy);
            scanPages = delta(totalScan, previous.totalScan);
            if (pages === null) {
                note = `カウンタが前回（${previous.total}）より小さくなっています。機器交換かリセットの可能性があります`;
            }
            else if (spanDays > 1) {
                note = `${spanDays} 日分をまとめた値です（前回の記録は ${(0, date_1.fromDate)(previous.date)}）`;
            }
        }
        const values = {
            total,
            totalMono,
            totalColor,
            totalPrint,
            totalCopy,
            totalScan,
            pages,
            monoPages,
            colorPages,
            printPages,
            copyPages,
            scanPages,
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
        const [rows, assets] = await Promise.all([
            this.prisma.pageCountDaily.findMany({
                where: { date: rangeOf(days, from, to) },
                orderBy: [{ date: 'desc' }, { printerId: 'asc' }],
                include: {
                    printer: {
                        select: {
                            ipAddress: true,
                            model: true,
                            serialNumber: true,
                            counterUnit: true,
                        },
                    },
                },
            }),
            this.prisma.printerAsset.findMany({
                select: {
                    id: true,
                    no: true,
                    department: true,
                    ipAddress: true,
                    serialNumber: true,
                },
                orderBy: [{ no: 'asc' }, { id: 'asc' }],
            }),
        ]);
        const ledger = this.ledgerIndex(assets);
        return rows.map((row) => {
            const asset = this.assetOf(row.printer, ledger);
            return {
                id: row.id,
                printerId: row.printerId,
                ipAddress: row.printer.ipAddress,
                model: row.printer.model,
                counterUnit: row.printer.counterUnit,
                department: asset?.department ?? null,
                no: asset?.no ?? null,
                date: (0, date_1.fromDate)(row.date),
                total: row.total,
                totalMono: row.totalMono,
                totalColor: row.totalColor,
                totalPrint: row.totalPrint,
                totalCopy: row.totalCopy,
                totalScan: row.totalScan,
                pages: row.pages,
                monoPages: row.monoPages,
                colorPages: row.colorPages,
                printPages: row.printPages,
                copyPages: row.copyPages,
                scanPages: row.scanPages,
                spanDays: row.spanDays,
                capturedAt: row.capturedAt,
            };
        });
    }
    async findDaily(printerId, days = 30, from, to) {
        const rows = await this.prisma.pageCountDaily.findMany({
            where: { printerId, date: rangeOf(days, from, to) },
            orderBy: { date: 'desc' },
        });
        return rows.map((row) => ({
            date: (0, date_1.fromDate)(row.date),
            pages: row.pages,
            monoPages: row.monoPages,
            colorPages: row.colorPages,
            printPages: row.printPages,
            copyPages: row.copyPages,
            scanPages: row.scanPages,
            total: row.total,
            totalMono: row.totalMono,
            totalColor: row.totalColor,
            totalPrint: row.totalPrint,
            totalCopy: row.totalCopy,
            totalScan: row.totalScan,
            spanDays: row.spanDays,
            capturedAt: row.capturedAt,
        }));
    }
    ledgerIndex(assets) {
        const bySerial = new Map();
        const byIp = new Map();
        for (const asset of assets) {
            if (asset.serialNumber) {
                bySerial.set(asset.serialNumber.toLowerCase(), asset);
            }
            if (asset.ipAddress) {
                const list = byIp.get(asset.ipAddress) ?? [];
                list.push(asset);
                byIp.set(asset.ipAddress, list);
            }
        }
        return { bySerial, byIp };
    }
    assetOf(printer, ledger) {
        if (printer.serialNumber) {
            const bySerial = ledger.bySerial.get(printer.serialNumber.toLowerCase());
            if (bySerial)
                return bySerial;
        }
        const byIp = ledger.byIp.get(printer.ipAddress) ?? [];
        return byIp.length === 1 ? byIp[0] : null;
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