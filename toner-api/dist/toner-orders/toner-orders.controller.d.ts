import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
import { TonerOrdersService } from './toner-orders.service';
export declare class TonerOrdersController {
    private readonly service;
    constructor(service: TonerOrdersService);
    create(dto: CreateTonerOrderDto): Promise<{
        id: number;
        tonerId: string;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
    }>;
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        toner: {
            name: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tonerId: string;
        quantity: number;
        orderedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
    })[]>;
    findPending(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        toner: {
            name: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        tonerId: string;
        quantity: number;
        orderedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
    })[]>;
}
