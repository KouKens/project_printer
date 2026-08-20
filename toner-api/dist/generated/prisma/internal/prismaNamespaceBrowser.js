"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullsOrder = exports.QueryMode = exports.SortOrder = exports.RepairRecordScalarFieldEnum = exports.SupplyReadingScalarFieldEnum = exports.PageCountDailyScalarFieldEnum = exports.PrinterAssetScalarFieldEnum = exports.PrinterAlertScalarFieldEnum = exports.PrinterScalarFieldEnum = exports.TonerOrderScalarFieldEnum = exports.TonerEntryScalarFieldEnum = exports.TonerStockScalarFieldEnum = exports.TonerPriceScalarFieldEnum = exports.TonerPrinterScalarFieldEnum = exports.TonerScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    Toner: 'Toner',
    TonerPrinter: 'TonerPrinter',
    TonerPrice: 'TonerPrice',
    TonerStock: 'TonerStock',
    TonerEntry: 'TonerEntry',
    TonerOrder: 'TonerOrder',
    Printer: 'Printer',
    PrinterAlert: 'PrinterAlert',
    PrinterAsset: 'PrinterAsset',
    PageCountDaily: 'PageCountDaily',
    SupplyReading: 'SupplyReading',
    RepairRecord: 'RepairRecord'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.TonerScalarFieldEnum = {
    id: 'id',
    name: 'name',
    color: 'color',
    recycled: 'recycled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.TonerPrinterScalarFieldEnum = {
    tonerId: 'tonerId',
    printerAssetId: 'printerAssetId',
    createdAt: 'createdAt'
};
exports.TonerPriceScalarFieldEnum = {
    id: 'id',
    tonerId: 'tonerId',
    price: 'price',
    effectiveFrom: 'effectiveFrom',
    note: 'note',
    createdAt: 'createdAt'
};
exports.TonerStockScalarFieldEnum = {
    tonerId: 'tonerId',
    quantity: 'quantity',
    received: 'received',
    disposed: 'disposed',
    updatedAt: 'updatedAt'
};
exports.TonerEntryScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    tonerId: 'tonerId',
    action: 'action',
    quantity: 'quantity',
    balance: 'balance',
    createdAt: 'createdAt'
};
exports.TonerOrderScalarFieldEnum = {
    id: 'id',
    tonerId: 'tonerId',
    quantity: 'quantity',
    orderedAt: 'orderedAt',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.PrinterScalarFieldEnum = {
    id: 'id',
    ipAddress: 'ipAddress',
    community: 'community',
    version: 'version',
    hostName: 'hostName',
    model: 'model',
    serialNumber: 'serialNumber',
    macAddress: 'macAddress',
    location: 'location',
    pageCount: 'pageCount',
    reachable: 'reachable',
    lastError: 'lastError',
    lastPolledAt: 'lastPolledAt',
    lastSuccessAt: 'lastSuccessAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    consoleText: 'consoleText'
};
exports.PrinterAlertScalarFieldEnum = {
    id: 'id',
    printerId: 'printerId',
    alertIndex: 'alertIndex',
    severity: 'severity',
    alertGroup: 'alertGroup',
    groupIndex: 'groupIndex',
    code: 'code',
    description: 'description',
    updatedAt: 'updatedAt'
};
exports.PrinterAssetScalarFieldEnum = {
    id: 'id',
    department: 'department',
    no: 'no',
    ipAddress: 'ipAddress',
    maker: 'maker',
    model: 'model',
    serialNumber: 'serialNumber',
    purchasedOn: 'purchasedOn',
    contractNo: 'contractNo',
    maintContract: 'maintContract',
    maintStartOn: 'maintStartOn',
    maintEndOn: 'maintEndOn',
    maintDealOn: 'maintDealOn',
    maintFee: 'maintFee',
    note: 'note',
    countLayout: 'countLayout',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.PageCountDailyScalarFieldEnum = {
    id: 'id',
    printerId: 'printerId',
    date: 'date',
    total: 'total',
    totalMono: 'totalMono',
    totalColor: 'totalColor',
    pages: 'pages',
    monoPages: 'monoPages',
    colorPages: 'colorPages',
    spanDays: 'spanDays',
    capturedAt: 'capturedAt'
};
exports.SupplyReadingScalarFieldEnum = {
    id: 'id',
    printerId: 'printerId',
    supplyIndex: 'supplyIndex',
    name: 'name',
    supplyType: 'supplyType',
    supplyClass: 'supplyClass',
    colorant: 'colorant',
    level: 'level',
    maxCapacity: 'maxCapacity',
    percent: 'percent',
    updatedAt: 'updatedAt'
};
exports.RepairRecordScalarFieldEnum = {
    id: 'id',
    assignee: 'assignee',
    printerAssetId: 'printerAssetId',
    occurredOn: 'occurredOn',
    category: 'category',
    handledBy: 'handledBy',
    detail: 'detail',
    restoredOn: 'restoredOn',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map