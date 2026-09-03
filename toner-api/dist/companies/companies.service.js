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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const text_1 = require("../common/text");
const prisma_service_1 = require("../prisma/prisma.service");
let CompaniesService = class CompaniesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const name = dto.name.trim();
        await this.ensureNameFree(name);
        const saved = await this.prisma.company.create({
            data: {
                name,
                sortOrder: dto.sortOrder ?? 0,
                note: (0, text_1.toText)(dto.note),
            },
            include: { _count: { select: this.counts } },
        });
        return this.toResponse(saved);
    }
    async findAll(includeDisabled = false) {
        const companies = await this.prisma.company.findMany({
            where: includeDisabled ? {} : { disabledAt: null },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: { _count: { select: this.counts } },
        });
        return companies.map((company) => this.toResponse(company));
    }
    async findOne(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { _count: { select: this.counts } },
        });
        if (!company) {
            throw new common_1.NotFoundException(`ID ${id} の会社は登録されていません`);
        }
        return this.toResponse(company);
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const name = dto.name.trim();
        await this.ensureNameFree(name, id);
        const saved = await this.prisma.company.update({
            where: { id },
            data: {
                name,
                sortOrder: dto.sortOrder ?? 0,
                note: (0, text_1.toText)(dto.note),
            },
            include: { _count: { select: this.counts } },
        });
        return this.toResponse(saved);
    }
    async setDisabled(id, disabled) {
        await this.ensureExists(id);
        if (disabled) {
            const active = await this.prisma.company.count({
                where: { disabledAt: null, id: { not: id } },
            });
            if (active === 0) {
                throw new common_1.BadRequestException('最後の 1 社は無効にできません。受け付ける先が無くなり、持ち出し・搬入・棚卸が使えなくなります');
            }
        }
        const saved = await this.prisma.company.update({
            where: { id },
            data: { disabledAt: disabled ? new Date() : null },
            include: { _count: { select: this.counts } },
        });
        return this.toResponse(saved);
    }
    async remove(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { _count: { select: this.counts } },
        });
        if (!company) {
            throw new common_1.NotFoundException(`ID ${id} の会社は登録されていません`);
        }
        if (company.disabledAt === null) {
            throw new common_1.BadRequestException(`${company.name} はまだ有効です。先に無効にしてから削除してください`);
        }
        const blockers = [];
        if (company._count.assets > 0) {
            blockers.push(`機器 ${company._count.assets} 台`);
        }
        if (company._count.stocks > 0) {
            blockers.push(`在庫の記録 ${company._count.stocks} 件`);
        }
        if (company._count.entries > 0) {
            blockers.push(`受付の履歴 ${company._count.entries} 件`);
        }
        if (company._count.orders > 0) {
            blockers.push(`注文 ${company._count.orders} 件`);
        }
        if (blockers.length > 0) {
            throw new common_1.BadRequestException(`${company.name} には${blockers.join('・')}がぶら下がっているため削除できません。` +
                '無効のままにしておけば、セレクタからは外れたまま記録が残ります');
        }
        await this.prisma.company.delete({ where: { id } });
        return { id, deleted: true };
    }
    counts = {
        assets: true,
        stocks: true,
        entries: true,
        orders: true,
    };
    async ensureExists(id) {
        const found = await this.prisma.company.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!found) {
            throw new common_1.NotFoundException(`ID ${id} の会社は登録されていません`);
        }
    }
    async ensureNameFree(name, exceptId) {
        const found = await this.prisma.company.findFirst({
            where: {
                name,
                ...(exceptId === undefined ? {} : { id: { not: exceptId } }),
            },
            select: { id: true },
        });
        if (found) {
            throw new common_1.ConflictException(`${name} はすでに登録されています`);
        }
    }
    toResponse(company) {
        return {
            id: company.id,
            name: company.name,
            sortOrder: company.sortOrder,
            note: company.note,
            disabledAt: company.disabledAt,
            counts: {
                assets: company._count?.assets ?? 0,
                stocks: company._count?.stocks ?? 0,
                entries: company._count?.entries ?? 0,
                orders: company._count?.orders ?? 0,
            },
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map