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
exports.MaintVendorsService = void 0;
exports.makerKey = makerKey;
const common_1 = require("@nestjs/common");
const text_1 = require("../common/text");
const prisma_service_1 = require("../prisma/prisma.service");
function makerKey(maker) {
    return maker.trim().toLowerCase();
}
function toMakers(makers) {
    const seen = new Set();
    const kept = [];
    for (const maker of makers ?? []) {
        const text = maker.trim();
        if (text.length === 0 || seen.has(makerKey(text)))
            continue;
        seen.add(makerKey(text));
        kept.push(text);
    }
    return kept;
}
function toPhones(phones) {
    return (phones ?? []).map((phone) => phone.trim()).filter(Boolean);
}
let MaintVendorsService = class MaintVendorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const name = dto.name.trim();
        await this.ensureNameFree(name);
        const makers = toMakers(dto.makers);
        await this.ensureMakersFree(makers);
        const saved = await this.prisma.maintVendor.create({
            data: {
                name,
                phones: toPhones(dto.phones),
                makers,
                note: (0, text_1.toText)(dto.note),
            },
            include: { assets: true },
        });
        return this.toResponse(saved, await this.makerAssetCounts());
    }
    async findAll() {
        const [rows, byMaker] = await Promise.all([
            this.prisma.maintVendor.findMany({
                orderBy: { name: 'asc' },
                include: {
                    assets: { orderBy: [{ department: 'asc' }, { no: 'asc' }] },
                },
            }),
            this.makerAssetCounts(),
        ]);
        return rows.map((row) => this.toResponse(row, byMaker));
    }
    async findOne(id) {
        const row = await this.prisma.maintVendor.findUnique({
            where: { id },
            include: {
                assets: { orderBy: [{ department: 'asc' }, { no: 'asc' }] },
            },
        });
        if (!row) {
            throw new common_1.NotFoundException(`ID ${id} の保守業者は登録されていません`);
        }
        return this.toResponse(row, await this.makerAssetCounts());
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const name = dto.name.trim();
        await this.ensureNameFree(name, id);
        const makers = toMakers(dto.makers);
        await this.ensureMakersFree(makers, id);
        const saved = await this.prisma.maintVendor.update({
            where: { id },
            data: {
                name,
                phones: toPhones(dto.phones),
                makers,
                note: (0, text_1.toText)(dto.note),
            },
            include: { assets: true },
        });
        return this.toResponse(saved, await this.makerAssetCounts());
    }
    async remove(id) {
        const vendor = await this.findOne(id);
        await this.prisma.maintVendor.delete({ where: { id } });
        return { id, clearedAssets: vendor.assets.length };
    }
    async ensureExists(id) {
        const found = await this.prisma.maintVendor.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!found) {
            throw new common_1.NotFoundException(`ID ${id} の保守業者は登録されていません`);
        }
    }
    async ensureNameFree(name, exceptId) {
        if (name.length === 0) {
            throw new common_1.BadRequestException('会社名を入力してください');
        }
        const found = await this.prisma.maintVendor.findUnique({
            where: { name },
            select: { id: true },
        });
        if (found && found.id !== exceptId) {
            throw new common_1.ConflictException(`${name} はすでに登録されています`);
        }
    }
    async makerAssetCounts() {
        const assets = await this.prisma.printerAsset.findMany({
            where: { maintVendorId: null },
            select: { maker: true },
        });
        const counts = new Map();
        for (const asset of assets) {
            if (!asset.maker)
                continue;
            const key = makerKey(asset.maker);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }
    async ensureMakersFree(makers, exceptId) {
        if (makers.length === 0)
            return;
        const others = await this.prisma.maintVendor.findMany({
            where: exceptId === undefined ? {} : { id: { not: exceptId } },
            select: { name: true, makers: true },
        });
        const taken = new Map();
        for (const other of others) {
            for (const maker of other.makers)
                taken.set(makerKey(maker), other.name);
        }
        for (const maker of makers) {
            const owner = taken.get(makerKey(maker));
            if (owner) {
                throw new common_1.ConflictException(`${maker} の既定はすでに ${owner} になっています。先にそちらから外してください`);
            }
        }
    }
    toResponse(vendor, makerCounts) {
        return {
            id: vendor.id,
            name: vendor.name,
            phones: vendor.phones,
            makers: vendor.makers,
            note: vendor.note,
            makerAssetCount: vendor.makers.reduce((sum, maker) => sum + (makerCounts.get(makerKey(maker)) ?? 0), 0),
            assets: (vendor.assets ?? []).map((asset) => ({
                id: asset.id,
                department: asset.department,
                no: asset.no,
                maker: asset.maker,
                model: asset.model,
            })),
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt,
        };
    }
};
exports.MaintVendorsService = MaintVendorsService;
exports.MaintVendorsService = MaintVendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintVendorsService);
//# sourceMappingURL=maint-vendors.service.js.map