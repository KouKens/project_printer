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
exports.PageCountsService = exports.PAGE_COUNT_CRON = void 0;
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
function sum(mono, color) {
    if (mono === null && color === null)
        return null;
    return (mono ?? 0) + (color ?? 0);
}
function functionTotals(matrix) {
    return {
        print: sum(matrix.printMono, matrix.printColor),
        copy: sum(matrix.copyMono, matrix.copyColor),
        scan: sum(matrix.scanMono, matrix.scanColor),
    };
}
function addDays(date, days) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}
function diffDays(later, earlier) {
    return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}
function rangeOf(days, from, to) {
    const start = from
        ? (0, date_1.parseDateKey)(from, '開始日')
        : addDays((0, date_1.startOfDay)(new Date()), -days);
    const end = to ? (0, date_1.parseDateKey)(to, '終了日') : null;
    if (end !== null && start > end) {
        throw new common_1.BadRequestException('開始日は終了日より前の日付を指定してください');
    }
    return end === null ? { gte: start } : { gte: start, lte: end };
}
exports.PAGE_COUNT_CRON = '0 12 * * *';
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
            totalPrintMono: null,
            totalPrintColor: null,
            totalCopyMono: null,
            totalCopyColor: null,
            totalScanMono: null,
            totalScanColor: null,
            totalPrint: null,
            totalCopy: null,
            totalScan: null,
            pages: null,
            monoPages: null,
            colorPages: null,
            printMonoPages: null,
            printColorPages: null,
            copyMonoPages: null,
            copyColorPages: null,
            scanMonoPages: null,
            scanColorPages: null,
            printPages: null,
            copyPages: null,
            scanPages: null,
            spanDays: 0,
        };
        let total;
        let totalMono;
        let totalColor;
        let matrix;
        try {
            const snapshot = await this.snmp.poll(printer.ipAddress, printer.community, printer.version);
            total = snapshot.pageCount;
            totalMono = snapshot.monoCount;
            totalColor = snapshot.colorCount;
            matrix = {
                printMono: snapshot.printMono,
                printColor: snapshot.printColor,
                copyMono: snapshot.copyMono,
                copyColor: snapshot.copyColor,
                scanMono: snapshot.scanMono,
                scanColor: snapshot.scanColor,
            };
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
        let daily = {
            printMono: null,
            printColor: null,
            copyMono: null,
            copyColor: null,
            scanMono: null,
            scanColor: null,
        };
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
            daily = {
                printMono: delta(matrix.printMono, previous.totalPrintMono),
                printColor: delta(matrix.printColor, previous.totalPrintColor),
                copyMono: delta(matrix.copyMono, previous.totalCopyMono),
                copyColor: delta(matrix.copyColor, previous.totalCopyColor),
                scanMono: delta(matrix.scanMono, previous.totalScanMono),
                scanColor: delta(matrix.scanColor, previous.totalScanColor),
            };
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
            totalPrintMono: matrix.printMono,
            totalPrintColor: matrix.printColor,
            totalCopyMono: matrix.copyMono,
            totalCopyColor: matrix.copyColor,
            totalScanMono: matrix.scanMono,
            totalScanColor: matrix.scanColor,
            pages,
            monoPages,
            colorPages,
            printMonoPages: daily.printMono,
            printColorPages: daily.printColor,
            copyMonoPages: daily.copyMono,
            copyColorPages: daily.copyColor,
            scanMonoPages: daily.scanMono,
            scanColorPages: daily.scanColor,
            spanDays,
        };
        await this.prisma.pageCountDaily.upsert({
            where: { printerId_date: { printerId: printer.id, date } },
            create: { printerId: printer.id, date, ...values, capturedAt: now },
            update: { ...values, capturedAt: now },
        });
        const cumulative = functionTotals(matrix);
        const period = functionTotals(daily);
        return {
            ...base,
            ...values,
            totalPrint: cumulative.print,
            totalCopy: cumulative.copy,
            totalScan: cumulative.scan,
            printPages: period.print,
            copyPages: period.copy,
            scanPages: period.scan,
            status: 'recorded',
            note,
        };
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
                ...this.counts(row),
                counterUnit: row.printer.counterUnit,
                department: asset?.department ?? null,
                no: asset?.no ?? null,
                date: (0, date_1.fromDate)(row.date),
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
            ...this.counts(row),
            spanDays: row.spanDays,
            capturedAt: row.capturedAt,
        }));
    }
    counts(row) {
        const cumulative = functionTotals({
            printMono: row.totalPrintMono,
            printColor: row.totalPrintColor,
            copyMono: row.totalCopyMono,
            copyColor: row.totalCopyColor,
            scanMono: row.totalScanMono,
            scanColor: row.totalScanColor,
        });
        const period = functionTotals({
            printMono: row.printMonoPages,
            printColor: row.printColorPages,
            copyMono: row.copyMonoPages,
            copyColor: row.copyColorPages,
            scanMono: row.scanMonoPages,
            scanColor: row.scanColorPages,
        });
        return {
            total: row.total,
            totalMono: row.totalMono,
            totalColor: row.totalColor,
            totalPrintMono: row.totalPrintMono,
            totalPrintColor: row.totalPrintColor,
            totalCopyMono: row.totalCopyMono,
            totalCopyColor: row.totalCopyColor,
            totalScanMono: row.totalScanMono,
            totalScanColor: row.totalScanColor,
            totalPrint: cumulative.print,
            totalCopy: cumulative.copy,
            totalScan: cumulative.scan,
            pages: row.pages,
            monoPages: row.monoPages,
            colorPages: row.colorPages,
            printMonoPages: row.printMonoPages,
            printColorPages: row.printColorPages,
            copyMonoPages: row.copyMonoPages,
            copyColorPages: row.copyColorPages,
            scanMonoPages: row.scanMonoPages,
            scanColorPages: row.scanColorPages,
            printPages: period.print,
            copyPages: period.copy,
            scanPages: period.scan,
        };
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
    (0, schedule_1.Cron)(exports.PAGE_COUNT_CRON, { name: 'capture-page-counts' }),
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