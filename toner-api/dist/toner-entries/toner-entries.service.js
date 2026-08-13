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
exports.TonerEntriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TonerEntriesService = class TonerEntriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        switch (dto.action) {
            case 'REGISTER':
                return this.register(dto);
            case 'RECEIVE':
                return this.receive(dto);
            case 'ISSUE':
                return this.issue(dto);
            case 'DISPOSE':
                return this.dispose(dto);
        }
    }
    register(dto) {
        return this.prisma.$transaction(async (tx) => {
            const exists = await tx.toner.findUnique({ where: { id: dto.tonerId } });
            if (exists) {
                throw new common_1.ConflictException(`${dto.tonerId} はすでに登録されています。搬入を選んでください`);
            }
            const toner = await tx.toner.create({
                data: {
                    id: dto.tonerId,
                    name: dto.name?.trim() || null,
                    stock: { create: {} },
                },
                include: { stock: true },
            });
            await tx.tonerEntry.create({
                data: {
                    userId: dto.userId,
                    tonerId: dto.tonerId,
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
        });
    }
    receive(dto) {
        const count = dto.quantity ?? 1;
        return this.prisma.$transaction(async (tx) => {
            const toner = await this.requireToner(tx, dto.tonerId);
            const stock = await tx.tonerStock.update({
                where: { tonerId: dto.tonerId },
                data: {
                    quantity: { increment: count },
                    received: { increment: count },
                },
            });
            await tx.tonerEntry.create({
                data: {
                    userId: dto.userId,
                    tonerId: dto.tonerId,
                    action: 'RECEIVE',
                    quantity: count,
                    balance: stock.quantity,
                },
            });
            return this.toResult(toner.id, toner.name, 'RECEIVE', count, stock);
        });
    }
    issue(dto) {
        const count = dto.quantity ?? 1;
        return this.prisma.$transaction(async (tx) => {
            const toner = await this.requireToner(tx, dto.tonerId);
            const current = toner.stock?.quantity ?? 0;
            if (current < count) {
                throw new common_1.UnprocessableEntityException(`在庫が足りません。${dto.tonerId} の在庫は ${current} 本です`);
            }
            const stock = await tx.tonerStock.update({
                where: { tonerId: dto.tonerId },
                data: { quantity: { decrement: count } },
            });
            await tx.tonerEntry.create({
                data: {
                    userId: dto.userId,
                    tonerId: dto.tonerId,
                    action: 'ISSUE',
                    quantity: count,
                    balance: stock.quantity,
                },
            });
            return this.toResult(toner.id, toner.name, 'ISSUE', count, stock);
        });
    }
    dispose(dto) {
        const count = dto.quantity ?? 1;
        return this.prisma.$transaction(async (tx) => {
            const toner = await this.requireToner(tx, dto.tonerId);
            const received = toner.stock?.received ?? 0;
            const disposed = toner.stock?.disposed ?? 0;
            const allowance = received - disposed;
            if (count > allowance) {
                throw new common_1.UnprocessableEntityException(allowance === 0
                    ? `${dto.tonerId} は廃棄できる本数がありません（搬入 ${received} 本／廃棄済み ${disposed} 本）`
                    : `廃棄できるのは ${allowance} 本までです（搬入 ${received} 本／廃棄済み ${disposed} 本）`);
            }
            const stock = await tx.tonerStock.update({
                where: { tonerId: dto.tonerId },
                data: { disposed: { increment: count } },
            });
            await tx.tonerEntry.create({
                data: {
                    userId: dto.userId,
                    tonerId: dto.tonerId,
                    action: 'DISPOSE',
                    quantity: count,
                    balance: stock.quantity,
                },
            });
            return this.toResult(toner.id, toner.name, 'DISPOSE', count, stock);
        });
    }
    async findStock() {
        const toners = await this.prisma.toner.findMany({
            include: { stock: true },
            orderBy: { id: 'asc' },
        });
        return toners.map((t) => ({
            id: t.id,
            name: t.name,
            quantity: t.stock?.quantity ?? 0,
            received: t.stock?.received ?? 0,
            disposed: t.stock?.disposed ?? 0,
            updatedAt: t.stock?.updatedAt ?? t.updatedAt,
        }));
    }
    findRecent() {
        return this.prisma.tonerEntry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { toner: { select: { name: true } } },
        });
    }
    async requireToner(tx, tonerId) {
        const toner = await tx.toner.findUnique({
            where: { id: tonerId },
            include: { stock: true },
        });
        if (!toner) {
            throw new common_1.NotFoundException(`${tonerId} は未登録です。先に登録を行ってください`);
        }
        return toner;
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