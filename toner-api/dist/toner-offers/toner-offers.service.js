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
exports.TonerOffersService = exports.codeKey = void 0;
exports.unitPriceOf = unitPriceOf;
exports.basePerPageOf = basePerPageOf;
exports.orderUnitsOf = orderUnitsOf;
exports.shippingPerPageOf = shippingPerPageOf;
exports.costPerPageOf = costPerPageOf;
exports.toModels = toModels;
const common_1 = require("@nestjs/common");
const date_1 = require("../common/date");
const text_1 = require("../common/text");
const write_mode_1 = require("../common/write-mode");
const maint_vendors_service_1 = require("../maint-vendors/maint-vendors.service");
const printer_assets_service_1 = require("../printer-assets/printer-assets.service");
const prisma_service_1 = require("../prisma/prisma.service");
const codeKey = (code) => (0, maint_vendors_service_1.makerKey)(code);
exports.codeKey = codeKey;
function unitPriceOf(offer) {
    return offer.price === null ? null : offer.price / offer.packQuantity;
}
function basePerPageOf(offer) {
    if (offer.pagePrice !== null)
        return offer.pagePrice;
    const unit = unitPriceOf(offer);
    return unit !== null && offer.yieldPages ? unit / offer.yieldPages : null;
}
function orderUnitsOf(offer) {
    return Math.max(offer.minOrder ?? offer.packQuantity, offer.packQuantity);
}
function shippingPerPageOf(offer) {
    if (!offer.shippingFee)
        return 0;
    if (!offer.yieldPages)
        return null;
    return offer.shippingFee / (orderUnitsOf(offer) * offer.yieldPages);
}
function costPerPageOf(offer) {
    const base = basePerPageOf(offer);
    return base === null ? null : base + (shippingPerPageOf(offer) ?? 0);
}
function toModels(models) {
    const seen = new Set();
    const kept = [];
    for (const item of models ?? []) {
        const model = item.model.trim();
        if (model === '')
            continue;
        const maker = (0, text_1.toText)(item.maker);
        const key = (0, printer_assets_service_1.modelKey)(maker, model);
        if (seen.has(key))
            continue;
        seen.add(key);
        kept.push({ maker, model });
    }
    return kept;
}
let TonerOffersService = class TonerOffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const [rows, context, colors] = await Promise.all([
            this.prisma.tonerOffer.findMany({
                orderBy: [{ code: 'asc' }, { seller: 'asc' }, { id: 'asc' }],
                include: { models: { orderBy: { id: 'asc' } } },
            }),
            this.context(),
            this.prisma.toner.findMany({
                where: { color: { not: null } },
                select: { color: true },
            }),
        ]);
        return {
            offers: rows.map((row) => this.toResponse(row, context)),
            models: [...context.models.values()].sort((a, b) => a.label.localeCompare(b.label, 'ja', { numeric: true })),
            tonerColors: colors
                .map((row) => row.color)
                .filter((color) => color !== null),
        };
    }
    async findOne(id) {
        const row = await this.prisma.tonerOffer.findUnique({
            where: { id },
            include: { models: { orderBy: { id: 'asc' } } },
        });
        if (!row) {
            throw new common_1.NotFoundException(`ID ${id} の比較用トナーは登録されていません`);
        }
        return this.toResponse(row, await this.context());
    }
    async create(dto) {
        this.ensureDates(dto);
        const saved = await this.prisma.tonerOffer.create({
            data: {
                ...this.toData(dto, 'create'),
                models: { create: toModels(dto.models) },
            },
            select: { id: true },
        });
        return this.findOne(saved.id);
    }
    async update(id, dto) {
        await this.ensureExists(id);
        this.ensureDates(dto);
        await this.prisma.$transaction(async (tx) => {
            await tx.tonerOffer.update({
                where: { id },
                data: this.toData(dto, 'update'),
            });
            if (dto.models !== undefined) {
                await tx.tonerOfferModel.deleteMany({ where: { offerId: id } });
                const models = toModels(dto.models);
                if (models.length > 0) {
                    await tx.tonerOfferModel.createMany({
                        data: models.map((item) => ({ ...item, offerId: id })),
                    });
                }
            }
        });
        return this.findOne(id);
    }
    async remove(id) {
        await this.ensureExists(id);
        await this.prisma.tonerOffer.delete({ where: { id } });
        return { id, deleted: true };
    }
    async ensureExists(id) {
        const found = await this.prisma.tonerOffer.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!found) {
            throw new common_1.NotFoundException(`ID ${id} の比較用トナーは登録されていません`);
        }
    }
    ensureDates(dto) {
        if (dto.quotedOn && dto.validUntil && dto.validUntil < dto.quotedOn) {
            throw new common_1.BadRequestException('見積の有効期限が価格を確かめた日より前になっています。日付を確認してください');
        }
    }
    async context() {
        const [assets, toners] = await Promise.all([
            this.prisma.printerAsset.findMany({
                where: { disabledAt: null },
                select: { maker: true, model: true },
            }),
            this.prisma.toner.findMany({
                where: { disabledAt: null, hidden: false },
                select: { id: true },
            }),
        ]);
        const spellings = new Map();
        for (const asset of assets) {
            const model = asset.model?.trim();
            if (!model)
                continue;
            const maker = asset.maker?.trim() || null;
            const key = (0, printer_assets_service_1.modelKey)(maker, model);
            const seen = spellings.get(key) ?? new Map();
            const label = [maker, model].filter(Boolean).join(' ');
            const cur = seen.get(label) ?? { maker, model, count: 0 };
            cur.count += 1;
            seen.set(label, cur);
            spellings.set(key, seen);
        }
        const models = new Map();
        for (const [key, seen] of spellings) {
            const [label, best] = [...seen.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0], 'ja'))[0];
            models.set(key, {
                key,
                maker: best.maker,
                model: best.model,
                label,
                assetCount: [...seen.values()].reduce((sum, s) => sum + s.count, 0),
            });
        }
        return {
            models,
            masterCodes: new Map(toners.map((toner) => [(0, exports.codeKey)(toner.id), toner.id])),
        };
    }
    toData(dto, mode) {
        return {
            code: dto.code.trim(),
            seller: dto.seller.trim(),
            name: (0, write_mode_1.field)(mode, dto.name, text_1.toText, null),
            brand: (0, write_mode_1.field)(mode, dto.brand, text_1.toText, null),
            kind: (0, write_mode_1.field)(mode, dto.kind, write_mode_1.asIs, 'GENUINE'),
            part: (0, write_mode_1.field)(mode, dto.part, write_mode_1.asIs, 'TONER'),
            color: (0, write_mode_1.field)(mode, dto.color, text_1.toText, null),
            yieldPages: (0, write_mode_1.field)(mode, dto.yieldPages, write_mode_1.asIs, null),
            packQuantity: (0, write_mode_1.field)(mode, dto.packQuantity, write_mode_1.asIs, 1),
            purchaseType: (0, write_mode_1.field)(mode, dto.purchaseType, write_mode_1.asIs, 'SPOT'),
            price: (0, write_mode_1.field)(mode, dto.price, write_mode_1.asIs, null),
            pagePrice: (0, write_mode_1.field)(mode, dto.pagePrice, write_mode_1.asIs, null),
            monthlyFee: (0, write_mode_1.field)(mode, dto.monthlyFee, write_mode_1.asIs, null),
            shippingFee: (0, write_mode_1.field)(mode, dto.shippingFee, write_mode_1.asIs, null),
            minOrder: (0, write_mode_1.field)(mode, dto.minOrder, write_mode_1.asIs, null),
            leadTime: (0, write_mode_1.field)(mode, dto.leadTime, text_1.toText, null),
            warranty: (0, write_mode_1.field)(mode, dto.warranty, text_1.toText, null),
            takesBack: (0, write_mode_1.field)(mode, dto.takesBack, write_mode_1.asIs, null),
            payment: (0, write_mode_1.field)(mode, dto.payment, text_1.toText, null),
            quotedOn: (0, write_mode_1.field)(mode, dto.quotedOn, date_1.toDate, null),
            validUntil: (0, write_mode_1.field)(mode, dto.validUntil, date_1.toDate, null),
            reference: (0, write_mode_1.field)(mode, dto.reference, text_1.toText, null),
            url: (0, write_mode_1.field)(mode, dto.url, text_1.toText, null),
            contact: (0, write_mode_1.field)(mode, dto.contact, text_1.toText, null),
            note: (0, write_mode_1.field)(mode, dto.note, text_1.toText, null),
        };
    }
    toResponse(row, context) {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            brand: row.brand,
            kind: row.kind,
            part: row.part,
            color: row.color,
            yieldPages: row.yieldPages,
            packQuantity: row.packQuantity,
            seller: row.seller,
            purchaseType: row.purchaseType,
            price: row.price,
            pagePrice: row.pagePrice,
            monthlyFee: row.monthlyFee,
            shippingFee: row.shippingFee,
            minOrder: row.minOrder,
            leadTime: row.leadTime,
            warranty: row.warranty,
            takesBack: row.takesBack,
            payment: row.payment,
            quotedOn: (0, date_1.fromDate)(row.quotedOn),
            validUntil: (0, date_1.fromDate)(row.validUntil),
            reference: row.reference,
            url: row.url,
            contact: row.contact,
            note: row.note,
            unitPrice: unitPriceOf(row),
            basePerPage: basePerPageOf(row),
            orderUnits: orderUnitsOf(row),
            shippingPerPage: shippingPerPageOf(row),
            costPerPage: costPerPageOf(row),
            models: row.models.map((item) => {
                const key = (0, printer_assets_service_1.modelKey)(item.maker, item.model);
                return {
                    maker: item.maker,
                    model: item.model,
                    key,
                    label: [item.maker, item.model].filter(Boolean).join(' '),
                    assetCount: context.models.get(key)?.assetCount ?? 0,
                };
            }),
            masterId: context.masterCodes.get((0, exports.codeKey)(row.code)) ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
};
exports.TonerOffersService = TonerOffersService;
exports.TonerOffersService = TonerOffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonerOffersService);
//# sourceMappingURL=toner-offers.service.js.map