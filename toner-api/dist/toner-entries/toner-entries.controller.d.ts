import { BulkTonerEntryDto } from './dto/bulk-toner-entry.dto';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { StockTakeDto } from './dto/stock-take.dto';
import { TonerEntriesService } from './toner-entries.service';
export declare class TonerEntriesController {
    private readonly service;
    constructor(service: TonerEntriesService);
    create(dto: CreateTonerEntryDto): Promise<import("./toner-entries.service").EntryResult>;
    createMany(dto: BulkTonerEntryDto): Promise<import("./toner-entries.service").EntryResult[]>;
    findRecent(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        toner: {
            name: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        tonerId: string;
        companyId: number;
        quantity: number;
        userId: string;
        action: import("../generated/prisma/enums").TonerAction;
        balance: number;
        receivedOn: Date | null;
    })[]>;
    findHistory(days: number, action?: string, tonerId?: string, companyId?: number): Promise<{
        truncated: boolean;
        limit: number;
        rows: {
            id: number;
            userId: string;
            tonerId: string;
            companyId: number;
            companyName: string;
            name: string | null;
            color: string | null;
            action: import("../generated/prisma/enums").TonerAction;
            quantity: number;
            balance: number;
            receivedOn: string | null;
            createdAt: Date;
        }[];
    }>;
    findStock(companyId: number): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        quantity: number;
        received: number;
        disposed: number;
        updatedAt: Date;
    }[]>;
    remove(id: number): Promise<{
        id: number;
        tonerId: string;
        name: string | null;
        action: "REGISTER" | "RECEIVE" | "ISSUE" | "DISPOSE";
        quantity: number;
        stock: number;
        received: number;
        disposed: number;
        ordersReopened: number;
    }>;
    stockTake(dto: StockTakeDto): Promise<import("./toner-entries.service").StockTakeRow[]>;
}
