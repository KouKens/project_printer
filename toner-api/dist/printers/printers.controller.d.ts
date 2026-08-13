import { CreatePrinterDto } from './dto/create-printer.dto';
import { PageCountsService } from './page-counts.service';
import { PrintersService } from './printers.service';
export declare class PrintersController {
    private readonly service;
    private readonly pageCounts;
    constructor(service: PrintersService, pageCounts: PageCountsService);
    create(dto: CreatePrinterDto): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: import("./dto/create-printer.dto").SnmpVersionInput;
        hostName: string | null;
        model: string | null;
        serialNumber: string | null;
        macAddress: string | null;
        location: string | null;
        pageCount: number | null;
        reachable: boolean;
        lastError: string | null;
        lastPolledAt: Date | null;
        readings: {
            id: number;
            supplyIndex: number;
            name: string;
            colorant: string | null;
            level: number;
            maxCapacity: number;
            percent: number | null;
        }[];
    }>;
    findAll(): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: import("./dto/create-printer.dto").SnmpVersionInput;
        hostName: string | null;
        model: string | null;
        serialNumber: string | null;
        macAddress: string | null;
        location: string | null;
        pageCount: number | null;
        reachable: boolean;
        lastError: string | null;
        lastPolledAt: Date | null;
        readings: {
            id: number;
            supplyIndex: number;
            name: string;
            colorant: string | null;
            level: number;
            maxCapacity: number;
            percent: number | null;
        }[];
    }[]>;
    capture(): Promise<import("./page-counts.service").CaptureRow[]>;
    findOne(id: number): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: import("./dto/create-printer.dto").SnmpVersionInput;
        hostName: string | null;
        model: string | null;
        serialNumber: string | null;
        macAddress: string | null;
        location: string | null;
        pageCount: number | null;
        reachable: boolean;
        lastError: string | null;
        lastPolledAt: Date | null;
        readings: {
            id: number;
            supplyIndex: number;
            name: string;
            colorant: string | null;
            level: number;
            maxCapacity: number;
            percent: number | null;
        }[];
    }>;
    poll(id: number): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: import("./dto/create-printer.dto").SnmpVersionInput;
        hostName: string | null;
        model: string | null;
        serialNumber: string | null;
        macAddress: string | null;
        location: string | null;
        pageCount: number | null;
        reachable: boolean;
        lastError: string | null;
        lastPolledAt: Date | null;
        readings: {
            id: number;
            supplyIndex: number;
            name: string;
            colorant: string | null;
            level: number;
            maxCapacity: number;
            percent: number | null;
        }[];
    }>;
    findDaily(id: number, days: number): Promise<{
        date: string;
        pages: number | null;
        total: number;
        spanDays: number;
        capturedAt: Date;
    }[]>;
    captureOne(id: number): Promise<import("./page-counts.service").CaptureRow>;
}
