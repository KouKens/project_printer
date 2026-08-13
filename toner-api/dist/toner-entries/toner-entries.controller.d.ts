import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { TonerEntriesService } from './toner-entries.service';
export declare class TonerEntriesController {
    private readonly service;
    constructor(service: TonerEntriesService);
    create(dto: CreateTonerEntryDto): Promise<import("./toner-entries.service").EntryResult>;
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
    findStock(): Promise<{
        id: string;
        name: string | null;
        quantity: number;
        received: number;
        disposed: number;
        updatedAt: Date;
    }[]>;
}
