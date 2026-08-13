import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
export type TonerAction = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE';
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
    private register;
    private receive;
    private issue;
    private dispose;
    findStock(): Promise<{
        id: string;
        name: string | null;
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
        id: number;
        createdAt: Date;
        tonerId: string;
        quantity: number;
        userId: string;
        action: import("../generated/prisma/enums").TonerAction;
        balance: number;
    })[]>;
    private requireToner;
    private toResult;
}
