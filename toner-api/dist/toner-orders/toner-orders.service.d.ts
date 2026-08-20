import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
export declare class TonerOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTonerOrderDto): Promise<{
        id: number;
        tonerId: string;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
    }>;
    findPending(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        toner: {
            name: string | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: import("../generated/prisma/enums").OrderStatus;
        tonerId: string;
        quantity: number;
        orderedAt: Date;
    })[]>;
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        toner: {
            name: string | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        status: import("../generated/prisma/enums").OrderStatus;
        tonerId: string;
        quantity: number;
        orderedAt: Date;
    })[]>;
}
