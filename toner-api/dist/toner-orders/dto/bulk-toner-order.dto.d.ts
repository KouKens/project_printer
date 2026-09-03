export declare class BulkTonerOrderItemDto {
    tonerId: string;
    quantity: number;
}
export declare class BulkTonerOrderDto {
    orderedAt: string;
    userId?: string;
    companyId: number;
    deliveryOn?: string;
    items: BulkTonerOrderItemDto[];
}
