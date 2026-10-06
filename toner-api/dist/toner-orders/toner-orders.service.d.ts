import { PrismaService } from '../prisma/prisma.service';
import { BulkTonerOrderDto } from './dto/bulk-toner-order.dto';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
export declare class TonerOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private parseOrderedAt;
    create(dto: CreateTonerOrderDto): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }>;
    findPending(companyId?: number): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }[]>;
    bulk(dto: BulkTonerOrderDto): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }[]>;
    receive(ids: number[]): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }[]>;
    unreceive(id: number): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }>;
    findDeliveryCheck(companyId?: number, days?: number): Promise<{
        pendingOrderIds: number[];
        settled: boolean;
        diff: number;
        status: "match" | "short" | "over" | "no-order" | "waiting" | "undated";
        key: string;
        companyId: number;
        companyName: string;
        tonerId: string;
        name: string | null;
        color: string | null;
        date: string | null;
        ordered: number;
        received: number;
        orders: {
            id: number;
            quantity: number;
            orderedAt: Date;
            status: string;
            receivedAt: Date | null;
            receiveMode: "AUTO" | "MANUAL" | null;
        }[];
        entries: {
            id: number;
            quantity: number;
            userId: string;
            createdAt: Date;
        }[];
    }[]>;
    remove(id: number): Promise<{
        id: number;
        tonerId: string;
        quantity: number;
    }>;
    findAll(companyId?: number): Promise<{
        id: number;
        tonerId: string;
        companyId: number;
        companyName: string;
        userId: string | null;
        name: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: string | null;
        status: string;
        receivedAt: Date | null;
        receiveMode: "AUTO" | "MANUAL" | null;
    }[]>;
}
