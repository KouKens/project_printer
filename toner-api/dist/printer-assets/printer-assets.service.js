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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterAssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
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
function toText(value) {
    if (value === undefined || value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function withinMaint(restoredOn, start, end) {
    if (start && restoredOn < start)
        return false;
    if (end && restoredOn > end)
        return false;
    return true;
}
let PrinterAssetsService = class PrinterAssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const saved = await this.prisma.printerAsset.create({
            data: this.toData(dto),
        });
        return this.toResponse(saved);
    }
    async findAll() {
        const assets = await this.prisma.printerAsset.findMany({
            orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
        });
        return assets.map((asset) => this.toResponse(asset));
    }
    async findOverview() {
        const [assets, printers, dailies, repairs] = await Promise.all([
            this.prisma.printerAsset.findMany({
                orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
            }),
            this.prisma.printer.findMany({
                include: {
                    readings: { orderBy: { supplyIndex: 'asc' } },
                    alerts: { orderBy: { alertIndex: 'asc' } },
                },
            }),
            this.prisma.pageCountDaily.findMany({ orderBy: { date: 'desc' } }),
            this.prisma.repairRecord.findMany({
                select: {
                    printerAssetId: true,
                    handledBy: true,
                    restoredOn: true,
                    status: true,
                },
            }),
        ]);
        const bySerial = new Map();
        const byIp = new Map();
        for (const printer of printers) {
            if (printer.serialNumber) {
                bySerial.set(printer.serialNumber.toLowerCase(), printer);
            }
            byIp.set(printer.ipAddress, printer);
        }
        const latest = new Map();
        for (const row of dailies) {
            if (!latest.has(row.printerId))
                latest.set(row.printerId, row);
        }
        const repairsByAsset = new Map();
        for (const repair of repairs) {
            const list = repairsByAsset.get(repair.printerAssetId) ?? [];
            list.push(repair);
            repairsByAsset.set(repair.printerAssetId, list);
        }
        return assets.map((asset) => {
            const printer = asset.serialNumber
                ? (bySerial.get(asset.serialNumber.toLowerCase()) ?? null)
                : asset.ipAddress
                    ? (byIp.get(asset.ipAddress) ?? null)
                    : null;
            const daily = printer ? (latest.get(printer.id) ?? null) : null;
            return {
                ...this.toResponse(asset),
                repairs: this.countRepairs(asset, repairsByAsset.get(asset.id) ?? []),
                printer: printer
                    ? {
                        id: printer.id,
                        ipAddress: printer.ipAddress,
                        hostName: printer.hostName,
                        model: printer.model,
                        serialNumber: printer.serialNumber,
                        macAddress: printer.macAddress,
                        pageCount: printer.pageCount,
                        reachable: printer.reachable,
                        lastError: printer.lastError,
                        lastPolledAt: printer.lastPolledAt,
                        lastSuccessAt: printer.lastSuccessAt,
                        consoleText: printer.consoleText,
                        readings: printer.readings.map((r) => ({
                            id: r.id,
                            supplyIndex: r.supplyIndex,
                            name: r.name,
                            supplyType: r.supplyType,
                            supplyClass: r.supplyClass,
                            colorant: r.colorant,
                            level: r.level,
                            maxCapacity: r.maxCapacity,
                            percent: r.percent,
                        })),
                        alerts: printer.alerts.map((a) => ({
                            id: a.id,
                            alertIndex: a.alertIndex,
                            severity: a.severity,
                            alertGroup: a.alertGroup,
                            groupIndex: a.groupIndex,
                            code: a.code,
                            description: a.description,
                        })),
                    }
                    : null,
                latest: daily
                    ? {
                        date: fromDate(daily.date),
                        pages: daily.pages,
                        monoPages: daily.monoPages,
                        colorPages: daily.colorPages,
                        total: daily.total,
                        totalMono: daily.totalMono,
                        totalColor: daily.totalColor,
                    }
                    : null,
            };
        });
    }
    async findOne(id) {
        const asset = await this.prisma.printerAsset.findUnique({ where: { id } });
        if (!asset) {
            throw new common_1.NotFoundException(`ID ${id} の端末情報は登録されていません`);
        }
        return this.toResponse(asset);
    }
    async update(id, dto) {
        await this.findOne(id);
        const saved = await this.prisma.printerAsset.update({
            where: { id },
            data: this.toData(dto),
        });
        return this.toResponse(saved);
    }
    async touch(id) {
        await this.findOne(id);
        const saved = await this.prisma.printerAsset.update({
            where: { id },
            data: { updatedAt: new Date() },
        });
        return this.toResponse(saved);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.printerAsset.delete({ where: { id } });
        return { id };
    }
    countRepairs(asset, repairs) {
        const inWindow = repairs.filter((repair) => withinMaint(repair.restoredOn, asset.maintStartOn, asset.maintEndOn));
        return {
            hasMaint: asset.maintStartOn !== null || asset.maintEndOn !== null,
            inHouse: inWindow.filter((r) => r.handledBy === 'IN_HOUSE').length,
            vendor: inWindow.filter((r) => r.handledBy === 'VENDOR').length,
            open: repairs.filter((r) => !r.status || r.status !== 'DONE').length,
            total: repairs.length,
        };
    }
    toData(dto) {
        return {
            department: toText(dto.department),
            no: toText(dto.no),
            ipAddress: toText(dto.ipAddress),
            maker: toText(dto.maker),
            model: toText(dto.model),
            serialNumber: toText(dto.serialNumber),
            purchasedOn: toDate(dto.purchasedOn),
            contractNo: toText(dto.contractNo),
            maintContract: toText(dto.maintContract),
            maintStartOn: toDate(dto.maintStartOn),
            maintEndOn: toDate(dto.maintEndOn),
            maintDealOn: toDate(dto.maintDealOn),
            maintFee: dto.maintFee ?? null,
            note: toText(dto.note),
            countLayout: dto.countLayout ?? 'TOTAL',
        };
    }
    toResponse(asset) {
        return {
            id: asset.id,
            department: asset.department,
            no: asset.no,
            ipAddress: asset.ipAddress,
            maker: asset.maker,
            model: asset.model,
            serialNumber: asset.serialNumber,
            purchasedOn: fromDate(asset.purchasedOn),
            contractNo: asset.contractNo,
            maintContract: asset.maintContract,
            maintStartOn: fromDate(asset.maintStartOn),
            maintEndOn: fromDate(asset.maintEndOn),
            maintDealOn: fromDate(asset.maintDealOn),
            maintFee: asset.maintFee,
            note: asset.note,
            countLayout: asset.countLayout,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
        };
    }
};
exports.PrinterAssetsService = PrinterAssetsService;
exports.PrinterAssetsService = PrinterAssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrinterAssetsService);
//# sourceMappingURL=printer-assets.service.js.map