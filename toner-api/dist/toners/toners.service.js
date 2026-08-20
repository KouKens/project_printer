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
exports.TonersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function toDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function fromDate(value) {
    const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${value.getUTCDate()}`.padStart(2, '0');
    return `${value.getUTCFullYear()}-${month}-${day}`;
}
function today() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
function toText(value) {
    if (value === undefined || value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
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
        await this.prisma.$transaction(async (tx) => {
            await tx.toner.create({
                data: {
                    id,
                    name: toText(dto.name),
                    color: toText(dto.color),
                    recycled: dto.recycled ?? false,
                    stock: { create: {} },
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
                            ? toDate(dto.effectiveFrom)
                            : today(),
                    },
                });
            }
        });
        return this.findOne(id);
    }
    async findAll() {
        const toners = await this.prisma.toner.findMany({
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            include: {
                stock: true,
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
            },
        });
        return toners.map((toner) => this.toResponse(toner));
    }
    async findOne(id) {
        const toner = await this.prisma.toner.findUnique({
            where: { id },
            include: {
                stock: true,
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
            },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        return this.toResponse(toner);
    }
    async update(id, dto) {
        const toner = await this.prisma.toner.findUnique({ where: { id } });
        if (!toner) {
            throw new common_1.NotFoundException(`${id} は登録されていません`);
        }
        if (dto.printerAssetIds !== undefined) {
            await this.assertAssetsExist(dto.printerAssetIds);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.toner.update({
                where: { id },
                data: {
                    name: dto.name === undefined ? undefined : toText(dto.name),
                    color: dto.color === undefined ? undefined : toText(dto.color),
                    recycled: dto.recycled,
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
            ? toDate(dto.effectiveFrom)
            : today();
        await this.prisma.tonerPrice.upsert({
            where: { tonerId_effectiveFrom: { tonerId: id, effectiveFrom } },
            create: {
                tonerId: id,
                price: dto.price,
                effectiveFrom,
                note: toText(dto.note),
            },
            update: { price: dto.price, note: toText(dto.note) },
        });
        return this.findOne(id);
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
            effectiveFrom: fromDate(row.effectiveFrom),
            note: row.note,
            createdAt: row.createdAt,
        }));
    }
    async priceAt(id, date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new common_1.BadRequestException('日付は YYYY-MM-DD の形式で指定してください');
        }
        const row = await this.prisma.tonerPrice.findFirst({
            where: { tonerId: id, effectiveFrom: { lte: toDate(date) } },
            orderBy: { effectiveFrom: 'desc' },
        });
        return row?.price ?? null;
    }
    async assertAssetsExist(assetIds) {
        if (assetIds.length === 0)
            return;
        const found = await this.prisma.printerAsset.findMany({
            where: { id: { in: assetIds } },
            select: { id: true },
        });
        const missing = assetIds.filter((id) => !found.some((asset) => asset.id === id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`端末情報に無いプリンターが指定されています（ID ${missing.join(', ')}）`);
        }
    }
    currentPrice(prices) {
        const now = today();
        return prices.find((row) => row.effectiveFrom <= now) ?? null;
    }
    toResponse(toner) {
        const current = this.currentPrice(toner.prices);
        return {
            id: toner.id,
            name: toner.name,
            color: toner.color,
            recycled: toner.recycled,
            price: current?.price ?? null,
            priceFrom: current ? fromDate(current.effectiveFrom) : null,
            priceCount: toner.prices.length,
            stock: toner.stock?.quantity ?? 0,
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