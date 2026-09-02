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
exports.TonerInvoicesService = void 0;
const common_1 = require("@nestjs/common");
const date_1 = require("../common/date");
const text_1 = require("../common/text");
const prisma_service_1 = require("../prisma/prisma.service");
const NEARBY_DAYS = 31;
const MS_PER_DAY = 86_400_000;
function priceOn(prices, date) {
    return prices.find((row) => row.effectiveFrom <= date)?.price ?? null;
}
let TonerInvoicesService = class TonerInvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const period = this.parsePeriod(dto);
        this.assertNoDuplicateLine(dto);
        await this.assertTonersExist(dto);
        const already = await this.prisma.tonerInvoice.findFirst({
            where: { periodFrom: period.from, periodTo: period.to },
            select: { id: true },
        });
        if (already) {
            throw new common_1.ConflictException(`${dto.periodFrom} 〜 ${dto.periodTo} の請求書はすでに登録されています（ID ${already.id}）。訂正のときはそちらを直してください`);
        }
        const saved = await this.prisma.tonerInvoice.create({
            data: {
                issuedOn: (0, date_1.toDate)(dto.issuedOn),
                periodFrom: period.from,
                periodTo: period.to,
                invoiceNo: (0, text_1.toText)(dto.invoiceNo),
                note: (0, text_1.toText)(dto.note),
                lines: {
                    create: dto.lines.map((line) => ({
                        tonerId: line.tonerId,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice ?? null,
                    })),
                },
            },
            include: this.withLines,
        });
        return this.toResponse(saved);
    }
    async findAll() {
        const rows = await this.prisma.tonerInvoice.findMany({
            orderBy: [{ periodTo: 'desc' }, { id: 'desc' }],
            include: this.withLines,
        });
        return rows.map((row) => this.toResponse(row));
    }
    async findOne(id) {
        const row = await this.prisma.tonerInvoice.findUnique({
            where: { id },
            include: this.withLines,
        });
        if (!row) {
            throw new common_1.NotFoundException(`ID ${id} の請求書は登録されていません`);
        }
        return this.toResponse(row);
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const period = this.parsePeriod(dto);
        this.assertNoDuplicateLine(dto);
        await this.assertTonersExist(dto);
        const clash = await this.prisma.tonerInvoice.findFirst({
            where: { periodFrom: period.from, periodTo: period.to, id: { not: id } },
            select: { id: true },
        });
        if (clash) {
            throw new common_1.ConflictException(`${dto.periodFrom} 〜 ${dto.periodTo} の請求書はすでに登録されています（ID ${clash.id}）`);
        }
        const saved = await this.prisma.$transaction(async (tx) => {
            await tx.tonerInvoiceLine.deleteMany({ where: { invoiceId: id } });
            return tx.tonerInvoice.update({
                where: { id },
                data: {
                    issuedOn: (0, date_1.toDate)(dto.issuedOn),
                    periodFrom: period.from,
                    periodTo: period.to,
                    invoiceNo: (0, text_1.toText)(dto.invoiceNo),
                    note: (0, text_1.toText)(dto.note),
                    lines: {
                        create: dto.lines.map((line) => ({
                            tonerId: line.tonerId,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice ?? null,
                        })),
                    },
                },
                include: this.withLines,
            });
        });
        return this.toResponse(saved);
    }
    async markChecked(id, checkedBy) {
        await this.ensureExists(id);
        const saved = await this.prisma.tonerInvoice.update({
            where: { id },
            data: { checkedAt: new Date(), checkedBy: (0, text_1.toText)(checkedBy) },
            include: this.withLines,
        });
        return this.toResponse(saved);
    }
    async remove(id) {
        await this.ensureExists(id);
        await this.prisma.tonerInvoice.delete({ where: { id } });
        return { id };
    }
    async check(id) {
        const invoice = await this.prisma.tonerInvoice.findUnique({
            where: { id },
            include: this.withLines,
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`ID ${id} の請求書は登録されていません`);
        }
        const from = invoice.periodFrom;
        const toExclusive = new Date(invoice.periodTo.getTime() + MS_PER_DAY);
        const wideFrom = new Date(from.getTime() - NEARBY_DAYS * MS_PER_DAY);
        const wideTo = new Date(toExclusive.getTime() + NEARBY_DAYS * MS_PER_DAY);
        const entries = await this.prisma.tonerEntry.findMany({
            where: {
                action: 'RECEIVE',
                OR: [
                    { receivedOn: { gte: wideFrom, lt: wideTo } },
                    { receivedOn: null, createdAt: { gte: wideFrom, lt: wideTo } },
                ],
            },
            select: {
                tonerId: true,
                quantity: true,
                receivedOn: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const tonerIds = [
            ...new Set([
                ...invoice.lines.map((line) => line.tonerId),
                ...entries.map((entry) => entry.tonerId),
            ]),
        ];
        const toners = await this.prisma.toner.findMany({
            where: { id: { in: tonerIds } },
            select: {
                id: true,
                name: true,
                color: true,
                prices: {
                    orderBy: { effectiveFrom: 'desc' },
                    select: { price: true, effectiveFrom: true },
                },
            },
        });
        const master = new Map(toners.map((toner) => [toner.id, toner]));
        const received = new Map();
        const slotFor = (tonerId) => {
            const slot = received.get(tonerId) ?? {
                quantity: 0,
                amount: 0,
                priceKnown: true,
                nearby: 0,
            };
            received.set(tonerId, slot);
            return slot;
        };
        for (const entry of entries) {
            const when = entry.receivedOn ?? entry.createdAt;
            const slot = slotFor(entry.tonerId);
            if (when < from || when >= toExclusive) {
                slot.nearby += entry.quantity;
                continue;
            }
            slot.quantity += entry.quantity;
            const price = priceOn(master.get(entry.tonerId)?.prices ?? [], when);
            if (price === null) {
                slot.priceKnown = false;
            }
            else {
                slot.amount += price * entry.quantity;
            }
        }
        const byToner = new Map(invoice.lines.map((line) => [line.tonerId, line]));
        const shown = [
            ...new Set([
                ...byToner.keys(),
                ...[...received.entries()]
                    .filter(([, slot]) => slot.quantity > 0)
                    .map(([tonerId]) => tonerId),
            ]),
        ];
        const rows = shown.map((tonerId) => {
            const line = byToner.get(tonerId) ?? null;
            const got = received.get(tonerId) ?? null;
            const toner = master.get(tonerId);
            const invoiceQty = line?.quantity ?? 0;
            const unitPrice = line?.unitPrice ?? null;
            const invoiceAmount = line && unitPrice !== null ? unitPrice * line.quantity : null;
            const receivedQty = got?.quantity ?? 0;
            const dataAmount = got && got.priceKnown ? got.amount : null;
            const qtyDiff = invoiceQty - receivedQty;
            const amountDiff = invoiceAmount !== null && dataAmount !== null
                ? invoiceAmount - dataAmount
                : null;
            return {
                tonerId,
                name: toner?.name ?? null,
                color: toner?.color ?? null,
                onInvoice: line !== null,
                invoiceQty,
                unitPrice,
                invoiceAmount,
                receivedQty,
                dataAmount,
                qtyDiff,
                amountDiff,
                nearbyQty: got?.nearby ?? 0,
                status: this.statusOf({
                    onInvoice: line !== null,
                    receivedQty,
                    qtyDiff,
                    invoiceAmount,
                    dataAmount,
                    amountDiff,
                }),
            };
        });
        rows.sort((a, b) => a.tonerId.localeCompare(b.tonerId, 'ja', { numeric: true }));
        const sum = (pick) => rows.reduce((total, row) => total + (pick(row) ?? 0), 0);
        const invoiceTotal = sum((row) => row.invoiceAmount);
        const dataTotal = sum((row) => row.dataAmount);
        return {
            invoice: this.toResponse(invoice),
            rows,
            totals: {
                invoiceQty: sum((row) => row.invoiceQty),
                receivedQty: sum((row) => row.receivedQty),
                invoiceAmount: invoiceTotal,
                dataAmount: dataTotal,
                amountDiff: invoiceTotal - dataTotal,
                unknownAmount: rows.filter((row) => row.invoiceAmount === null || row.dataAmount === null).length,
            },
            mismatches: rows.filter((row) => row.status !== 'match').length,
        };
    }
    withLines = {
        lines: {
            orderBy: { tonerId: 'asc' },
            include: { toner: { select: { name: true, color: true } } },
        },
    };
    statusOf(row) {
        if (!row.onInvoice)
            return 'not-invoiced';
        if (row.receivedQty === 0)
            return 'not-received';
        if (row.qtyDiff !== 0)
            return 'qty-diff';
        if (row.invoiceAmount === null || row.dataAmount === null) {
            return 'unknown-price';
        }
        return row.amountDiff === 0 ? 'match' : 'price-diff';
    }
    parsePeriod(dto) {
        const from = (0, date_1.toDate)(dto.periodFrom);
        const to = (0, date_1.toDate)(dto.periodTo);
        if (from > to) {
            throw new common_1.BadRequestException('対象期間の開始日は終了日より前の日付を指定してください');
        }
        return { from, to };
    }
    assertNoDuplicateLine(dto) {
        const seen = new Set();
        for (const line of dto.lines) {
            if (seen.has(line.tonerId)) {
                throw new common_1.BadRequestException(`${line.tonerId} が 2 行あります。1 行にまとめて入力してください`);
            }
            seen.add(line.tonerId);
        }
    }
    async assertTonersExist(dto) {
        const ids = [...new Set(dto.lines.map((line) => line.tonerId))];
        const found = await this.prisma.toner.findMany({
            where: { id: { in: ids } },
            select: { id: true },
        });
        const registered = new Set(found.map((row) => row.id));
        const missing = ids.filter((id) => !registered.has(id));
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`${missing.join(', ')} は未登録です。先にトナー登録を行ってください`);
        }
    }
    async ensureExists(id) {
        const found = await this.prisma.tonerInvoice.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!found) {
            throw new common_1.NotFoundException(`ID ${id} の請求書は登録されていません`);
        }
    }
    toResponse(invoice) {
        const lines = invoice.lines.map((line) => ({
            id: line.id,
            tonerId: line.tonerId,
            name: line.toner.name,
            color: line.toner.color,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount: line.unitPrice === null ? null : line.unitPrice * line.quantity,
        }));
        return {
            id: invoice.id,
            issuedOn: (0, date_1.fromDate)(invoice.issuedOn),
            periodFrom: (0, date_1.fromDate)(invoice.periodFrom),
            periodTo: (0, date_1.fromDate)(invoice.periodTo),
            invoiceNo: invoice.invoiceNo,
            note: invoice.note,
            checkedAt: invoice.checkedAt,
            checkedBy: invoice.checkedBy,
            lines,
            totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
            totalAmount: lines.reduce((sum, line) => sum + (line.amount ?? 0), 0),
            unpricedLines: lines.filter((line) => line.unitPrice === null).length,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
        };
    }
};
exports.TonerInvoicesService = TonerInvoicesService;
exports.TonerInvoicesService = TonerInvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TonerInvoicesService);
//# sourceMappingURL=toner-invoices.service.js.map