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
            return saved;
        });
        return this.findOne(printer.id);
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
        });
        return this.findOne(id);
    }
    async findAll() {
        const printers = await this.prisma.printer.findMany({
            orderBy: { ipAddress: 'asc' },
            include: { readings: { orderBy: { supplyIndex: 'asc' } } },
        });
        return printers.map((printer) => this.toResponse(printer));
    }
    async findOne(id) {
        const printer = await this.prisma.printer.findUnique({
            where: { id },
            include: { readings: { orderBy: { supplyIndex: 'asc' } } },
        });
        if (!printer) {
            throw new common_1.NotFoundException(`ID ${id} のプリンターは登録されていません`);
        }
        return this.toResponse(printer);
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
    snapshotFields(snapshot) {
        return {
            version: snapshot.version,
            hostName: snapshot.hostName,
            model: snapshot.model,
            serialNumber: snapshot.serialNumber,
            macAddress: snapshot.macAddress,
            pageCount: snapshot.pageCount,
            reachable: true,
            lastError: null,
            lastPolledAt: new Date(),
        };
    }
    async replaceReadings(tx, printerId, snapshot) {
        await tx.supplyReading.deleteMany({ where: { printerId } });
        if (snapshot.supplies.length === 0)
            return;
        await tx.supplyReading.createMany({
            data: snapshot.supplies.map((supply) => ({
                printerId,
                supplyIndex: supply.supplyIndex,
                name: supply.name,
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
            readings: printer.readings.map((reading) => ({
                id: reading.id,
                supplyIndex: reading.supplyIndex,
                name: reading.name,
                colorant: reading.colorant,
                level: reading.level,
                maxCapacity: reading.maxCapacity,
                percent: reading.percent,
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