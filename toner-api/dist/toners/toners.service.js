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
exports.TonersService = exports.VOLUME_DAYS = void 0;
exports.monthlyPagesOf = monthlyPagesOf;
const common_1 = require("@nestjs/common");
const date_1 = require("../common/date");
const text_1 = require("../common/text");
const printer_assets_service_1 = require("../printer-assets/printer-assets.service");
const printer_match_1 = require("../printers/printer-match");
const prisma_service_1 = require("../prisma/prisma.service");
exports.VOLUME_DAYS = 90;
const VOLUME_MIN_DAYS = 7;
const DAYS_PER_MONTH = 365 / 12;
const DAY_MS = 86_400_000;
function monthlyPagesOf(rows) {
    const counted = rows.filter((row) => row.pages !== null);
    if (counted.length < VOLUME_MIN_DAYS)
        return null;
    const total = counted.reduce((sum, row) => sum + row.pages, 0);
    return (total / counted.length) * DAYS_PER_MONTH;
}
const TONER_INCLUDE = {
    stocks: true,
    prices: { orderBy: { effectiveFrom: 'desc' } },
    printers: {
        include: {
            asset: {
                select: {
                    id: true,
                    department: true,
                    no: true,
                    ipAddress: true,
                    maker: true,
                    model: true,
                },
            },
        },
    },
    alternatives: { select: { id: true }, orderBy: { id: 'asc' } },
};
function sumStock(stocks) {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
}
let TonersService = class TonersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const id = dto.id.trim();
        const exists = await this.prisma.toner.findUnique({ where: { id } });
        if (exists) {
            throw new common_1.ConflictException(`${id} はすでに登録されています`);
        }
        await this.assertAssetsExist(dto.printerAssetIds ?? []);
        const recycled = dto.recycled ?? false;
        const genuineId = await this.resolveGenuine(id, recycled, dto.genuineId ?? null);
        await this.prisma.$transaction(async (tx) => {
            await tx.toner.create({
                data: {
                    id,
                    name: (0, text_1.toText)(dto.name),
                    color: (0, text_1.toText)(dto.color),
                    part: dto.part ?? 'TONER',
                    recycled,
                    genuineId,
                    hidden: dto.hidden ?? false,
                    alertThreshold: dto.alertThreshold ?? null,
                    yieldPages: dto.yieldPages ?? null,
                    printers: {
                        create: (dto.printerAssetIds ?? []).map((printerAssetId) => ({
                            printerAssetId,
                        })),
                    },
                },
            });
            if (dto.price !== undefined && dto.price !== null) {
                await tx.tonerPrice.create({
                    data: {
                        tonerId: id,
                        price: dto.price,
                        effectiveFrom: dto.effectiveFrom
                            ? (0, date_1.toDate)(dto.effectiveFrom)
                            : (0, date_1.today)(),
                    },
                });
            }
        });
        return this.findOne(id);
    }
    async findAll(includeDisabled = false) {
        const toners = await this.prisma.toner.findMany({
            where: includeDisabled ? {} : { disabledAt: null, hidden: false },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            include: TONER_INCLUDE,
        });
        return toners.map((toner) => this.toResponse(toner));
    }
    async findOne(id) {
        const toner = await this.prisma.toner.findUnique({
            where: { id },
            include: TONER_INCLUDE,
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        return this.toResponse(toner);
    }
    async findHiddenIds() {
        const rows = await this.prisma.toner.findMany({
            where: { hidden: true },
            select: { id: true },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => row.id);
    }
    async findPriceCompare() {
        const since = new Date((0, date_1.today)().getTime() - exports.VOLUME_DAYS * DAY_MS);
        const [toners, assets, printers, dailies] = await Promise.all([
            this.prisma.toner.findMany({
                orderBy: [{ name: 'asc' }, { id: 'asc' }],
                include: {
                    prices: { orderBy: { effectiveFrom: 'asc' } },
                    printers: {
                        where: { asset: { disabledAt: null } },
                        select: { printerAssetId: true },
                    },
                },
            }),
            this.prisma.printerAsset.findMany({
                where: { disabledAt: null },
                orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    no: true,
                    department: true,
                    maker: true,
                    model: true,
                    ipAddress: true,
                    serialNumber: true,
                    company: { select: { name: true } },
                },
            }),
            this.prisma.printer.findMany({
                select: { id: true, ipAddress: true, serialNumber: true },
            }),
            this.prisma.pageCountDaily.findMany({
                where: { date: { gte: since } },
                select: { printerId: true, pages: true },
            }),
        ]);
        const pagesByPrinter = new Map();
        for (const row of dailies) {
            const list = pagesByPrinter.get(row.printerId) ?? [];
            list.push(row);
            pagesByPrinter.set(row.printerId, list);
        }
        const live = (0, printer_match_1.indexPrinters)(printers, assets);
        const spellings = new Map();
        const assetCounts = new Map();
        for (const asset of assets) {
            const key = (0, printer_assets_service_1.modelKey)(asset.maker, asset.model);
            const spelling = [asset.maker, asset.model].filter(Boolean).join(' ');
            const seen = spellings.get(key) ?? new Map();
            seen.set(spelling, (seen.get(spelling) ?? 0) + 1);
            spellings.set(key, seen);
            assetCounts.set(key, (assetCounts.get(key) ?? 0) + 1);
        }
        const models = [...spellings.entries()]
            .map(([key, seen]) => {
            const label = [...seen.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
            return {
                key,
                label,
                assetCount: assetCounts.get(key) ?? 0,
            };
        })
            .sort((a, b) => a.label.localeCompare(b.label, 'ja', { numeric: true }));
        const assetById = new Map(assets.map((asset) => [asset.id, asset]));
        const now = (0, date_1.today)();
        return {
            models,
            volumeDays: exports.VOLUME_DAYS,
            assets: assets.map((asset) => {
                const printer = (0, printer_match_1.matchPrinter)(asset, live);
                return {
                    id: asset.id,
                    no: asset.no,
                    department: asset.department,
                    maker: asset.maker,
                    model: asset.model,
                    companyName: asset.company?.name ?? null,
                    modelKey: (0, printer_assets_service_1.modelKey)(asset.maker, asset.model),
                    monthlyPages: printer === null
                        ? null
                        : monthlyPagesOf(pagesByPrinter.get(printer.id) ?? []),
                };
            }),
            toners: toners.map((toner) => {
                const current = toner.prices.filter((row) => row.effectiveFrom <= now).at(-1) ?? null;
                const linked = toner.printers
                    .map((link) => assetById.get(link.printerAssetId))
                    .filter((asset) => asset !== undefined);
                return {
                    id: toner.id,
                    name: toner.name,
                    color: toner.color,
                    part: toner.part,
                    recycled: toner.recycled,
                    genuineId: toner.genuineId,
                    hidden: toner.hidden,
                    disabledAt: toner.disabledAt,
                    yieldPages: toner.yieldPages,
                    price: current?.price ?? null,
                    priceFrom: current ? (0, date_1.fromDate)(current.effectiveFrom) : null,
                    costPerPage: current && toner.yieldPages
                        ? current.price / toner.yieldPages
                        : null,
                    prices: toner.prices.map((row) => ({
                        effectiveFrom: (0, date_1.fromDate)(row.effectiveFrom),
                        price: row.price,
                        note: row.note,
                    })),
                    printers: linked.map((asset) => ({
                        id: asset.id,
                        no: asset.no,
                        department: asset.department,
                        maker: asset.maker,
                        model: asset.model,
                        companyName: asset.company?.name ?? null,
                    })),
                    modelKeys: [
                        ...new Set(linked.map((asset) => (0, printer_assets_service_1.modelKey)(asset.maker, asset.model))),
                    ],
                };
            }),
        };
    }
    async update(id, dto) {
        const toner = await this.prisma.toner.findUnique({
            where: { id },
            include: { _count: { select: { alternatives: true } } },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        if (dto.printerAssetIds !== undefined) {
            await this.assertAssetsExist(dto.printerAssetIds);
        }
        const recycled = dto.recycled ?? toner.recycled;
        if (recycled && toner._count.alternatives > 0) {
            throw new common_1.BadRequestException(`${id} はリサイクル品 ${toner._count.alternatives} 件から純正品として選ばれているため、` +
                'リサイクル品・互換品にはできません。先にそちらの「純正品」を外してください');
        }
        const genuineId = dto.genuineId !== undefined
            ? await this.resolveGenuine(id, recycled, dto.genuineId)
            : !recycled && toner.genuineId !== null
                ? null
                : undefined;
        await this.prisma.$transaction(async (tx) => {
            await tx.toner.update({
                where: { id },
                data: {
                    name: dto.name === undefined ? undefined : (0, text_1.toText)(dto.name),
                    color: dto.color === undefined ? undefined : (0, text_1.toText)(dto.color),
                    part: dto.part,
                    recycled: dto.recycled,
                    genuineId,
                    hidden: dto.hidden,
                    alertThreshold: dto.alertThreshold === undefined ? undefined : dto.alertThreshold,
                    yieldPages: dto.yieldPages === undefined ? undefined : dto.yieldPages,
                },
            });
            if (dto.printerAssetIds !== undefined) {
                await tx.tonerPrinter.deleteMany({ where: { tonerId: id } });
                if (dto.printerAssetIds.length > 0) {
                    await tx.tonerPrinter.createMany({
                        data: dto.printerAssetIds.map((printerAssetId) => ({
                            tonerId: id,
                            printerAssetId,
                        })),
                    });
                }
            }
        });
        return this.findOne(id);
    }
    async addPrice(id, dto) {
        const toner = await this.prisma.toner.findUnique({ where: { id } });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        const effectiveFrom = dto.effectiveFrom
            ? (0, date_1.toDate)(dto.effectiveFrom)
            : (0, date_1.today)();
        await this.prisma.tonerPrice.upsert({
            where: { tonerId_effectiveFrom: { tonerId: id, effectiveFrom } },
            create: {
                tonerId: id,
                price: dto.price,
                effectiveFrom,
                note: (0, text_1.toText)(dto.note),
            },
            update: { price: dto.price, note: (0, text_1.toText)(dto.note) },
        });
        return this.findOne(id);
    }
    async setDisabled(id, disabled) {
        const toner = await this.prisma.toner.findUnique({ where: { id } });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        await this.prisma.toner.update({
            where: { id },
            data: { disabledAt: disabled ? new Date() : null },
        });
        return this.findOne(id);
    }
    async remove(id) {
        const toner = await this.prisma.toner.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        entries: true,
                        orders: true,
                        invoiceLines: true,
                        printers: true,
                        prices: true,
                        alternatives: true,
                    },
                },
                stocks: true,
            },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        if (toner.disabledAt === null) {
            throw new common_1.BadRequestException(`${id} はまだ有効です。先に無効にしてから削除してください`);
        }
        const blockers = [];
        if (toner._count.entries > 0) {
            blockers.push(`受付の履歴 ${toner._count.entries} 件`);
        }
        if (toner._count.orders > 0) {
            blockers.push(`注文 ${toner._count.orders} 件`);
        }
        if (toner._count.invoiceLines > 0) {
            blockers.push(`請求書の明細 ${toner._count.invoiceLines} 件`);
        }
        const quantity = sumStock(toner.stocks);
        if (quantity > 0) {
            blockers.push(`在庫 ${quantity} 本`);
        }
        if (blockers.length > 0) {
            throw new common_1.BadRequestException(`${id} は${blockers.join('・')}から参照されているため削除できません。` +
                '無効のままにしておけば、一覧と選択肢からは外れたまま記録が残ります');
        }
        await this.prisma.toner.delete({ where: { id } });
        return {
            id,
            deleted: true,
            removed: {
                prices: toner._count.prices,
                printers: toner._count.printers,
                alternatives: toner._count.alternatives,
            },
        };
    }
    async findPrices(id) {
        const toner = await this.prisma.toner.findUnique({
            where: { id },
            include: { prices: { orderBy: { effectiveFrom: 'desc' } } },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        return toner.prices.map((row) => ({
            id: row.id,
            price: row.price,
            effectiveFrom: (0, date_1.fromDate)(row.effectiveFrom),
            note: row.note,
            createdAt: row.createdAt,
        }));
    }
    async priceAt(id, date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new common_1.BadRequestException('日付は YYYY-MM-DD の形式で指定してください');
        }
        const row = await this.prisma.tonerPrice.findFirst({
            where: { tonerId: id, effectiveFrom: { lte: (0, date_1.toDate)(date) } },
            orderBy: { effectiveFrom: 'desc' },
        });
        return row?.price ?? null;
    }
    async resolveGenuine(selfId, recycled, genuineId) {
        const target = genuineId?.trim() || null;
        if (target === null)
            return null;
        if (!recycled) {
            throw new common_1.BadRequestException('純正品には「純正品」を選べません。リサイクル品・互換品にしてから選んでください');
        }
        if (target === selfId) {
            throw new common_1.BadRequestException('自分自身は純正品に選べません');
        }
        const genuine = await this.prisma.toner.findUnique({
            where: { id: target },
            select: { recycled: true },
        });
        if (!genuine) {
            throw new common_1.BadRequestException(`純正品に選んだ ${target} は登録されていません`);
        }
        if (genuine.recycled) {
            throw new common_1.BadRequestException(`${target} はリサイクル品・互換品です。純正品を選んでください`);
        }
        return target;
    }
    async assertAssetsExist(assetIds) {
        if (assetIds.length === 0)
            return;
        const found = await this.prisma.printerAsset.findMany({
            where: { id: { in: assetIds } },
            select: { id: true },
        });
        const registered = new Set(found.map((asset) => asset.id));
        const missing = assetIds.filter((id) => !registered.has(id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`端末情報に無いプリンターが指定されています（ID ${missing.join(', ')}）`);
        }
    }
    currentPrice(prices) {
        const now = (0, date_1.today)();
        return prices.find((row) => row.effectiveFrom <= now) ?? null;
    }
    toResponse(toner) {
        const current = this.currentPrice(toner.prices);
        return {
            id: toner.id,
            name: toner.name,
            color: toner.color,
            part: toner.part,
            recycled: toner.recycled,
            genuineId: toner.genuineId,
            alternativeIds: toner.alternatives.map((alt) => alt.id),
            hidden: toner.hidden,
            alertThreshold: toner.alertThreshold,
            yieldPages: toner.yieldPages,
            price: current?.price ?? null,
            costPerPage: current && toner.yieldPages ? current.price / toner.yieldPages : null,
            priceFrom: current ? (0, date_1.fromDate)(current.effectiveFrom) : null,
            priceCount: toner.prices.length,
            disabledAt: toner.disabledAt,
            stock: sumStock(toner.stocks),
            printers: toner.printers.map((link) => ({
                id: link.asset.id,
                department: link.asset.department,
                no: link.asset.no,
                ipAddress: link.asset.ipAddress,
                maker: link.asset.maker,
                model: link.asset.model,
            })),
            createdAt: toner.createdAt,
            updatedAt: toner.updatedAt,
        };
    }
};
exports.TonersService = TonersService;
exports.TonersService = TonersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonersService);
//# sourceMappingURL=toners.service.js.map