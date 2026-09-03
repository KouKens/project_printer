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
exports.CostsService = void 0;
const common_1 = require("@nestjs/common");
const date_1 = require("../common/date");
const prisma_service_1 = require("../prisma/prisma.service");
const printer_match_1 = require("../printers/printer-match");
function daysBetween(from, to) {
    return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}
const DAYS_PER_YEAR = 365;
const COLOR_NAME = /シアン|マゼンタ|イエロー|カラー|4色|6色|フルカラー/;
function isColorSupply(color) {
    if (!color)
        return false;
    if (/ブラック|黒/.test(color) && !COLOR_NAME.test(color))
        return false;
    return COLOR_NAME.test(color);
}
let CostsService = class CostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async find(query) {
        const years = query.years && query.years > 0 ? query.years : 5;
        const [assets, printers, dailies, repairs, toners, entries] = await Promise.all([
            this.prisma.printerAsset.findMany({
                orderBy: [{ department: 'asc' }, { no: 'asc' }, { id: 'asc' }],
                select: {
                    id: true,
                    company: { select: { id: true, name: true } },
                    department: true,
                    no: true,
                    ipAddress: true,
                    maker: true,
                    model: true,
                    serialNumber: true,
                    purchasePrice: true,
                    maintFee: true,
                    maintStartOn: true,
                    maintEndOn: true,
                    toners: { select: { tonerId: true } },
                },
            }),
            this.prisma.printer.findMany({
                select: { id: true, ipAddress: true, serialNumber: true },
            }),
            this.prisma.pageCountDaily.findMany({
                orderBy: { date: 'asc' },
                select: {
                    printerId: true,
                    date: true,
                    pages: true,
                    monoPages: true,
                    colorPages: true,
                },
            }),
            this.prisma.repairRecord.findMany({
                select: {
                    printerAssetId: true,
                    cost: true,
                    restoredOn: true,
                    occurredOn: true,
                },
            }),
            this.prisma.toner.findMany({
                select: {
                    id: true,
                    name: true,
                    color: true,
                    yieldPages: true,
                    prices: {
                        orderBy: { effectiveFrom: 'desc' },
                        select: { price: true, effectiveFrom: true },
                    },
                    printers: { select: { printerAssetId: true } },
                },
            }),
            this.prisma.tonerEntry.findMany({
                orderBy: { createdAt: 'asc' },
                select: {
                    tonerId: true,
                    action: true,
                    quantity: true,
                    createdAt: true,
                    receivedOn: true,
                },
            }),
        ]);
        const dates = dailies.map((row) => row.date);
        const first = dates.length > 0 ? dates[0] : new Date();
        const last = dates.length > 0 ? dates[dates.length - 1] : new Date();
        const from = query.from ? (0, date_1.toDate)(query.from) : first;
        const to = query.to ? (0, date_1.toDate)(query.to) : last;
        const days = Math.max(daysBetween(from, to), 1);
        const share = days / DAYS_PER_YEAR;
        const now = new Date();
        const priceOf = (prices) => prices.find((row) => row.effectiveFrom <= now)?.price ?? null;
        const costs = new Map();
        for (const toner of toners) {
            const price = priceOf(toner.prices);
            costs.set(toner.id, {
                id: toner.id,
                name: toner.name,
                color: toner.color,
                price,
                yieldPages: toner.yieldPages,
                costPerPage: price !== null && toner.yieldPages ? price / toner.yieldPages : null,
                isColor: isColorSupply(toner.color),
            });
        }
        const live = (0, printer_match_1.indexPrinters)(printers, assets);
        const pagesByPrinter = new Map();
        for (const row of dailies) {
            if (row.date < from || row.date > to)
                continue;
            if (row.pages === null)
                continue;
            const cur = pagesByPrinter.get(row.printerId) ?? {
                pages: 0,
                color: 0,
                splitPages: 0,
            };
            cur.pages += row.pages;
            if (row.colorPages !== null) {
                cur.color += row.colorPages;
                cur.splitPages += row.pages;
            }
            pagesByPrinter.set(row.printerId, cur);
        }
        const repairByAsset = new Map();
        for (const repair of repairs) {
            const when = repair.restoredOn ?? repair.occurredOn;
            if (!when || when < from || when > to)
                continue;
            const cur = repairByAsset.get(repair.printerAssetId) ?? {
                cost: 0,
                known: 0,
            };
            if (repair.cost !== null) {
                cur.cost += repair.cost;
                cur.known += 1;
            }
            repairByAsset.set(repair.printerAssetId, cur);
        }
        const soleAsset = new Map();
        for (const toner of toners) {
            if (toner.printers.length === 1) {
                soleAsset.set(toner.id, toner.printers[0].printerAssetId);
            }
        }
        const toExclusive = new Date(to.getTime() + 86_400_000);
        const inPeriod = entries.filter((entry) => {
            const when = entry.receivedOn ?? entry.createdAt;
            return when >= from && when < toExclusive;
        });
        const unitsByToner = new Map();
        for (const entry of inPeriod) {
            if (entry.action !== 'RECEIVE' && entry.action !== 'ISSUE')
                continue;
            const cur = unitsByToner.get(entry.tonerId) ?? { received: 0, issued: 0 };
            if (entry.action === 'RECEIVE')
                cur.received += entry.quantity;
            else
                cur.issued += entry.quantity;
            unitsByToner.set(entry.tonerId, cur);
        }
        const actualByAsset = new Map();
        for (const entry of inPeriod) {
            if (entry.action !== 'ISSUE')
                continue;
            const assetId = soleAsset.get(entry.tonerId);
            if (assetId === undefined)
                continue;
            const price = costs.get(entry.tonerId)?.price ?? null;
            if (price === null)
                continue;
            const cur = actualByAsset.get(assetId) ?? { tonerCost: 0, issues: 0 };
            cur.tonerCost += entry.quantity * price;
            cur.issues += entry.quantity;
            actualByAsset.set(assetId, cur);
        }
        const rows = assets.map((asset) => {
            const printer = (0, printer_match_1.matchPrinter)(asset, live);
            const counted = printer !== null ? pagesByPrinter.get(printer.id) : undefined;
            const pages = counted?.pages ?? null;
            const colorPages = counted?.color ?? 0;
            const splitKnown = counted !== undefined && counted.splitPages >= counted.pages;
            const linked = asset.toners
                .map((link) => costs.get(link.tonerId))
                .filter((toner) => toner !== undefined);
            const base = linked.filter((toner) => !toner.isColor);
            const color = linked.filter((toner) => toner.isColor);
            const sum = (list) => list.reduce((total, toner) => total + (toner.costPerPage ?? 0), 0);
            const baseCpp = sum(base);
            const colorCpp = sum(color);
            const missing = linked
                .filter((toner) => toner.costPerPage === null)
                .map((toner) => toner.id);
            const tonerCost = pages === null ? null : pages * baseCpp + colorPages * colorCpp;
            const attributable = linked.length > 0 && linked.every((toner) => soleAsset.has(toner.id));
            const perYearBody = asset.purchasePrice === null ? null : asset.purchasePrice / years;
            const maintYears = asset.maintStartOn && asset.maintEndOn
                ? Math.max(daysBetween(asset.maintStartOn, asset.maintEndOn) / DAYS_PER_YEAR, 1 / 12)
                : null;
            const perYearMaint = asset.maintFee !== null && maintYears !== null
                ? asset.maintFee / maintYears
                : null;
            const body = perYearBody === null ? null : perYearBody * share;
            const maint = perYearMaint === null ? null : perYearMaint * share;
            const repair = repairByAsset.get(asset.id) ?? { cost: 0, known: 0 };
            const total = (tonerCost ?? 0) + (body ?? 0) + (maint ?? 0) + repair.cost;
            return {
                id: asset.id,
                companyId: asset.company?.id ?? null,
                company: asset.company?.name ?? null,
                no: asset.no,
                department: asset.department,
                maker: asset.maker,
                model: asset.model,
                pages,
                colorPages: splitKnown ? colorPages : null,
                splitKnown,
                catalog: {
                    baseCostPerPage: baseCpp > 0 ? baseCpp : null,
                    colorCostPerPage: colorCpp > 0 ? colorCpp : null,
                    tonerCost,
                    tonerCostPerPage: pages && tonerCost !== null ? tonerCost / pages : null,
                    body,
                    maint,
                    repairCost: repair.cost,
                    repairKnown: repair.known,
                    total: pages === null && body === null && maint === null ? null : total,
                    totalCostPerPage: pages ? total / pages : null,
                    missingCost: missing,
                    tonerCount: linked.length,
                },
                actual: attributable
                    ? (actualByAsset.get(asset.id) ?? { tonerCost: 0, issues: 0 })
                    : null,
                actualReason: attributable
                    ? null
                    : linked.length === 0
                        ? 'no-toner'
                        : 'shared-toner',
                sharedToners: linked
                    .filter((toner) => !soleAsset.has(toner.id))
                    .map((toner) => toner.id),
            };
        });
        const assetPages = new Map();
        for (const row of rows) {
            if (row.pages === null)
                continue;
            assetPages.set(row.id, { pages: row.pages, color: row.colorPages ?? 0 });
        }
        const tonerRows = toners
            .map((toner) => {
            const cost = costs.get(toner.id);
            let pages = 0;
            for (const link of toner.printers) {
                const counted = assetPages.get(link.printerAssetId);
                if (!counted)
                    continue;
                pages += cost.isColor ? counted.color : counted.pages;
            }
            const { received, issued } = unitsByToner.get(toner.id) ?? {
                received: 0,
                issued: 0,
            };
            const expected = toner.yieldPages ? pages / toner.yieldPages : null;
            return {
                id: toner.id,
                name: toner.name,
                color: toner.color,
                isColor: cost.isColor,
                price: cost.price,
                yieldPages: toner.yieldPages,
                costPerPage: cost.costPerPage,
                assetCount: toner.printers.length,
                pages,
                expectedUnits: expected,
                expectedCost: expected !== null && cost.price !== null
                    ? expected * cost.price
                    : null,
                receivedUnits: received,
                receivedCost: cost.price !== null ? received * cost.price : null,
                issuedUnits: issued,
                issuedCost: cost.price !== null ? issued * cost.price : null,
            };
        })
            .filter((row) => row.pages > 0 || row.receivedUnits > 0 || row.issuedUnits > 0);
        return {
            period: { from: (0, date_1.fromDate)(from), to: (0, date_1.fromDate)(to), days },
            assumptions: {
                years,
                maintFeeBasis: 'contract-total',
            },
            coverage: {
                assets: rows.length,
                withPages: rows.filter((row) => row.pages !== null).length,
                withPurchasePrice: rows.filter((row) => row.catalog.body !== null)
                    .length,
                withMaint: rows.filter((row) => row.catalog.maint !== null).length,
                missingCostAssets: rows.filter((row) => row.catalog.missingCost.length > 0).length,
                unsplitColorAssets: rows.filter((row) => row.pages !== null && !row.splitKnown).length,
                entries: inPeriod.length,
                attributableAssets: rows.filter((row) => row.actual !== null).length,
            },
            printers: rows,
            toners: tonerRows,
        };
    }
};
exports.CostsService = CostsService;
exports.CostsService = CostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostsService);
//# sourceMappingURL=costs.service.js.map