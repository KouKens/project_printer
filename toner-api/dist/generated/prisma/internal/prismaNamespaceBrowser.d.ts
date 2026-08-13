import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Toner: "Toner";
    readonly TonerStock: "TonerStock";
    readonly TonerEntry: "TonerEntry";
    readonly TonerOrder: "TonerOrder";
    readonly Printer: "Printer";
    readonly PageCountDaily: "PageCountDaily";
    readonly SupplyReading: "SupplyReading";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const TonerScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerScalarFieldEnum = (typeof TonerScalarFieldEnum)[keyof typeof TonerScalarFieldEnum];
export declare const TonerStockScalarFieldEnum: {
    readonly tonerId: "tonerId";
    readonly quantity: "quantity";
    readonly received: "received";
    readonly disposed: "disposed";
    readonly updatedAt: "updatedAt";
};
export type TonerStockScalarFieldEnum = (typeof TonerStockScalarFieldEnum)[keyof typeof TonerStockScalarFieldEnum];
export declare const TonerEntryScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tonerId: "tonerId";
    readonly action: "action";
    readonly quantity: "quantity";
    readonly balance: "balance";
    readonly createdAt: "createdAt";
};
export type TonerEntryScalarFieldEnum = (typeof TonerEntryScalarFieldEnum)[keyof typeof TonerEntryScalarFieldEnum];
export declare const TonerOrderScalarFieldEnum: {
    readonly id: "id";
    readonly tonerId: "tonerId";
    readonly quantity: "quantity";
    readonly orderedAt: "orderedAt";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerOrderScalarFieldEnum = (typeof TonerOrderScalarFieldEnum)[keyof typeof TonerOrderScalarFieldEnum];
export declare const PrinterScalarFieldEnum: {
    readonly id: "id";
    readonly ipAddress: "ipAddress";
    readonly community: "community";
    readonly version: "version";
    readonly hostName: "hostName";
    readonly model: "model";
    readonly serialNumber: "serialNumber";
    readonly macAddress: "macAddress";
    readonly location: "location";
    readonly pageCount: "pageCount";
    readonly reachable: "reachable";
    readonly lastError: "lastError";
    readonly lastPolledAt: "lastPolledAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PrinterScalarFieldEnum = (typeof PrinterScalarFieldEnum)[keyof typeof PrinterScalarFieldEnum];
export declare const PageCountDailyScalarFieldEnum: {
    readonly id: "id";
    readonly printerId: "printerId";
    readonly date: "date";
    readonly total: "total";
    readonly pages: "pages";
    readonly spanDays: "spanDays";
    readonly capturedAt: "capturedAt";
};
export type PageCountDailyScalarFieldEnum = (typeof PageCountDailyScalarFieldEnum)[keyof typeof PageCountDailyScalarFieldEnum];
export declare const SupplyReadingScalarFieldEnum: {
    readonly id: "id";
    readonly printerId: "printerId";
    readonly supplyIndex: "supplyIndex";
    readonly name: "name";
    readonly colorant: "colorant";
    readonly level: "level";
    readonly maxCapacity: "maxCapacity";
    readonly percent: "percent";
    readonly updatedAt: "updatedAt";
};
export type SupplyReadingScalarFieldEnum = (typeof SupplyReadingScalarFieldEnum)[keyof typeof SupplyReadingScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
