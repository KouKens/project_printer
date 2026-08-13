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
exports.TonerOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;
let TonerOrdersService = class TonerOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const orderedAt = new Date(dto.orderedAt);
        if (Number.isNaN(orderedAt.getTime())) {
            throw new common_1.BadRequestException('注文日時の形式が正しくありません');
        }
        if (orderedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
            throw new common_1.BadRequestException('注文日時に未来の日付は指定できません');
        }
        const toner = await this.prisma.toner.findUnique({
            where: { id: dto.tonerId },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${dto.tonerId} は未登録です。先に登録を行ってください`);
        }
        const order = await this.prisma.tonerOrder.create({
            data: {
                tonerId: dto.tonerId,
                quantity: dto.quantity,
                orderedAt,
            },
            include: { toner: { select: { name: true } } },
        });
        return {
            id: order.id,
            tonerId: order.tonerId,
            name: order.toner.name,
            quantity: order.quantity,
            orderedAt: order.orderedAt,
            status: order.status,
        };
    }
    findPending() {
        return this.prisma.tonerOrder.findMany({
            where: { status: 'PENDING' },
            orderBy: { orderedAt: 'asc' },
            include: { toner: { select: { name: true } } },
        });
    }
    findAll() {
        return this.prisma.tonerOrder.findMany({
            orderBy: { orderedAt: 'desc' },
            take: 50,
            include: { toner: { select: { name: true } } },
        });
    }
};
exports.TonerOrdersService = TonerOrdersService;
exports.TonerOrdersService = TonerOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonerOrdersService);
//# sourceMappingURL=toner-orders.service.js.map