import type { TonerActionInput } from './create-toner-entry.dto';
export declare class BulkTonerEntryItemDto {
    tonerId: string;
    name?: string;
    quantity?: number;
}
export declare class BulkTonerEntryDto {
    action: TonerActionInput;
    userId: string;
    items: BulkTonerEntryItemDto[];
    receivedOn?: string;
}
