import { CostsService } from './costs.service';
export declare class CostsController {
    private readonly service;
    constructor(service: CostsService);
    find(from?: string, to?: string, years?: string): Promise<{
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
