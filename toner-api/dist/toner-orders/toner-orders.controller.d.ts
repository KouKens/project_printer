import { BulkTonerOrderDto } from './dto/bulk-toner-order.dto';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
import { ReceiveTonerOrdersDto } from './dto/receive-toner-orders.dto';
import { TonerOrdersService } from './toner-orders.service';
export declare class TonerOrdersController {
    private readonly service;
    constructor(service: TonerOrdersService);
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
    createMany(dto: BulkTonerOrderDto): Promise<{
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
    remove(id: number): Promise<{
        id: number;
        tonerId: string;
        quantity: number;
    }>;
    receive(dto: ReceiveTonerOrdersDto): Promise<{
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
    findDeliveryCheck(companyId: number | undefined, days: number, from?: string, to?: string): Promise<{
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
}
