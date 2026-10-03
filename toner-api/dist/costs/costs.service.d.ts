import { PrismaService } from '../prisma/prisma.service';
export declare function oneOfEachFamily(linked: TonerCost[]): TonerCost[];
export type CostQuery = {
    from?: string;
    to?: string;
    years?: number;
};
export type PriceRow = {
    price: number;
    effectiveFrom: Date;
};
export declare function priceOn(prices: PriceRow[], day: Date): number | null;
export type TonerCost = {
    id: string;
    name: string | null;
    color: string | null;
    recycled: boolean;
    family: string;
    prices: PriceRow[];
    yieldPages: number | null;
    isColor: boolean;
};
export declare function costPerPageOn(toner: TonerCost, day: Date): number | null;
export declare class CostsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    find(query: CostQuery): Promise<{
        period: {
            from: string;
            to: string;
            days: number;
        };
        assumptions: {
            years: number;
            maintFeeBasis: "contract-total";
        };
        coverage: {
            assets: number;
            withPages: number;
            withPurchasePrice: number;
            withMaint: number;
            missingCostAssets: number;
            unsplitColorAssets: number;
            entries: number;
            attributableAssets: number;
        };
        printers: {
            id: number;
            companyId: number;
            company: string;
            no: string | null;
            department: string | null;
            maker: string | null;
            model: string | null;
            pages: number | null;
            colorPages: number | null;
            splitKnown: boolean;
            catalog: {
                baseCostPerPage: number | null;
                colorCostPerPage: number | null;
                tonerCost: number | null;
                tonerCostPerPage: number | null;
                body: number | null;
                maint: number | null;
                repairCost: number;
                repairKnown: number;
                total: number | null;
                totalCostPerPage: number | null;
                missingCost: string[];
                tonerCount: number;
            };
            actual: {
                tonerCost: number;
                issues: number;
            } | null;
            actualReason: "no-toner" | "shared-toner" | null;
            sharedToners: string[];
        }[];
        toners: {
            id: string;
            name: string | null;
            color: string | null;
            isColor: boolean;
            price: number | null;
            yieldPages: number | null;
            costPerPage: number | null;
            assetCount: number;
            pages: number;
            expectedUnits: number | null;
            expectedCost: number | null;
            receivedUnits: number;
            receivedCost: number | null;
            issuedUnits: number;
            issuedCost: number | null;
        }[];
    }>;
}
