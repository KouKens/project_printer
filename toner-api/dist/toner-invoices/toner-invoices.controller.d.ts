import { CreateTonerInvoiceDto } from './dto/create-toner-invoice.dto';
import { TonerInvoicesService } from './toner-invoices.service';
export declare class TonerInvoicesController {
    private readonly service;
    constructor(service: TonerInvoicesService);
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
            status: import("./toner-invoices.service").CheckStatus;
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
    markChecked(id: number, body: {
        checkedBy?: string;
    }): Promise<{
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
}
