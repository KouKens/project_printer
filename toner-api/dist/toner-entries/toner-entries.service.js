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
exports.TonerEntriesService = exports.HISTORY_LIMIT = exports.GUEST_USER = void 0;
const common_1 = require("@nestjs/common");
const date_1 = require("../common/date");
const prisma_service_1 = require("../prisma/prisma.service");
exports.GUEST_USER = 'ゲスト';
exports.HISTORY_LIMIT = 1000;
function increments(delta) {
    return {
        ...(delta.quantity === undefined
            ? {}
            : { quantity: { increment: delta.quantity } }),
        ...(delta.received === undefined
            ? {}
            : { received: { increment: delta.received } }),
        ...(delta.disposed === undefined
            ? {}
            : { disposed: { increment: delta.disposed } }),
    };
}
let TonerEntriesService = class TonerEntriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.$transaction((tx) => this.apply(tx, dto));
    }
    bulk(dto) {
        return this.prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of dto.items) {
                results.push(await this.apply(tx, {
                    action: dto.action,
                    userId: dto.userId,
                    companyId: dto.companyId,
                    tonerId: item.tonerId,
                    name: item.name,
                    quantity: item.quantity,
                    receivedOn: dto.receivedOn,
                }));
            }
            return results;
        });
    }
    apply(tx, dto) {
        switch (dto.action) {
            case 'REGISTER':
                return this.register(tx, dto);
            case 'RECEIVE':
                return this.receive(tx, dto);
            case 'ISSUE':
                return this.issue(tx, dto);
            case 'DISPOSE':
                return this.dispose(tx, dto);
        }
    }
    async register(tx, dto) {
        const exists = await tx.toner.findUnique({ where: { id: dto.tonerId } });
        if (exists) {
            throw new common_1.ConflictException(`${dto.tonerId} はすでに登録されています。搬入を選んでください`);
        }
        const toner = await tx.toner.create({
            data: {
                id: dto.tonerId,
                name: dto.name?.trim() || null,
            },
        });
        await tx.tonerEntry.create({
            data: {
                userId: dto.userId,
                tonerId: dto.tonerId,
                companyId: dto.companyId,
                action: 'REGISTER',
                quantity: 0,
                balance: 0,
            },
        });
        return {
            tonerId: toner.id,
            name: toner.name,
            action: 'REGISTER',
            quantity: 0,
            stock: 0,
            received: 0,
            disposed: 0,
        };
    }
    async receive(tx, dto) {
        const count = dto.quantity ?? 1;
        const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);
        const stock = await this.bumpStock(tx, dto.tonerId, dto.companyId, {
            quantity: count,
            received: count,
        });
        await tx.tonerEntry.create({
            data: {
                userId: dto.userId,
                tonerId: dto.tonerId,
                companyId: dto.companyId,
                action: 'RECEIVE',
                quantity: count,
                balance: stock.quantity,
                receivedOn: (0, date_1.toDate)(dto.receivedOn) ?? (0, date_1.today)(),
            },
        });
        return this.toResult(toner.id, toner.name, 'RECEIVE', count, stock);
    }
    async issue(tx, dto) {
        const count = dto.quantity ?? 1;
        const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);
        const current = toner.stock?.quantity ?? 0;
        if (current < count) {
            throw new common_1.UnprocessableEntityException(`在庫が足りません。${dto.tonerId} の在庫は ${current} 本です`);
        }
        const stock = await this.stepStock(tx, dto.tonerId, dto.companyId, {
            quantity: -count,
        });
        await tx.tonerEntry.create({
            data: {
                userId: dto.userId,
                tonerId: dto.tonerId,
                companyId: dto.companyId,
                action: 'ISSUE',
                quantity: count,
                balance: stock.quantity,
            },
        });
        return this.toResult(toner.id, toner.name, 'ISSUE', count, stock);
    }
    async dispose(tx, dto) {
        const count = dto.quantity ?? 1;
        const toner = await this.requireToner(tx, dto.tonerId, dto.companyId);
        const received = toner.stock?.received ?? 0;
        const disposed = toner.stock?.disposed ?? 0;
        const allowance = received - disposed;
        if (count > allowance) {
            throw new common_1.UnprocessableEntityException(allowance === 0
                ? `${dto.tonerId} は廃棄できる本数がありません（搬入 ${received} 本／廃棄済み ${disposed} 本）`
                : `廃棄できるのは ${allowance} 本までです（搬入 ${received} 本／廃棄済み ${disposed} 本）`);
        }
        const stock = await this.stepStock(tx, dto.tonerId, dto.companyId, {
            disposed: count,
        });
        await tx.tonerEntry.create({
            data: {
                userId: dto.userId,
                tonerId: dto.tonerId,
                companyId: dto.companyId,
                action: 'DISPOSE',
                quantity: count,
                balance: stock.quantity,
            },
        });
        return this.toResult(toner.id, toner.name, 'DISPOSE', count, stock);
    }
    async stockTake(dto) {
        const userId = dto.userId?.trim() || exports.GUEST_USER;
        return this.prisma.$transaction(async (tx) => {
            const toners = await tx.toner.findMany({
                where: { id: { in: dto.counts.map((count) => count.tonerId) } },
                include: { stocks: { where: { companyId: dto.companyId } } },
            });
            const known = new Map(toners.map((toner) => [toner.id, toner]));
            const quantities = new Map(toners.map((toner) => [toner.id, toner.stocks[0]?.quantity ?? 0]));
            const rows = [];
            for (const count of dto.counts) {
                const toner = known.get(count.tonerId);
                if (!toner) {
                    rows.push({
                        tonerId: count.tonerId,
                        name: null,
                        before: 0,
                        counted: count.counted,
                        diff: 0,
                        status: 'unknown',
                    });
                    continue;
                }
                const before = quantities.get(toner.id) ?? 0;
                const diff = count.counted - before;
                if (diff === 0) {
                    rows.push({
                        tonerId: toner.id,
                        name: toner.name,
                        before,
                        counted: count.counted,
                        diff: 0,
                        status: 'same',
                    });
                    continue;
                }
                await tx.tonerStock.upsert({
                    where: {
                        tonerId_companyId: {
                            tonerId: toner.id,
                            companyId: dto.companyId,
                        },
                    },
                    create: {
                        tonerId: toner.id,
                        companyId: dto.companyId,
                        quantity: count.counted,
                    },
                    update: { quantity: count.counted },
                });
                quantities.set(toner.id, count.counted);
                await tx.tonerEntry.create({
                    data: {
                        userId,
                        tonerId: toner.id,
                        companyId: dto.companyId,
                        action: 'ADJUST',
                        quantity: Math.abs(diff),
                        balance: count.counted,
                    },
                });
                rows.push({
                    tonerId: toner.id,
                    name: toner.name,
                    before,
                    counted: count.counted,
                    diff,
                    status: 'adjusted',
                });
            }
            return rows;
        });
    }
    async findStock(companyId) {
        const found = await this.prisma.toner.findMany({
            include: { stocks: { where: { companyId } } },
            orderBy: { id: 'asc' },
        });
        const toners = found.filter((t) => !t.hidden || (t.stocks[0]?.quantity ?? 0) > 0);
        return toners.map((t) => {
            const stock = t.stocks[0] ?? null;
            return {
                id: t.id,
                name: t.name,
                color: t.color,
                quantity: stock?.quantity ?? 0,
                received: stock?.received ?? 0,
                disposed: stock?.disposed ?? 0,
                updatedAt: stock?.updatedAt ?? t.updatedAt,
            };
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const entry = await tx.tonerEntry.findUnique({
                where: { id },
                include: { toner: { select: { name: true } } },
            });
            if (!entry) {
                throw new common_1.NotFoundException(`ID ${id} の記録はありません`);
            }
            if (entry.action === 'ADJUST') {
                throw new common_1.UnprocessableEntityException('棚卸しの調整は取り消せません。数え直して棚卸しをやり直してください');
            }
            const stockKey = {
                tonerId_companyId: {
                    tonerId: entry.tonerId,
                    companyId: entry.companyId,
                },
            };
            const stock = await tx.tonerStock.findUnique({ where: stockKey });
            const quantity = stock?.quantity ?? 0;
            const received = stock?.received ?? 0;
            const disposed = stock?.disposed ?? 0;
            const count = entry.quantity;
            if (entry.action === 'RECEIVE') {
                if (quantity < count) {
                    throw new common_1.UnprocessableEntityException(`取り消せません。搬入した ${count} 本のうち ${count - quantity} 本は` +
                        `すでに持ち出されています（在庫 ${quantity} 本）`);
                }
                if (received - count < disposed) {
                    throw new common_1.UnprocessableEntityException(`取り消せません。廃棄済み ${disposed} 本が搬入累計を上回ります`);
                }
                await tx.tonerStock.update({
                    where: stockKey,
                    data: {
                        quantity: { decrement: count },
                        received: { decrement: count },
                    },
                });
            }
            else if (entry.action === 'ISSUE') {
                await tx.tonerStock.update({
                    where: stockKey,
                    data: { quantity: { increment: count } },
                });
            }
            else if (entry.action === 'DISPOSE') {
                if (disposed < count) {
                    throw new common_1.UnprocessableEntityException(`取り消せません。廃棄した ${count} 本に対して、` +
                        `記録上の廃棄累計は ${disposed} 本しかありません`);
                }
                await tx.tonerStock.update({
                    where: stockKey,
                    data: { disposed: { decrement: count } },
                });
            }
            await tx.tonerEntry.delete({ where: { id } });
            const after = await tx.tonerStock.findUnique({ where: stockKey });
            return {
                id,
                tonerId: entry.tonerId,
                name: entry.toner.name,
                action: entry.action,
                quantity: count,
                stock: after?.quantity ?? 0,
                received: after?.received ?? 0,
                disposed: after?.disposed ?? 0,
            };
        });
    }
    findRecent() {
        return this.prisma.tonerEntry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { toner: { select: { name: true } } },
        });
    }
    async findHistory(params) {
        const days = params.days && params.days > 0 ? params.days : 60;
        const from = new Date();
        from.setDate(from.getDate() - days);
        const found = await this.prisma.tonerEntry.findMany({
            where: {
                createdAt: { gte: from },
                ...(params.action ? { action: params.action } : {}),
                ...(params.tonerId ? { tonerId: params.tonerId } : {}),
                ...(params.companyId ? { companyId: params.companyId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: exports.HISTORY_LIMIT + 1,
            include: {
                toner: { select: { name: true, color: true } },
                company: { select: { name: true } },
            },
        });
        const truncated = found.length > exports.HISTORY_LIMIT;
        const rows = truncated ? found.slice(0, exports.HISTORY_LIMIT) : found;
        return {
            truncated,
            limit: exports.HISTORY_LIMIT,
            rows: rows.map((row) => ({
                id: row.id,
                userId: row.userId,
                tonerId: row.tonerId,
                companyId: row.companyId,
                companyName: row.company.name,
                name: row.toner.name,
                color: row.toner.color,
                action: row.action,
                quantity: row.quantity,
                balance: row.balance,
                receivedOn: (0, date_1.fromDate)(row.receivedOn),
                createdAt: row.createdAt,
            })),
        };
    }
    async requireToner(tx, tonerId, companyId) {
        const toner = await tx.toner.findUnique({
            where: { id: tonerId },
            include: { stocks: { where: { companyId } } },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${tonerId} は未登録です。先に登録を行ってください`);
        }
        return { ...toner, stock: toner.stocks[0] ?? null };
    }
    bumpStock(tx, tonerId, companyId, delta) {
        return tx.tonerStock.upsert({
            where: { tonerId_companyId: { tonerId, companyId } },
            create: {
                tonerId,
                companyId,
                quantity: delta.quantity ?? 0,
                received: delta.received ?? 0,
                disposed: delta.disposed ?? 0,
            },
            update: increments(delta),
        });
    }
    stepStock(tx, tonerId, companyId, delta) {
        return tx.tonerStock.update({
            where: { tonerId_companyId: { tonerId, companyId } },
            data: increments(delta),
        });
    }
    toResult(id, name, action, quantity, stock) {
        return {
            tonerId: id,
            name,
            action,
            quantity,
            stock: stock.quantity,
            received: stock.received,
            disposed: stock.disposed,
        };
    }
};
exports.TonerEntriesService = TonerEntriesService;
exports.TonerEntriesService = TonerEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonerEntriesService);
//# sourceMappingURL=toner-entries.service.js.map