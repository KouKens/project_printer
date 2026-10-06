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
const reconcile_1 = require("./reconcile");
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
const ORDER_INCLUDE = {
    toner: { select: { name: true } },
    company: { select: { name: true } },
};
function toResponse(order) {
    return {
        id: order.id,
        tonerId: order.tonerId,
        companyId: order.companyId,
        companyName: order.company.name,
        userId: order.userId,
        name: order.toner.name,
        quantity: order.quantity,
        orderedAt: order.orderedAt,
        deliveryOn: (0, date_1.fromDate)(order.deliveryOn),
        status: order.status,
        receivedAt: order.receivedAt,
        receiveMode: order.receiveMode,
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
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.tonerOrder.create({
                data: {
                    tonerId: dto.tonerId,
                    companyId: dto.companyId,
                    userId: dto.userId ?? null,
                    quantity: dto.quantity,
                    orderedAt,
                    deliveryOn: (0, date_1.toDate)(dto.deliveryOn),
                },
            });
            await (0, reconcile_1.reconcileOrders)(tx, {
                companyId: order.companyId,
                tonerId: order.tonerId,
                date: order.deliveryOn,
            });
            return toResponse(await tx.tonerOrder.findUniqueOrThrow({
                where: { id: order.id },
                include: ORDER_INCLUDE,
            }));
        });
    }
    async findPending(companyId) {
        const orders = await this.prisma.tonerOrder.findMany({
            where: { status: 'PENDING', ...(companyId ? { companyId } : {}) },
            orderBy: { orderedAt: 'asc' },
            include: ORDER_INCLUDE,
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
            const ids = [];
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
                });
                ids.push(order.id);
            }
            for (const tonerId of new Set(dto.items.map((item) => item.tonerId))) {
                await (0, reconcile_1.reconcileOrders)(tx, {
                    companyId: dto.companyId,
                    tonerId,
                    date: deliveryOn,
                });
            }
            const saved = await tx.tonerOrder.findMany({
                where: { id: { in: ids } },
                orderBy: { id: 'asc' },
                include: ORDER_INCLUDE,
            });
            return saved.map(toResponse);
        });
    }
    async receive(ids) {
        return this.prisma.$transaction(async (tx) => {
            const orders = await tx.tonerOrder.findMany({
                where: { id: { in: ids } },
                select: { id: true, tonerId: true, status: true },
            });
            const found = new Set(orders.map((order) => order.id));
            const missing = ids.filter((id) => !found.has(id));
            if (missing.length > 0) {
                throw new common_1.NotFoundException(`ID ${missing.join(', ')} の注文はありません`);
            }
            const notPending = orders.filter((order) => order.status !== 'PENDING');
            if (notPending.length > 0) {
                throw new common_1.BadRequestException(`${notPending.map((order) => order.tonerId).join(', ')} の注文は` +
                    'すでに入荷済みか取り消し済みです。画面を開き直してください');
            }
            await tx.tonerOrder.updateMany({
                where: { id: { in: ids } },
                data: {
                    status: 'RECEIVED',
                    receiveMode: 'MANUAL',
                    receivedAt: new Date(),
                },
            });
            const saved = await tx.tonerOrder.findMany({
                where: { id: { in: ids } },
                orderBy: { id: 'asc' },
                include: ORDER_INCLUDE,
            });
            return saved.map(toResponse);
        });
    }
    async unreceive(id) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.tonerOrder.findUnique({ where: { id } });
            if (!order) {
                throw new common_1.NotFoundException(`ID ${id} の注文はありません`);
            }
            if (order.status !== 'RECEIVED') {
                throw new common_1.BadRequestException(`${order.tonerId} の注文は入荷済みではありません`);
            }
            if (order.receiveMode !== 'MANUAL') {
                throw new common_1.BadRequestException(`${order.tonerId} の注文は搬入の記録と本数が一致して入荷済みになっているので、` +
                    '未入荷に戻せません。戻すには搬入の記録を取り消してください');
            }
            await tx.tonerOrder.update({
                where: { id },
                data: { status: 'PENDING', receiveMode: null, receivedAt: null },
            });
            await (0, reconcile_1.reconcileOrders)(tx, {
                companyId: order.companyId,
                tonerId: order.tonerId,
                date: order.deliveryOn,
            });
            return toResponse(await tx.tonerOrder.findUniqueOrThrow({
                where: { id },
                include: ORDER_INCLUDE,
            }));
        });
    }
    async findDeliveryCheck(companyId, days = 180) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        const include = {
            toner: { select: { name: true, color: true } },
            company: { select: { name: true, sortOrder: true } },
        };
        const [orders, entries] = await Promise.all([
            this.prisma.tonerOrder.findMany({
                where: {
                    ...(companyId ? { companyId } : {}),
                    orderedAt: { gte: from },
                },
                orderBy: { orderedAt: 'desc' },
                include,
            }),
            this.prisma.tonerEntry.findMany({
                where: {
                    ...(companyId ? { companyId } : {}),
                    action: 'RECEIVE',
                    createdAt: { gte: from },
                },
                orderBy: { createdAt: 'desc' },
                include,
            }),
        ]);
        const rows = new Map();
        const companyOrder = new Map();
        const rowFor = (source, date) => {
            const { companyId: company, tonerId, toner } = source;
            companyOrder.set(company, source.company.sortOrder);
            const key = `${company}\0${tonerId}\0${date ?? ''}`;
            const row = rows.get(key) ?? {
                key,
                companyId: company,
                companyName: source.company.name,
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
            const row = rowFor(order, (0, date_1.fromDate)(order.deliveryOn));
            if (order.status !== 'CANCELED')
                row.ordered += order.quantity;
            row.orders.push({
                id: order.id,
                quantity: order.quantity,
                orderedAt: order.orderedAt,
                status: order.status,
                receivedAt: order.receivedAt,
                receiveMode: order.receiveMode,
            });
        }
        for (const entry of entries) {
            const row = rowFor(entry, (0, date_1.fromDate)(entry.receivedOn));
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
            pendingOrderIds: row.orders
                .filter((order) => order.status === 'PENDING')
                .map((order) => order.id),
            settled: row.orders.some((order) => order.status === 'RECEIVED') &&
                row.orders.every((order) => order.status !== 'PENDING'),
            diff: row.received - row.ordered,
            status: statusOf(row.ordered, row.received, row.date, todayKey),
        }))
            .sort((a, b) => {
            if (a.date === b.date) {
                return ((companyOrder.get(a.companyId) ?? 0) -
                    (companyOrder.get(b.companyId) ?? 0) ||
                    a.companyId - b.companyId ||
                    a.tonerId.localeCompare(b.tonerId, 'ja'));
            }
            if (a.date === null)
                return 1;
            if (b.date === null)
                return -1;
            return a.date < b.date ? 1 : -1;
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.tonerOrder.findUnique({ where: { id } });
            if (!order) {
                throw new common_1.NotFoundException(`ID ${id} の注文はありません`);
            }
            await tx.tonerOrder.delete({ where: { id } });
            await (0, reconcile_1.reconcileOrders)(tx, {
                companyId: order.companyId,
                tonerId: order.tonerId,
                date: order.deliveryOn,
            });
            return { id, tonerId: order.tonerId, quantity: order.quantity };
        });
    }
    async findAll(companyId) {
        const orders = await this.prisma.tonerOrder.findMany({
            ...(companyId ? { where: { companyId } } : {}),
            orderBy: { orderedAt: 'desc' },
            take: 50,
            include: ORDER_INCLUDE,
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