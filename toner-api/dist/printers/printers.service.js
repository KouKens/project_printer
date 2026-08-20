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
exports.PrintersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const snmp_service_1 = require("./snmp.service");
const BULK_CONCURRENCY = 6;
function toVersionKey(input) {
    return input === '2c' ? 'V2C' : 'V1';
}
function toVersionInput(key) {
    return key === 'V2C' ? '2c' : '1';
}
let PrintersService = class PrintersService {
    prisma;
    snmp;
    constructor(prisma, snmp) {
        this.prisma = prisma;
        this.snmp = snmp;
    }
    async create(dto) {
        const ipAddress = dto.ipAddress.trim();
        const community = dto.community?.trim() || 'public';
        const location = dto.location?.trim() || null;
        const snapshot = await this.pollOrFail(ipAddress, community, toVersionKey(dto.version));
        const printer = await this.prisma.$transaction(async (tx) => {
            const saved = await tx.printer.upsert({
                where: { ipAddress },
                create: {
                    ipAddress,
                    community,
                    location,
                    ...this.snapshotFields(snapshot),
                },
                update: {
                    community,
                    ...(location === null ? {} : { location }),
                    ...this.snapshotFields(snapshot),
                },
            });
            await this.replaceReadings(tx, saved.id, snapshot);
            await this.replaceAlerts(tx, saved.id, snapshot);
            return saved;
        });
        return this.findOne(printer.id);
    }
    async createMany(dto) {
        const ledger = dto.fillLocationFromLedger === false ? null : await this.ledgerBySerial();
        const results = [];
        let cursor = 0;
        const worker = async () => {
            while (cursor < dto.printers.length) {
                const entry = dto.printers[cursor++];
                results.push(await this.createOneForBulk(entry, dto.community, ledger));
            }
        };
        await Promise.all(Array.from({ length: Math.min(BULK_CONCURRENCY, dto.printers.length) }, worker));
        const order = new Map(dto.printers.map((entry, index) => [entry.ipAddress, index]));
        results.sort((a, b) => (order.get(a.ipAddress) ?? 0) - (order.get(b.ipAddress) ?? 0));
        return results;
    }
    async probe(dto) {
        const ipAddress = dto.ipAddress.trim();
        const community = dto.community?.trim() || 'public';
        const snapshot = await this.pollOrFail(ipAddress, community, toVersionKey(dto.version));
        return {
            ipAddress,
            community,
            version: toVersionInput(snapshot.version),
            hostName: snapshot.hostName,
            model: snapshot.model,
            serialNumber: snapshot.serialNumber,
            macAddress: snapshot.macAddress,
            pageCount: snapshot.pageCount,
            polledAt: new Date(),
            supplies: snapshot.supplies,
        };
    }
    async poll(id) {
        const printer = await this.prisma.printer.findUnique({ where: { id } });
        if (!printer) {
            throw new common_1.NotFoundException(`ID ${id} のプリンターは登録されていません`);
        }
        let snapshot;
        try {
            snapshot = await this.snmp.poll(printer.ipAddress, printer.community, printer.version);
        }
        catch (error) {
            if (!(error instanceof snmp_service_1.SnmpUnreachableError))
                throw error;
            await this.prisma.printer.update({
                where: { id },
                data: {
                    reachable: false,
                    lastError: error.message,
                    lastPolledAt: new Date(),
                },
            });
            throw new common_1.ServiceUnavailableException(error.message);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.printer.update({
                where: { id },
                data: this.snapshotFields(snapshot),
            });
            await this.replaceReadings(tx, id, snapshot);
            await this.replaceAlerts(tx, id, snapshot);
        });
        return this.findOne(id);
    }
    async findAll() {
        const printers = await this.prisma.printer.findMany({
            orderBy: { ipAddress: 'asc' },
            include: {
                readings: { orderBy: { supplyIndex: 'asc' } },
                alerts: { orderBy: { alertIndex: 'asc' } },
            },
        });
        return printers.map((printer) => this.toResponse(printer));
    }
    async findOne(id) {
        const printer = await this.prisma.printer.findUnique({
            where: { id },
            include: {
                readings: { orderBy: { supplyIndex: 'asc' } },
                alerts: { orderBy: { alertIndex: 'asc' } },
            },
        });
        if (!printer) {
            throw new common_1.NotFoundException(`ID ${id} のプリンターは登録されていません`);
        }
        return this.toResponse(printer);
    }
    async createOneForBulk(entry, community, ledger) {
        const ipAddress = entry.ipAddress.trim();
        try {
            const saved = await this.create({
                ipAddress,
                community,
                location: entry.location,
            });
            if (ledger && !entry.location && !saved.location && saved.serialNumber) {
                const department = ledger.get(saved.serialNumber.toLowerCase());
                if (department) {
                    await this.prisma.printer.update({
                        where: { id: saved.id },
                        data: { location: department },
                    });
                    return { ...this.toBulkRow(saved), location: department };
                }
            }
            return this.toBulkRow(saved);
        }
        catch (error) {
            return {
                ipAddress,
                status: 'failed',
                model: null,
                location: null,
                message: error instanceof common_1.HttpException
                    ? String(error.getResponse().message ??
                        error.message)
                    : error.message,
            };
        }
    }
    toBulkRow(saved) {
        return {
            ipAddress: saved.ipAddress,
            status: 'registered',
            model: saved.model,
            location: saved.location,
        };
    }
    async ledgerBySerial() {
        const assets = await this.prisma.printerAsset.findMany({
            where: { serialNumber: { not: null }, department: { not: null } },
            select: { serialNumber: true, department: true },
        });
        const map = new Map();
        for (const asset of assets) {
            if (asset.serialNumber && asset.department) {
                map.set(asset.serialNumber.toLowerCase(), asset.department);
            }
        }
        return map;
    }
    async pollOrFail(ipAddress, community, preferred) {
        try {
            return await this.snmp.poll(ipAddress, community, preferred);
        }
        catch (error) {
            if (error instanceof snmp_service_1.SnmpUnreachableError) {
                throw new common_1.ServiceUnavailableException(error.message);
            }
            throw error;
        }
    }
    async replaceAlerts(tx, printerId, snapshot) {
        await tx.printerAlert.deleteMany({ where: { printerId } });
        if (snapshot.alerts.length === 0)
            return;
        await tx.printerAlert.createMany({
            data: snapshot.alerts.map((alert) => ({
                printerId,
                alertIndex: alert.alertIndex,
                severity: alert.severity,
                alertGroup: alert.alertGroup,
                groupIndex: alert.groupIndex,
                code: alert.code,
                description: alert.description,
            })),
        });
    }
    snapshotFields(snapshot) {
        const now = new Date();
        return {
            version: snapshot.version,
            consoleText: snapshot.consoleText,
            ...(snapshot.hostName === null ? {} : { hostName: snapshot.hostName }),
            ...(snapshot.model === null ? {} : { model: snapshot.model }),
            ...(snapshot.serialNumber === null
                ? {}
                : { serialNumber: snapshot.serialNumber }),
            ...(snapshot.macAddress === null
                ? {}
                : { macAddress: snapshot.macAddress }),
            ...(snapshot.pageCount === null ? {} : { pageCount: snapshot.pageCount }),
            reachable: true,
            lastError: null,
            lastPolledAt: now,
            lastSuccessAt: now,
        };
    }
    async replaceReadings(tx, printerId, snapshot) {
        if (snapshot.supplies.length === 0)
            return;
        await tx.supplyReading.deleteMany({ where: { printerId } });
        await tx.supplyReading.createMany({
            data: snapshot.supplies.map((supply) => ({
                printerId,
                supplyIndex: supply.supplyIndex,
                name: supply.name,
                supplyType: supply.supplyType,
                supplyClass: supply.supplyClass,
                colorant: supply.colorant,
                level: supply.level,
                maxCapacity: supply.maxCapacity,
                percent: supply.percent,
            })),
        });
    }
    toResponse(printer) {
        return {
            id: printer.id,
            ipAddress: printer.ipAddress,
            community: printer.community,
            version: toVersionInput(printer.version),
            hostName: printer.hostName,
            model: printer.model,
            serialNumber: printer.serialNumber,
            macAddress: printer.macAddress,
            location: printer.location,
            pageCount: printer.pageCount,
            reachable: printer.reachable,
            lastError: printer.lastError,
            lastPolledAt: printer.lastPolledAt,
            lastSuccessAt: printer.lastSuccessAt,
            consoleText: printer.consoleText,
            readings: printer.readings.map((reading) => ({
                id: reading.id,
                supplyIndex: reading.supplyIndex,
                name: reading.name,
                supplyType: reading.supplyType,
                supplyClass: reading.supplyClass,
                colorant: reading.colorant,
                level: reading.level,
                maxCapacity: reading.maxCapacity,
                percent: reading.percent,
            })),
            alerts: printer.alerts.map((alert) => ({
                id: alert.id,
                alertIndex: alert.alertIndex,
                severity: alert.severity,
                alertGroup: alert.alertGroup,
                groupIndex: alert.groupIndex,
                code: alert.code,
                description: alert.description,
            })),
        };
    }
};
exports.PrintersService = PrintersService;
exports.PrintersService = PrintersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        snmp_service_1.SnmpService])
], PrintersService);
//# sourceMappingURL=printers.service.js.map