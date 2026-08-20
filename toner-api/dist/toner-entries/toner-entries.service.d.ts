import { PrismaService } from '../prisma/prisma.service';
import { BulkTonerEntryDto } from './dto/bulk-toner-entry.dto';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { StockTakeDto } from './dto/stock-take.dto';
export type TonerAction = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE' | 'ADJUST';
export declare const GUEST_USER = "\u30B2\u30B9\u30C8";
export type StockTakeRow = {
    tonerId: string;
    name: string | null;
    before: number;
    counted: number;
    diff: number;
    status: 'adjusted' | 'same' | 'unknown';
};
export type EntryResult = {
    tonerId: string;
    name: string | null;
    action: TonerAction;
    quantity: number;
    stock: number;
    received: number;
    disposed: number;
};
export declare class TonerEntriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTonerEntryDto): Promise<EntryResult>;
    bulk(dto: BulkTonerEntryDto): Promise<EntryResult[]>;
    private apply;
    private register;
    private receive;
    private issue;
    private dispose;
    stockTake(dto: StockTakeDto): Promise<StockTakeRow[]>;
    findStock(): Promise<{
        id: string;
        name: string | null;
        color: string | null;
        quantity: number;
        received: number;
        disposed: number;
        updatedAt: Date;
    }[]>;
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
    private requireToner;
    private toResult;
}
