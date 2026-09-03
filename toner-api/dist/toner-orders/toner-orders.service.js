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
const date_1 = require("../common/date");
const prisma_service_1 = require("../prisma/prisma.service");
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;
function statusOf(ordered, received, date, todayKey) {
    if (ordered === 0)
        return 'no-order';
    if (date === null)
        return 'undated';
    if (received === 0 && todayKey !== null && date > todayKey)
        return 'waiting';
    if (received === ordered)
        return 'match';
    return received < ordered ? 'short' : 'over';
}
function toResponse(order) {
    return {
        id: order.id,
        tonerId: order.tonerId,
        companyId: order.companyId,
        userId: order.userId,
        name: order.toner.name,
        quantity: order.quantity,
        orderedAt: order.orderedAt,
        deliveryOn: (0, date_1.fromDate)(order.deliveryOn),
        status: order.status,
    };
}
let TonerOrdersService = class TonerOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    parseOrderedAt(value) {
        const orderedAt = new Date(value);
        if (Number.isNaN(orderedAt.getTime())) {
            throw new common_1.BadRequestException('注文日時の形式が正しくありません');
        }
        if (orderedAt.getTime() > Date.now() + FUTURE_TOLERANCE_MS) {
            throw new common_1.BadRequestException('注文日時に未来の日付は指定できません');
        }
        return orderedAt;
    }
    async create(dto) {
        const orderedAt = this.parseOrderedAt(dto.orderedAt);
        const toner = await this.prisma.toner.findUnique({
            where: { id: dto.tonerId },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${dto.tonerId} は未登録です。先に登録を行ってください`);
        }
        const order = await this.prisma.tonerOrder.create({
            data: {
                tonerId: dto.tonerId,
                companyId: dto.companyId,
                userId: dto.userId ?? null,
                quantity: dto.quantity,
                orderedAt,
                deliveryOn: (0, date_1.toDate)(dto.deliveryOn),
            },
            include: { toner: { select: { name: true } } },
        });
        return toResponse(order);
    }
    async findPending(companyId) {
        const orders = await this.prisma.tonerOrder.findMany({
            where: { status: 'PENDING', ...(companyId ? { companyId } : {}) },
            orderBy: { orderedAt: 'asc' },
            include: { toner: { select: { name: true } } },
        });
        return orders.map(toResponse);
    }
    async bulk(dto) {
        const orderedAt = this.parseOrderedAt(dto.orderedAt);
        const deliveryOn = (0, date_1.toDate)(dto.deliveryOn);
        const ids = [...new Set(dto.items.map((item) => item.tonerId))];
        const found = await this.prisma.toner.findMany({
            where: { id: { in: ids } },
            select: { id: true },
        });
        const registered = new Set(found.map((row) => row.id));
        const missing = ids.filter((id) => !registered.has(id));
        if (missing.length > 0) {
            throw new common_1.NotFoundException(`${missing.join(', ')} は未登録です。先に登録を行ってください`);
        }
        return this.prisma.$transaction(async (tx) => {
            const saved = [];
            for (const item of dto.items) {
                const order = await tx.tonerOrder.create({
                    data: {
                        tonerId: item.tonerId,
                        companyId: dto.companyId,
                        userId: dto.userId ?? null,
                        quantity: item.quantity,
                        orderedAt,
                        deliveryOn,
                    },
                    include: { toner: { select: { name: true } } },
                });
                saved.push(toResponse(order));
            }
            return saved;
        });
    }
    async findDeliveryCheck(days = 180) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        const [orders, entries] = await Promise.all([
            this.prisma.tonerOrder.findMany({
                where: { orderedAt: { gte: from } },
                orderBy: { orderedAt: 'desc' },
                include: { toner: { select: { name: true, color: true } } },
            }),
            this.prisma.tonerEntry.findMany({
                where: { action: 'RECEIVE', createdAt: { gte: from } },
                orderBy: { createdAt: 'desc' },
                include: { toner: { select: { name: true, color: true } } },
            }),
        ]);
        const rows = new Map();
        const rowFor = (tonerId, toner, date) => {
            const key = `${tonerId}\0${date ?? ''}`;
            const row = rows.get(key) ?? {
                key,
                tonerId,
                name: toner.name,
                color: toner.color,
                date,
                ordered: 0,
                received: 0,
                orders: [],
                entries: [],
            };
            rows.set(key, row);
            return row;
        };
        for (const order of orders) {
            const row = rowFor(order.tonerId, order.toner, (0, date_1.fromDate)(order.deliveryOn));
            if (order.status !== 'CANCELED')
                row.ordered += order.quantity;
            row.orders.push({
                id: order.id,
                quantity: order.quantity,
                orderedAt: order.orderedAt,
                status: order.status,
            });
        }
        for (const entry of entries) {
            const row = rowFor(entry.tonerId, entry.toner, (0, date_1.fromDate)(entry.receivedOn));
            row.received += entry.quantity;
            row.entries.push({
                id: entry.id,
                quantity: entry.quantity,
                userId: entry.userId,
                createdAt: entry.createdAt,
            });
        }
        const todayKey = (0, date_1.fromDate)((0, date_1.today)());
        return [...rows.values()]
            .map((row) => ({
            ...row,
            diff: row.received - row.ordered,
            status: statusOf(row.ordered, row.received, row.date, todayKey),
        }))
            .sort((a, b) => {
            if (a.date === b.date)
                return a.tonerId.localeCompare(b.tonerId, 'ja');
            if (a.date === null)
                return 1;
            if (b.date === null)
                return -1;
            return a.date < b.date ? 1 : -1;
        });
    }
    async remove(id) {
        const order = await this.prisma.tonerOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`ID ${id} の注文はありません`);
        }
        await this.prisma.tonerOrder.delete({ where: { id } });
        return { id, tonerId: order.tonerId, quantity: order.quantity };
    }
    async findAll(companyId) {
        const orders = await this.prisma.tonerOrder.findMany({
            ...(companyId ? { where: { companyId } } : {}),
            orderBy: { orderedAt: 'desc' },
            take: 50,
            include: { toner: { select: { name: true } } },
        });
        return orders.map(toResponse);
    }
};
exports.TonerOrdersService = TonerOrdersService;
exports.TonerOrdersService = TonerOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonerOrdersService);
//# sourceMappingURL=toner-orders.service.js.map