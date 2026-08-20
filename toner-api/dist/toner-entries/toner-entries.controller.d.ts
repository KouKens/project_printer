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
        createdAt: Date;
        id: number;
        action: import("../generated/prisma/enums").TonerAction;
        userId: string;
        tonerId: string;
        quantity: number;
        balance: number;
    })[]>;
    findStock(): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        quantity: number;
        received: number;
        disposed: number;
        updatedAt: Date;
    }[]>;
    stockTake(dto: StockTakeDto): Promise<import("./toner-entries.service").StockTakeRow[]>;
}
