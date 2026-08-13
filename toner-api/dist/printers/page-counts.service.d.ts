import { PrismaService } from '../prisma/prisma.service';
import { SnmpService } from './snmp.service';
export type CaptureRow = {
    printerId: number;
    ipAddress: string;
    date: string;
    total: number | null;
    pages: number | null;
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
    findDaily(printerId: number, days?: number): Promise<{
        date: string;
        pages: number | null;
        total: number;
        spanDays: number;
        capturedAt: Date;
    }[]>;
}
