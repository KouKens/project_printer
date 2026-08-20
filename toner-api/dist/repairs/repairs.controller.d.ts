import { CreateRepairDto } from './dto/create-repair.dto';
import { RepairsService } from './repairs.service';
export declare class RepairsController {
    private readonly service;
    constructor(service: RepairsService);
    create(dto: CreateRepairDto): Promise<{
        id: number;
        assignee: string | null;
        printerAssetId: number;
        department: string | null;
        no: string | null;
        maker: string | null;
        model: string | null;
        occurredOn: string | null;
        category: "PART_REPLACEMENT" | "SENSOR_DIRT" | "PAPER_JAM" | "PRINT_QUALITY" | "SERVICE_CALL" | "FEED_FAILURE" | "FUSING_FAILURE" | "NETWORK" | "NOISE_SMELL" | "NO_POWER" | "OTHER" | null;
        handledBy: "IN_HOUSE" | "VENDOR";
        detail: string | null;
        restoredOn: string | null;
        status: "INVESTIGATING" | "QUOTING" | "SETTLING" | "SHIPPED" | "RECEIVED" | "DONE";
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        assignee: string | null;
        printerAssetId: number;
        department: string | null;
        no: string | null;
        maker: string | null;
        model: string | null;
        occurredOn: string | null;
        category: "PART_REPLACEMENT" | "SENSOR_DIRT" | "PAPER_JAM" | "PRINT_QUALITY" | "SERVICE_CALL" | "FEED_FAILURE" | "FUSING_FAILURE" | "NETWORK" | "NOISE_SMELL" | "NO_POWER" | "OTHER" | null;
        handledBy: "IN_HOUSE" | "VENDOR";
        detail: string | null;
        restoredOn: string | null;
        status: "INVESTIGATING" | "QUOTING" | "SETTLING" | "SHIPPED" | "RECEIVED" | "DONE";
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        assignee: string | null;
        printerAssetId: number;
        department: string | null;
        no: string | null;
        maker: string | null;
        model: string | null;
        occurredOn: string | null;
        category: "PART_REPLACEMENT" | "SENSOR_DIRT" | "PAPER_JAM" | "PRINT_QUALITY" | "SERVICE_CALL" | "FEED_FAILURE" | "FUSING_FAILURE" | "NETWORK" | "NOISE_SMELL" | "NO_POWER" | "OTHER" | null;
        handledBy: "IN_HOUSE" | "VENDOR";
        detail: string | null;
        restoredOn: string | null;
        status: "INVESTIGATING" | "QUOTING" | "SETTLING" | "SHIPPED" | "RECEIVED" | "DONE";
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: CreateRepairDto): Promise<{
        id: number;
        assignee: string | null;
        printerAssetId: number;
        department: string | null;
        no: string | null;
        maker: string | null;
        model: string | null;
        occurredOn: string | null;
        category: "PART_REPLACEMENT" | "SENSOR_DIRT" | "PAPER_JAM" | "PRINT_QUALITY" | "SERVICE_CALL" | "FEED_FAILURE" | "FUSING_FAILURE" | "NETWORK" | "NOISE_SMELL" | "NO_POWER" | "OTHER" | null;
        handledBy: "IN_HOUSE" | "VENDOR";
        detail: string | null;
        restoredOn: string | null;
        status: "INVESTIGATING" | "QUOTING" | "SETTLING" | "SHIPPED" | "RECEIVED" | "DONE";
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
    }>;
}
