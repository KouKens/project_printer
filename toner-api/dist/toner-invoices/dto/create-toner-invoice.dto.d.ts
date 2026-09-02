export declare class CreateTonerInvoiceLineDto {
    tonerId: string;
    quantity: number;
    unitPrice?: number | null;
}
export declare class CreateTonerInvoiceDto {
    issuedOn: string;
    periodFrom: string;
    periodTo: string;
    invoiceNo?: string | null;
    note?: string | null;
    lines: CreateTonerInvoiceLineDto[];
}
