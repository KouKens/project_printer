import { PrismaService } from '../prisma/prisma.service';
import { CreateTonerInvoiceDto } from './dto/create-toner-invoice.dto';
export type CheckStatus = 'match' | 'qty-diff' | 'price-diff' | 'not-received' | 'not-invoiced' | 'unknown-price';
export declare class TonerInvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTonerInvoiceDto): Promise<{
        id: number;
        issuedOn: string;
        periodFrom: string;
        periodTo: string;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        lines: {
            id: number;
            tonerId: string;
            name: string | null;
            color: string | null;
            quantity: number;
            unitPrice: number | null;
            amount: number | null;
        }[];
        totalQuantity: number;
        totalAmount: number;
        unpricedLines: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        issuedOn: string;
        periodFrom: string;
        periodTo: string;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        lines: {
            id: number;
            tonerId: string;
            name: string | null;
            color: string | null;
            quantity: number;
            unitPrice: number | null;
            amount: number | null;
        }[];
        totalQuantity: number;
        totalAmount: number;
        unpricedLines: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        issuedOn: string;
        periodFrom: string;
        periodTo: string;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        lines: {
            id: number;
            tonerId: string;
            name: string | null;
            color: string | null;
            quantity: number;
            unitPrice: number | null;
            amount: number | null;
        }[];
        totalQuantity: number;
        totalAmount: number;
        unpricedLines: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: CreateTonerInvoiceDto): Promise<{
        id: number;
        issuedOn: string;
        periodFrom: string;
        periodTo: string;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        lines: {
            id: number;
            tonerId: string;
            name: string | null;
            color: string | null;
            quantity: number;
            unitPrice: number | null;
            amount: number | null;
        }[];
        totalQuantity: number;
        totalAmount: number;
        unpricedLines: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    markChecked(id: number, checkedBy?: string): Promise<{
        id: number;
        issuedOn: string;
        periodFrom: string;
        periodTo: string;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        lines: {
            id: number;
            tonerId: string;
            name: string | null;
            color: string | null;
            quantity: number;
            unitPrice: number | null;
            amount: number | null;
        }[];
        totalQuantity: number;
        totalAmount: number;
        unpricedLines: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
    }>;
    check(id: number): Promise<{
        invoice: {
            id: number;
            issuedOn: string;
            periodFrom: string;
            periodTo: string;
            invoiceNo: string | null;
            note: string | null;
            checkedAt: Date | null;
            checkedBy: string | null;
            lines: {
                id: number;
                tonerId: string;
                name: string | null;
                color: string | null;
                quantity: number;
                unitPrice: number | null;
                amount: number | null;
            }[];
            totalQuantity: number;
            totalAmount: number;
            unpricedLines: number;
            createdAt: Date;
            updatedAt: Date;
        };
        rows: {
            tonerId: string;
            name: string | null;
            color: string | null;
            onInvoice: boolean;
            invoiceQty: number;
            unitPrice: number | null;
            invoiceAmount: number | null;
            receivedQty: number;
            dataAmount: number | null;
            qtyDiff: number;
            amountDiff: number | null;
            nearbyQty: number;
            status: CheckStatus;
        }[];
        totals: {
            invoiceQty: number;
            receivedQty: number;
            invoiceAmount: number;
            dataAmount: number;
            amountDiff: number;
            unknownAmount: number;
        };
        mismatches: number;
    }>;
    private readonly withLines;
    private statusOf;
    private parsePeriod;
    private assertNoDuplicateLine;
    private assertTonersExist;
    private ensureExists;
    private toResponse;
}
