import { PrismaService } from '../prisma/prisma.service';
import { SnmpService } from './snmp.service';
export type CaptureRow = {
    printerId: number;
    ipAddress: string;
    date: string;
    total: number | null;
    totalMono: number | null;
    totalColor: number | null;
    pages: number | null;
    monoPages: number | null;
    colorPages: number | null;
    spanDays: number;
    status: 'recorded' | 'skipped' | 'unreachable';
    note?: string;
};
export declare class PageCountsService {
    private readonly prisma;
    private readonly snmp;
    private readonly logger;
    constructor(prisma: PrismaService, snmp: SnmpService);
    captureScheduled(): Promise<void>;
    captureAll(now?: Date): Promise<CaptureRow[]>;
    captureOne(printerId: number, now?: Date): Promise<CaptureRow>;
    findAllDaily(days?: number, from?: string, to?: string): Promise<{
        id: number;
        printerId: number;
        ipAddress: string;
        model: string | null;
        date: string;
        total: number;
        totalMono: number | null;
        totalColor: number | null;
        pages: number | null;
        monoPages: number | null;
        colorPages: number | null;
        spanDays: number;
        capturedAt: Date;
    }[]>;
    findDaily(printerId: number, days?: number, from?: string, to?: string): Promise<{
        date: string;
        pages: number | null;
        monoPages: number | null;
        colorPages: number | null;
        total: number;
        totalMono: number | null;
        totalColor: number | null;
        spanDays: number;
        capturedAt: Date;
    }[]>;
}
