export declare class BulkTonerOrderItemDto {
    tonerId: string;
    quantity: number;
}
export declare class BulkTonerOrderDto {
    orderedAt: string;
    userId?: string;
    deliveryOn?: string;
    items: BulkTonerOrderItemDto[];
}
