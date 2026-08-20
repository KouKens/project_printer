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
exports.RepairsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function toDate(value) {
    if (!value)
        return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function trimmed(value) {
    const text = value?.trim() ?? '';
    return text === '' ? null : text;
}
function fromDate(value) {
    if (!value)
        return null;
    const month = `${value.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${value.getUTCDate()}`.padStart(2, '0');
    return `${value.getUTCFullYear()}-${month}-${day}`;
}
let RepairsService = class RepairsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        await this.ensureAsset(dto.printerAssetId);
        this.ensureDateOrder(dto);
        const saved = await this.prisma.repairRecord.create({
            data: this.toData(dto),
            include: { asset: true },
        });
        return this.toResponse(saved);
    }
    async findAll() {
        const rows = await this.prisma.repairRecord.findMany({
            orderBy: [
                { occurredOn: { sort: 'desc', nulls: 'last' } },
                { id: 'desc' },
            ],
            include: { asset: true },
        });
        return rows.map((row) => this.toResponse(row));
    }
    async findOne(id) {
        const row = await this.prisma.repairRecord.findUnique({
            where: { id },
            include: { asset: true },
        });
        if (!row) {
            throw new common_1.NotFoundException(`ID ${id} の修理履歴は登録されていません`);
        }
        return this.toResponse(row);
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.ensureAsset(dto.printerAssetId);
        this.ensureDateOrder(dto);
        const saved = await this.prisma.repairRecord.update({
            where: { id },
            data: this.toData(dto),
            include: { asset: true },
        });
        return this.toResponse(saved);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.repairRecord.delete({ where: { id } });
        return { id };
    }
    async ensureAsset(printerAssetId) {
        const asset = await this.prisma.printerAsset.findUnique({
            where: { id: printerAssetId },
        });
        if (!asset) {
            throw new common_1.BadRequestException(`ID ${printerAssetId} の機器は端末台帳にありません`);
        }
    }
    ensureDateOrder(dto) {
        if (dto.occurredOn && dto.restoredOn < dto.occurredOn) {
            throw new common_1.BadRequestException('復旧日が発生日より前になっています。日付を確認してください');
        }
    }
    toData(dto) {
        return {
            assignee: trimmed(dto.assignee),
            printerAssetId: dto.printerAssetId,
            occurredOn: toDate(dto.occurredOn),
            category: dto.category ?? null,
            handledBy: dto.handledBy,
            detail: trimmed(dto.detail),
            restoredOn: toDate(dto.restoredOn),
            status: dto.status ?? 'INVESTIGATING',
        };
    }
    toResponse(row) {
        return {
            id: row.id,
            assignee: row.assignee,
            printerAssetId: row.printerAssetId,
            department: row.asset?.department ?? null,
            no: row.asset?.no ?? null,
            maker: row.asset?.maker ?? null,
            model: row.asset?.model ?? null,
            occurredOn: fromDate(row.occurredOn),
            category: row.category,
            handledBy: row.handledBy,
            detail: row.detail,
            restoredOn: fromDate(row.restoredOn),
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
};
exports.RepairsService = RepairsService;
exports.RepairsService = RepairsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepairsService);
//# sourceMappingURL=repairs.service.js.map