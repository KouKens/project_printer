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
const date_1 = require("../common/date");
const text_1 = require("../common/text");
const maint_vendors_service_1 = require("../maint-vendors/maint-vendors.service");
const printer_match_1 = require("../printers/printer-match");
const supply_types_1 = require("../printers/supply-types");
const printers_service_1 = require("../printers/printers.service");
function toVendor(vendor) {
    return { id: vendor.id, name: vendor.name, phones: vendor.phones };
}
function sumCounts(mono, color) {
    if (mono === null && color === null)
        return null;
    return (mono ?? 0) + (color ?? 0);
}
function modelKey(maker, model) {
    const fold = (value) => (value ?? '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s\-_・]/g, '');
    return `${fold(maker)}\0${fold(model)}`;
}
const COLOR_ORDER = ['black', 'cyan', 'magenta', 'yellow'];
const NAME_COLOR = [
    [/black|ブラック|黒/i, 'black'],
    [/cyan|シアン/i, 'cyan'],
    [/magenta|マゼンタ/i, 'magenta'],
    [/yellow|イエロー/i, 'yellow'],
];
const TONER_COLOR = [
    [/4色|フルカラー/, ['black', 'cyan', 'magenta', 'yellow']],
    [/ブラック|黒/, ['black']],
    [/シアン/, ['cyan']],
    [/マゼンタ/, ['magenta']],
    [/イエロー/, ['yellow']],
];
function supplyColor(supply) {
    const direct = supply.colorant?.toLowerCase();
    if (direct && COLOR_ORDER.includes(direct))
        return direct;
    for (const [pattern, color] of NAME_COLOR) {
        if (pattern.test(supply.name))
            return color;
    }
    return null;
}
function tonerColors(color) {
    if (!color)
        return [];
    for (const [pattern, colors] of TONER_COLOR) {
        if (pattern.test(color))
            return colors;
    }
    return [];
}
function withinMaint(repair, start, end) {
    const when = repair.restoredOn ?? repair.occurredOn;
    if (!when)
        return false;
    if (start && when < start)
        return false;
    if (end && when > end)
        return false;
    return true;
}
let PrinterAssetsService = class PrinterAssetsService {
    prisma;
    printers;
    constructor(prisma, printers) {
        this.prisma = prisma;
        this.printers = printers;
    }
    async create(dto) {
        const saved = await this.prisma.printerAsset.create({
            data: this.toData(dto),
            include: { maintVendor: true, company: true },
        });
        return this.toResponse(saved, await this.vendorsByMaker());
    }
    async findAll(includeDisabled = false, companyId) {
        const assets = await this.prisma.printerAsset.findMany({
            where: {
                ...(includeDisabled ? {} : { disabledAt: null }),
                ...(companyId ? { companyId } : {}),
            },
            orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
            include: { maintVendor: true, company: true },
        });
        const byMaker = await this.vendorsByMaker();
        return assets.map((asset) => this.toResponse(asset, byMaker));
    }
    async findOverview() {
        const [assets, printers, dailies, repairs, byMaker] = await Promise.all([
            this.prisma.printerAsset.findMany({
                where: { disabledAt: null },
                orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
                include: { maintVendor: true, company: true },
            }),
            this.prisma.printer.findMany({
                include: {
                    readings: { orderBy: { supplyIndex: 'asc' } },
                    alerts: { orderBy: { alertIndex: 'asc' } },
                },
            }),
            this.prisma.pageCountDaily.findMany({
                distinct: ['printerId'],
                orderBy: [{ printerId: 'asc' }, { date: 'desc' }],
            }),
            this.prisma.repairRecord.findMany({
                select: {
                    printerAssetId: true,
                    handledBy: true,
                    restoredOn: true,
                    occurredOn: true,
                    cost: true,
                    status: true,
                },
            }),
            this.vendorsByMaker(),
        ]);
        const live = (0, printer_match_1.indexPrinters)(printers, assets);
        const latest = new Map(dailies.map((row) => [row.printerId, row]));
        const repairsByAsset = new Map();
        for (const repair of repairs) {
            const list = repairsByAsset.get(repair.printerAssetId) ?? [];
            list.push(repair);
            repairsByAsset.set(repair.printerAssetId, list);
        }
        return assets.map((asset) => {
            const printer = (0, printer_match_1.matchPrinter)(asset, live);
            const daily = printer ? (latest.get(printer.id) ?? null) : null;
            return {
                ...this.toResponse(asset, byMaker),
                repairs: this.countRepairs(asset, repairsByAsset.get(asset.id) ?? []),
                printer: printer
                    ? {
                        id: printer.id,
                        ipAddress: printer.ipAddress,
                        protocol: printer.protocol,
                        hostName: printer.hostName,
                        model: printer.model,
                        serialNumber: printer.serialNumber,
                        macAddress: printer.macAddress,
                        pageCount: printer.pageCount,
                        counterUnit: printer.counterUnit,
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
                        date: (0, date_1.fromDate)(daily.date),
                        pages: daily.pages,
                        monoPages: daily.monoPages,
                        colorPages: daily.colorPages,
                        total: daily.total,
                        totalMono: daily.totalMono,
                        totalColor: daily.totalColor,
                        totalPrint: sumCounts(daily.totalPrintMono, daily.totalPrintColor),
                        totalCopy: sumCounts(daily.totalCopyMono, daily.totalCopyColor),
                        totalScan: sumCounts(daily.totalScanMono, daily.totalScanColor),
                    }
                    : null,
            };
        });
    }
    async findByModel(companyId) {
        const [assets, printers] = await Promise.all([
            this.prisma.printerAsset.findMany({
                where: { disabledAt: null, companyId },
                orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    department: true,
                    no: true,
                    ipAddress: true,
                    maker: true,
                    model: true,
                    serialNumber: true,
                    toners: {
                        select: {
                            toner: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                    recycled: true,
                                    alertThreshold: true,
                                    stocks: {
                                        where: { companyId },
                                        select: { quantity: true },
                                    },
                                    prices: {
                                        orderBy: { effectiveFrom: 'desc' },
                                        select: { price: true, effectiveFrom: true },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.printer.findMany({
                select: {
                    ipAddress: true,
                    serialNumber: true,
                    readings: {
                        select: { name: true, colorant: true, supplyType: true },
                    },
                },
            }),
        ]);
        const live = (0, printer_match_1.indexPrinters)(printers, assets);
        const now = (0, date_1.today)();
        const groups = new Map();
        const usersByToner = new Map();
        for (const asset of assets) {
            const user = {
                id: asset.id,
                name: [asset.maker, asset.model].filter(Boolean).join(' ') || null,
                department: asset.department,
                no: asset.no,
                ipAddress: asset.ipAddress,
                key: modelKey(asset.maker, asset.model),
                sameModel: false,
            };
            for (const { toner } of asset.toners) {
                const list = usersByToner.get(toner.id) ?? [];
                list.push(user);
                usersByToner.set(toner.id, list);
            }
        }
        const printersOf = (tonerId, key) => (usersByToner.get(tonerId) ?? [])
            .map(({ key: owner, ...user }) => ({
            ...user,
            sameModel: owner === key,
        }))
            .sort((a, b) => Number(b.sameModel) - Number(a.sameModel));
        for (const asset of assets) {
            const key = modelKey(asset.maker, asset.model);
            const group = groups.get(key) ?? {
                key,
                maker: asset.maker,
                model: asset.model,
                spellings: new Map(),
                toners: new Map(),
                assets: [],
                printerColors: new Set(),
                tonerColors: new Set(),
                polled: 0,
            };
            const spelling = [asset.maker, asset.model].filter(Boolean).join(' ');
            group.spellings.set(spelling, (group.spellings.get(spelling) ?? 0) + 1);
            const printer = (0, printer_match_1.matchPrinter)(asset, live);
            const supplies = (printer?.readings ?? []).filter((supply) => supply.supplyType === null ||
                supply_types_1.CONSUMABLE_TYPES.includes(supply.supplyType));
            if (supplies.length > 0)
                group.polled += 1;
            for (const supply of supplies) {
                const color = supplyColor(supply);
                if (color)
                    group.printerColors.add(color);
            }
            for (const { toner } of asset.toners) {
                for (const color of tonerColors(toner.color))
                    group.tonerColors.add(color);
                const known = group.toners.get(toner.id);
                if (known) {
                    known.assetCount += 1;
                    continue;
                }
                const current = toner.prices.find((row) => row.effectiveFrom <= now);
                group.toners.set(toner.id, {
                    id: toner.id,
                    name: toner.name,
                    color: toner.color,
                    recycled: toner.recycled,
                    alertThreshold: toner.alertThreshold,
                    price: current?.price ?? null,
                    stock: toner.stocks[0]?.quantity ?? 0,
                    assetCount: 1,
                    printers: printersOf(toner.id, key),
                });
            }
            group.assets.push({
                id: asset.id,
                department: asset.department,
                no: asset.no,
                ipAddress: asset.ipAddress,
                maker: asset.maker,
                model: asset.model,
                serialNumber: asset.serialNumber,
                tonerIds: asset.toners.map((link) => link.toner.id).sort(),
            });
            groups.set(key, group);
        }
        return [...groups.values()]
            .map((group) => {
            const spellings = [...group.spellings.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([text]) => text);
            const signatures = new Set(group.assets.map((asset) => asset.tonerIds.join(',')));
            const fromPrinter = group.printerColors.size > 0;
            const found = fromPrinter ? group.printerColors : group.tonerColors;
            const colors = COLOR_ORDER.filter((color) => found.has(color));
            return {
                key: group.key,
                maker: group.maker,
                model: group.model,
                spellings,
                assetCount: group.assets.length,
                linkedCount: group.assets.filter((a) => a.tonerIds.length > 0).length,
                mixed: signatures.size > 1,
                colors,
                colorSource: colors.length === 0 ? null : fromPrinter ? 'printer' : 'toner',
                polled: group.polled,
                toners: [...group.toners.values()].sort((a, b) => a.id.localeCompare(b.id, 'ja', { numeric: true })),
                assets: group.assets,
            };
        })
            .sort((a, b) => (a.maker ?? '').localeCompare(b.maker ?? '', 'ja') ||
            (a.model ?? '').localeCompare(b.model ?? '', 'ja', { numeric: true }));
    }
    async findOne(id) {
        const asset = await this.prisma.printerAsset.findUnique({
            where: { id },
            include: { maintVendor: true, company: true },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`ID ${id} の端末情報は登録されていません`);
        }
        return this.toResponse(asset, await this.vendorsByMaker());
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const saved = await this.prisma.printerAsset.update({
            where: { id },
            data: this.toData(dto),
            include: { maintVendor: true, company: true },
        });
        return this.toResponse(saved, await this.vendorsByMaker());
    }
    async refresh(id) {
        const asset = await this.findOne(id);
        if (!asset.ipAddress) {
            await this.touch(id);
            return {
                id,
                ipAddress: null,
                status: 'no-ip',
                message: 'IP アドレスが未入力なので実機に問い合わせできません',
                printer: null,
                serial: null,
            };
        }
        try {
            const printer = await this.printers.create({
                ipAddress: asset.ipAddress,
            });
            const serial = await this.fillSerial(id, asset.serialNumber, printer.serialNumber);
            await this.touch(id);
            return {
                id,
                ipAddress: asset.ipAddress,
                status: 'ok',
                message: null,
                printer,
                serial,
            };
        }
        catch (error) {
            await this.touch(id);
            return {
                id,
                ipAddress: asset.ipAddress,
                status: 'unreachable',
                message: error instanceof Error ? error.message : '応答がありません',
                printer: null,
                serial: null,
            };
        }
    }
    async touch(id) {
        await this.ensureExists(id);
        const saved = await this.prisma.printerAsset.update({
            where: { id },
            data: { updatedAt: new Date() },
            include: { maintVendor: true, company: true },
        });
        return this.toResponse(saved, await this.vendorsByMaker());
    }
    async setDisabled(id, disabled) {
        await this.ensureExists(id);
        const saved = await this.prisma.printerAsset.update({
            where: { id },
            data: { disabledAt: disabled ? new Date() : null },
            include: { maintVendor: true, company: true },
        });
        return this.toResponse(saved, await this.vendorsByMaker());
    }
    async remove(id) {
        const asset = await this.prisma.printerAsset.findUnique({
            where: { id },
            select: {
                id: true,
                no: true,
                department: true,
                model: true,
                serialNumber: true,
                disabledAt: true,
                _count: { select: { repairs: true, toners: true } },
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException(`ID ${id} の機器は登録されていません`);
        }
        const label = [
            asset.no ? `No.${asset.no}` : null,
            asset.department,
            asset.model,
        ]
            .filter(Boolean)
            .join(' / ');
        if (asset.disabledAt === null) {
            throw new common_1.BadRequestException(`${label} はまだ有効です。先に無効にしてから削除してください`);
        }
        if (asset._count.repairs > 0) {
            throw new common_1.BadRequestException(`${label} には修理履歴が ${asset._count.repairs} 件あり、削除すると一緒に消えます。` +
                '無効のままにしておけば、一覧と選択肢からは外れたまま履歴が残ります');
        }
        await this.prisma.printerAsset.delete({ where: { id } });
        return {
            id,
            deleted: true,
            removed: { toners: asset._count.toners },
        };
    }
    async fillSerial(id, current, fromPrinter) {
        const serialNumber = (0, text_1.toText)(fromPrinter);
        if ((0, text_1.toText)(current) || !serialNumber)
            return null;
        const taken = await this.prisma.printerAsset.findFirst({
            where: {
                id: { not: id },
                serialNumber: { equals: serialNumber, mode: 'insensitive' },
            },
            select: { id: true, department: true, no: true },
            orderBy: { id: 'asc' },
        });
        if (taken) {
            return {
                status: 'taken',
                serialNumber,
                assetId: taken.id,
                department: taken.department,
                no: taken.no,
            };
        }
        await this.prisma.printerAsset.update({
            where: { id },
            data: { serialNumber },
        });
        return { status: 'filled', serialNumber };
    }
    async ensureExists(id) {
        const found = await this.prisma.printerAsset.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!found) {
            throw new common_1.NotFoundException(`ID ${id} の端末情報は登録されていません`);
        }
    }
    countRepairs(asset, repairs) {
        const inWindow = repairs.filter((repair) => withinMaint(repair, asset.maintStartOn, asset.maintEndOn));
        const withCost = inWindow.filter((r) => r.cost !== null);
        return {
            hasMaint: asset.maintStartOn !== null || asset.maintEndOn !== null,
            inHouse: inWindow.filter((r) => r.handledBy === 'IN_HOUSE').length,
            vendor: inWindow.filter((r) => r.handledBy === 'VENDOR').length,
            cost: withCost.reduce((sum, r) => sum + (r.cost ?? 0), 0),
            costKnown: withCost.length,
            open: repairs.filter((r) => r.status !== 'DONE').length,
            total: repairs.length,
        };
    }
    toData(dto) {
        return {
            companyId: dto.companyId,
            department: (0, text_1.toText)(dto.department),
            no: (0, text_1.toText)(dto.no),
            ipAddress: (0, text_1.toText)(dto.ipAddress),
            maker: (0, text_1.toText)(dto.maker),
            model: (0, text_1.toText)(dto.model),
            serialNumber: (0, text_1.toText)(dto.serialNumber),
            purchasedOn: (0, date_1.toDate)(dto.purchasedOn),
            purchasePrice: dto.purchasePrice ?? null,
            contractNo: (0, text_1.toText)(dto.contractNo),
            maintVendorId: dto.maintVendorId ?? null,
            maintContract: (0, text_1.toText)(dto.maintContract),
            maintStartOn: (0, date_1.toDate)(dto.maintStartOn),
            maintEndOn: (0, date_1.toDate)(dto.maintEndOn),
            maintDealOn: (0, date_1.toDate)(dto.maintDealOn),
            maintFee: dto.maintFee ?? null,
            note: (0, text_1.toText)(dto.note),
            countLayout: dto.countLayout ?? 'TOTAL',
        };
    }
    async vendorsByMaker() {
        const vendors = await this.prisma.maintVendor.findMany({
            select: { id: true, name: true, phones: true, makers: true },
        });
        const byMaker = new Map();
        for (const vendor of vendors) {
            for (const maker of vendor.makers)
                byMaker.set((0, maint_vendors_service_1.makerKey)(maker), vendor);
        }
        return byMaker;
    }
    effectiveVendor(asset, byMaker) {
        if (asset.maintVendor) {
            return { ...toVendor(asset.maintVendor), source: 'asset' };
        }
        const fallback = asset.maker ? byMaker.get((0, maint_vendors_service_1.makerKey)(asset.maker)) : null;
        return fallback
            ? { ...toVendor(fallback), source: 'maker' }
            : null;
    }
    toResponse(asset, byMaker) {
        return {
            id: asset.id,
            companyId: asset.companyId,
            company: asset.company
                ? { id: asset.company.id, name: asset.company.name }
                : null,
            department: asset.department,
            no: asset.no,
            ipAddress: asset.ipAddress,
            maker: asset.maker,
            model: asset.model,
            serialNumber: asset.serialNumber,
            purchasedOn: (0, date_1.fromDate)(asset.purchasedOn),
            purchasePrice: asset.purchasePrice,
            contractNo: asset.contractNo,
            maintVendorId: asset.maintVendorId,
            maintVendor: asset.maintVendor ? toVendor(asset.maintVendor) : null,
            effectiveVendor: this.effectiveVendor(asset, byMaker),
            maintContract: asset.maintContract,
            maintStartOn: (0, date_1.fromDate)(asset.maintStartOn),
            maintEndOn: (0, date_1.fromDate)(asset.maintEndOn),
            maintDealOn: (0, date_1.fromDate)(asset.maintDealOn),
            maintFee: asset.maintFee,
            note: asset.note,
            countLayout: asset.countLayout,
            disabledAt: asset.disabledAt,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
        };
    }
};
exports.PrinterAssetsService = PrinterAssetsService;
exports.PrinterAssetsService = PrinterAssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        printers_service_1.PrintersService])
], PrinterAssetsService);
//# sourceMappingURL=printer-assets.service.js.map