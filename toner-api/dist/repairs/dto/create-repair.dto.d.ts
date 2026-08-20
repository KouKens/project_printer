export declare const REPAIR_CATEGORIES: readonly ["PART_REPLACEMENT", "SENSOR_DIRT", "PAPER_JAM", "PRINT_QUALITY", "SERVICE_CALL", "FEED_FAILURE", "FUSING_FAILURE", "NETWORK", "NOISE_SMELL", "NO_POWER", "OTHER"];
export declare const REPAIR_HANDLERS: readonly ["IN_HOUSE", "VENDOR"];
export declare const REPAIR_STATUSES: readonly ["INVESTIGATING", "QUOTING", "SETTLING", "SHIPPED", "RECEIVED", "DONE"];
export type RepairCategoryInput = (typeof REPAIR_CATEGORIES)[number];
export type RepairHandlerInput = (typeof REPAIR_HANDLERS)[number];
export type RepairStatusInput = (typeof REPAIR_STATUSES)[number];
export declare class CreateRepairDto {
    assignee?: string | null;
    printerAssetId: number;
    occurredOn?: string | null;
    category?: RepairCategoryInput | null;
    handledBy: RepairHandlerInput;
    detail?: string | null;
    restoredOn: string;
    status?: RepairStatusInput;
}
