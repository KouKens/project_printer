import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.PrismaClientConstructorArgs<Options>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = Prisma.PrismaClientOptions['omit'], in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    $connect(): runtime.Types.Utils.JsPromise<void>;
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    get toner(): Prisma.TonerDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerPrinter(): Prisma.TonerPrinterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerPrice(): Prisma.TonerPriceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerOffer(): Prisma.TonerOfferDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerOfferModel(): Prisma.TonerOfferModelDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerStock(): Prisma.TonerStockDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerEntry(): Prisma.TonerEntryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerOrder(): Prisma.TonerOrderDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerInvoice(): Prisma.TonerInvoiceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get tonerInvoiceLine(): Prisma.TonerInvoiceLineDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get printer(): Prisma.PrinterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get printerAlert(): Prisma.PrinterAlertDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get printerAsset(): Prisma.PrinterAssetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get company(): Prisma.CompanyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get maintVendor(): Prisma.MaintVendorDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get pageCountDaily(): Prisma.PageCountDailyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get supplyReading(): Prisma.SupplyReadingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get repairRecord(): Prisma.RepairRecordDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
