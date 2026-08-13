import { PrismaService } from '../prisma/prisma.service';
import { CreatePrinterDto, SnmpVersionInput } from './dto/create-printer.dto';
import { SnmpService } from './snmp.service';
export declare class PrintersService {
    private readonly prisma;
    private readonly snmp;
    constructor(prisma: PrismaService, snmp: SnmpService);
    create(dto: CreatePrinterDto): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: SnmpVersionInput;
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
        version: SnmpVersionInput;
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
        version: SnmpVersionInput;
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
    findOne(id: number): Promise<{
        id: number;
        ipAddress: string;
        community: string;
        version: SnmpVersionInput;
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
    private pollOrFail;
    private snapshotFields;
    private replaceReadings;
    private toResponse;
}
