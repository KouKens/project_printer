import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> = [
    PrismaClientOptions
] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? ((Without<T, U> & U) | (Without<U, T> & T)) & object : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly Toner: "Toner";
    readonly TonerPrinter: "TonerPrinter";
    readonly TonerPrice: "TonerPrice";
    readonly TonerOffer: "TonerOffer";
    readonly TonerOfferModel: "TonerOfferModel";
    readonly TonerStock: "TonerStock";
    readonly TonerEntry: "TonerEntry";
    readonly TonerOrder: "TonerOrder";
    readonly TonerInvoice: "TonerInvoice";
    readonly TonerInvoiceLine: "TonerInvoiceLine";
    readonly Printer: "Printer";
    readonly PrinterAlert: "PrinterAlert";
    readonly PrinterAsset: "PrinterAsset";
    readonly Company: "Company";
    readonly MaintVendor: "MaintVendor";
    readonly PageCountDaily: "PageCountDaily";
    readonly SupplyReading: "SupplyReading";
    readonly RepairRecord: "RepairRecord";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "toner" | "tonerPrinter" | "tonerPrice" | "tonerOffer" | "tonerOfferModel" | "tonerStock" | "tonerEntry" | "tonerOrder" | "tonerInvoice" | "tonerInvoiceLine" | "printer" | "printerAlert" | "printerAsset" | "company" | "maintVendor" | "pageCountDaily" | "supplyReading" | "repairRecord";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        Toner: {
            payload: Prisma.$TonerPayload<ExtArgs>;
            fields: Prisma.TonerFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                findFirst: {
                    args: Prisma.TonerFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                findMany: {
                    args: Prisma.TonerFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>[];
                };
                create: {
                    args: Prisma.TonerCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                createMany: {
                    args: Prisma.TonerCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>[];
                };
                delete: {
                    args: Prisma.TonerDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                update: {
                    args: Prisma.TonerUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>[];
                };
                upsert: {
                    args: Prisma.TonerUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPayload>;
                };
                aggregate: {
                    args: Prisma.TonerAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateToner>;
                };
                groupBy: {
                    args: Prisma.TonerGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerCountAggregateOutputType> | number;
                };
            };
        };
        TonerPrinter: {
            payload: Prisma.$TonerPrinterPayload<ExtArgs>;
            fields: Prisma.TonerPrinterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerPrinterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerPrinterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                findFirst: {
                    args: Prisma.TonerPrinterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerPrinterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                findMany: {
                    args: Prisma.TonerPrinterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>[];
                };
                create: {
                    args: Prisma.TonerPrinterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                createMany: {
                    args: Prisma.TonerPrinterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerPrinterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>[];
                };
                delete: {
                    args: Prisma.TonerPrinterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                update: {
                    args: Prisma.TonerPrinterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerPrinterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerPrinterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerPrinterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>[];
                };
                upsert: {
                    args: Prisma.TonerPrinterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPrinterPayload>;
                };
                aggregate: {
                    args: Prisma.TonerPrinterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerPrinter>;
                };
                groupBy: {
                    args: Prisma.TonerPrinterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerPrinterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerPrinterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerPrinterCountAggregateOutputType> | number;
                };
            };
        };
        TonerPrice: {
            payload: Prisma.$TonerPricePayload<ExtArgs>;
            fields: Prisma.TonerPriceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerPriceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerPriceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                findFirst: {
                    args: Prisma.TonerPriceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerPriceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                findMany: {
                    args: Prisma.TonerPriceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>[];
                };
                create: {
                    args: Prisma.TonerPriceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                createMany: {
                    args: Prisma.TonerPriceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerPriceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>[];
                };
                delete: {
                    args: Prisma.TonerPriceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                update: {
                    args: Prisma.TonerPriceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                deleteMany: {
                    args: Prisma.TonerPriceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerPriceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerPriceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>[];
                };
                upsert: {
                    args: Prisma.TonerPriceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerPricePayload>;
                };
                aggregate: {
                    args: Prisma.TonerPriceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerPrice>;
                };
                groupBy: {
                    args: Prisma.TonerPriceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerPriceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerPriceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerPriceCountAggregateOutputType> | number;
                };
            };
        };
        TonerOffer: {
            payload: Prisma.$TonerOfferPayload<ExtArgs>;
            fields: Prisma.TonerOfferFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerOfferFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerOfferFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                findFirst: {
                    args: Prisma.TonerOfferFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerOfferFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                findMany: {
                    args: Prisma.TonerOfferFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>[];
                };
                create: {
                    args: Prisma.TonerOfferCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                createMany: {
                    args: Prisma.TonerOfferCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerOfferCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>[];
                };
                delete: {
                    args: Prisma.TonerOfferDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                update: {
                    args: Prisma.TonerOfferUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerOfferDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerOfferUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerOfferUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>[];
                };
                upsert: {
                    args: Prisma.TonerOfferUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferPayload>;
                };
                aggregate: {
                    args: Prisma.TonerOfferAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerOffer>;
                };
                groupBy: {
                    args: Prisma.TonerOfferGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOfferGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerOfferCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOfferCountAggregateOutputType> | number;
                };
            };
        };
        TonerOfferModel: {
            payload: Prisma.$TonerOfferModelPayload<ExtArgs>;
            fields: Prisma.TonerOfferModelFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerOfferModelFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerOfferModelFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                findFirst: {
                    args: Prisma.TonerOfferModelFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerOfferModelFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                findMany: {
                    args: Prisma.TonerOfferModelFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>[];
                };
                create: {
                    args: Prisma.TonerOfferModelCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                createMany: {
                    args: Prisma.TonerOfferModelCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerOfferModelCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>[];
                };
                delete: {
                    args: Prisma.TonerOfferModelDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                update: {
                    args: Prisma.TonerOfferModelUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerOfferModelDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerOfferModelUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerOfferModelUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>[];
                };
                upsert: {
                    args: Prisma.TonerOfferModelUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOfferModelPayload>;
                };
                aggregate: {
                    args: Prisma.TonerOfferModelAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerOfferModel>;
                };
                groupBy: {
                    args: Prisma.TonerOfferModelGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOfferModelGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerOfferModelCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOfferModelCountAggregateOutputType> | number;
                };
            };
        };
        TonerStock: {
            payload: Prisma.$TonerStockPayload<ExtArgs>;
            fields: Prisma.TonerStockFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerStockFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerStockFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                findFirst: {
                    args: Prisma.TonerStockFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerStockFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                findMany: {
                    args: Prisma.TonerStockFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>[];
                };
                create: {
                    args: Prisma.TonerStockCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                createMany: {
                    args: Prisma.TonerStockCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerStockCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>[];
                };
                delete: {
                    args: Prisma.TonerStockDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                update: {
                    args: Prisma.TonerStockUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerStockDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerStockUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerStockUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>[];
                };
                upsert: {
                    args: Prisma.TonerStockUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerStockPayload>;
                };
                aggregate: {
                    args: Prisma.TonerStockAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerStock>;
                };
                groupBy: {
                    args: Prisma.TonerStockGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerStockGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerStockCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerStockCountAggregateOutputType> | number;
                };
            };
        };
        TonerEntry: {
            payload: Prisma.$TonerEntryPayload<ExtArgs>;
            fields: Prisma.TonerEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                findFirst: {
                    args: Prisma.TonerEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                findMany: {
                    args: Prisma.TonerEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>[];
                };
                create: {
                    args: Prisma.TonerEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                createMany: {
                    args: Prisma.TonerEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>[];
                };
                delete: {
                    args: Prisma.TonerEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                update: {
                    args: Prisma.TonerEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>[];
                };
                upsert: {
                    args: Prisma.TonerEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerEntryPayload>;
                };
                aggregate: {
                    args: Prisma.TonerEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerEntry>;
                };
                groupBy: {
                    args: Prisma.TonerEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerEntryCountAggregateOutputType> | number;
                };
            };
        };
        TonerOrder: {
            payload: Prisma.$TonerOrderPayload<ExtArgs>;
            fields: Prisma.TonerOrderFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerOrderFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerOrderFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                findFirst: {
                    args: Prisma.TonerOrderFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerOrderFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                findMany: {
                    args: Prisma.TonerOrderFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>[];
                };
                create: {
                    args: Prisma.TonerOrderCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                createMany: {
                    args: Prisma.TonerOrderCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerOrderCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>[];
                };
                delete: {
                    args: Prisma.TonerOrderDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                update: {
                    args: Prisma.TonerOrderUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                deleteMany: {
                    args: Prisma.TonerOrderDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerOrderUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerOrderUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>[];
                };
                upsert: {
                    args: Prisma.TonerOrderUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerOrderPayload>;
                };
                aggregate: {
                    args: Prisma.TonerOrderAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerOrder>;
                };
                groupBy: {
                    args: Prisma.TonerOrderGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOrderGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerOrderCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerOrderCountAggregateOutputType> | number;
                };
            };
        };
        TonerInvoice: {
            payload: Prisma.$TonerInvoicePayload<ExtArgs>;
            fields: Prisma.TonerInvoiceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerInvoiceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerInvoiceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                findFirst: {
                    args: Prisma.TonerInvoiceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerInvoiceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                findMany: {
                    args: Prisma.TonerInvoiceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>[];
                };
                create: {
                    args: Prisma.TonerInvoiceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                createMany: {
                    args: Prisma.TonerInvoiceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerInvoiceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>[];
                };
                delete: {
                    args: Prisma.TonerInvoiceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                update: {
                    args: Prisma.TonerInvoiceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                deleteMany: {
                    args: Prisma.TonerInvoiceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerInvoiceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerInvoiceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>[];
                };
                upsert: {
                    args: Prisma.TonerInvoiceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoicePayload>;
                };
                aggregate: {
                    args: Prisma.TonerInvoiceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerInvoice>;
                };
                groupBy: {
                    args: Prisma.TonerInvoiceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerInvoiceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerInvoiceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerInvoiceCountAggregateOutputType> | number;
                };
            };
        };
        TonerInvoiceLine: {
            payload: Prisma.$TonerInvoiceLinePayload<ExtArgs>;
            fields: Prisma.TonerInvoiceLineFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TonerInvoiceLineFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TonerInvoiceLineFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                findFirst: {
                    args: Prisma.TonerInvoiceLineFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TonerInvoiceLineFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                findMany: {
                    args: Prisma.TonerInvoiceLineFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>[];
                };
                create: {
                    args: Prisma.TonerInvoiceLineCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                createMany: {
                    args: Prisma.TonerInvoiceLineCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TonerInvoiceLineCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>[];
                };
                delete: {
                    args: Prisma.TonerInvoiceLineDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                update: {
                    args: Prisma.TonerInvoiceLineUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                deleteMany: {
                    args: Prisma.TonerInvoiceLineDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TonerInvoiceLineUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TonerInvoiceLineUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>[];
                };
                upsert: {
                    args: Prisma.TonerInvoiceLineUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TonerInvoiceLinePayload>;
                };
                aggregate: {
                    args: Prisma.TonerInvoiceLineAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTonerInvoiceLine>;
                };
                groupBy: {
                    args: Prisma.TonerInvoiceLineGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerInvoiceLineGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TonerInvoiceLineCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TonerInvoiceLineCountAggregateOutputType> | number;
                };
            };
        };
        Printer: {
            payload: Prisma.$PrinterPayload<ExtArgs>;
            fields: Prisma.PrinterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PrinterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PrinterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                findFirst: {
                    args: Prisma.PrinterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PrinterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                findMany: {
                    args: Prisma.PrinterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>[];
                };
                create: {
                    args: Prisma.PrinterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                createMany: {
                    args: Prisma.PrinterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PrinterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>[];
                };
                delete: {
                    args: Prisma.PrinterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                update: {
                    args: Prisma.PrinterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                deleteMany: {
                    args: Prisma.PrinterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PrinterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PrinterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>[];
                };
                upsert: {
                    args: Prisma.PrinterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterPayload>;
                };
                aggregate: {
                    args: Prisma.PrinterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePrinter>;
                };
                groupBy: {
                    args: Prisma.PrinterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PrinterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterCountAggregateOutputType> | number;
                };
            };
        };
        PrinterAlert: {
            payload: Prisma.$PrinterAlertPayload<ExtArgs>;
            fields: Prisma.PrinterAlertFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PrinterAlertFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PrinterAlertFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                findFirst: {
                    args: Prisma.PrinterAlertFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PrinterAlertFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                findMany: {
                    args: Prisma.PrinterAlertFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>[];
                };
                create: {
                    args: Prisma.PrinterAlertCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                createMany: {
                    args: Prisma.PrinterAlertCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PrinterAlertCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>[];
                };
                delete: {
                    args: Prisma.PrinterAlertDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                update: {
                    args: Prisma.PrinterAlertUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                deleteMany: {
                    args: Prisma.PrinterAlertDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PrinterAlertUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PrinterAlertUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>[];
                };
                upsert: {
                    args: Prisma.PrinterAlertUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAlertPayload>;
                };
                aggregate: {
                    args: Prisma.PrinterAlertAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePrinterAlert>;
                };
                groupBy: {
                    args: Prisma.PrinterAlertGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterAlertGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PrinterAlertCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterAlertCountAggregateOutputType> | number;
                };
            };
        };
        PrinterAsset: {
            payload: Prisma.$PrinterAssetPayload<ExtArgs>;
            fields: Prisma.PrinterAssetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PrinterAssetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PrinterAssetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                findFirst: {
                    args: Prisma.PrinterAssetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PrinterAssetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                findMany: {
                    args: Prisma.PrinterAssetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>[];
                };
                create: {
                    args: Prisma.PrinterAssetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                createMany: {
                    args: Prisma.PrinterAssetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PrinterAssetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>[];
                };
                delete: {
                    args: Prisma.PrinterAssetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                update: {
                    args: Prisma.PrinterAssetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                deleteMany: {
                    args: Prisma.PrinterAssetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PrinterAssetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PrinterAssetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>[];
                };
                upsert: {
                    args: Prisma.PrinterAssetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PrinterAssetPayload>;
                };
                aggregate: {
                    args: Prisma.PrinterAssetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePrinterAsset>;
                };
                groupBy: {
                    args: Prisma.PrinterAssetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterAssetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PrinterAssetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PrinterAssetCountAggregateOutputType> | number;
                };
            };
        };
        Company: {
            payload: Prisma.$CompanyPayload<ExtArgs>;
            fields: Prisma.CompanyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CompanyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                findFirst: {
                    args: Prisma.CompanyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                findMany: {
                    args: Prisma.CompanyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                create: {
                    args: Prisma.CompanyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                createMany: {
                    args: Prisma.CompanyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                delete: {
                    args: Prisma.CompanyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                update: {
                    args: Prisma.CompanyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                deleteMany: {
                    args: Prisma.CompanyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CompanyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CompanyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>[];
                };
                upsert: {
                    args: Prisma.CompanyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CompanyPayload>;
                };
                aggregate: {
                    args: Prisma.CompanyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCompany>;
                };
                groupBy: {
                    args: Prisma.CompanyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CompanyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CompanyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CompanyCountAggregateOutputType> | number;
                };
            };
        };
        MaintVendor: {
            payload: Prisma.$MaintVendorPayload<ExtArgs>;
            fields: Prisma.MaintVendorFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MaintVendorFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MaintVendorFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                findFirst: {
                    args: Prisma.MaintVendorFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MaintVendorFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                findMany: {
                    args: Prisma.MaintVendorFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>[];
                };
                create: {
                    args: Prisma.MaintVendorCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                createMany: {
                    args: Prisma.MaintVendorCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MaintVendorCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>[];
                };
                delete: {
                    args: Prisma.MaintVendorDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                update: {
                    args: Prisma.MaintVendorUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                deleteMany: {
                    args: Prisma.MaintVendorDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MaintVendorUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MaintVendorUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>[];
                };
                upsert: {
                    args: Prisma.MaintVendorUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MaintVendorPayload>;
                };
                aggregate: {
                    args: Prisma.MaintVendorAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMaintVendor>;
                };
                groupBy: {
                    args: Prisma.MaintVendorGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MaintVendorGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MaintVendorCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MaintVendorCountAggregateOutputType> | number;
                };
            };
        };
        PageCountDaily: {
            payload: Prisma.$PageCountDailyPayload<ExtArgs>;
            fields: Prisma.PageCountDailyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PageCountDailyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PageCountDailyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                findFirst: {
                    args: Prisma.PageCountDailyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PageCountDailyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                findMany: {
                    args: Prisma.PageCountDailyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>[];
                };
                create: {
                    args: Prisma.PageCountDailyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                createMany: {
                    args: Prisma.PageCountDailyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PageCountDailyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>[];
                };
                delete: {
                    args: Prisma.PageCountDailyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                update: {
                    args: Prisma.PageCountDailyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                deleteMany: {
                    args: Prisma.PageCountDailyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PageCountDailyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PageCountDailyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>[];
                };
                upsert: {
                    args: Prisma.PageCountDailyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PageCountDailyPayload>;
                };
                aggregate: {
                    args: Prisma.PageCountDailyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePageCountDaily>;
                };
                groupBy: {
                    args: Prisma.PageCountDailyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PageCountDailyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PageCountDailyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PageCountDailyCountAggregateOutputType> | number;
                };
            };
        };
        SupplyReading: {
            payload: Prisma.$SupplyReadingPayload<ExtArgs>;
            fields: Prisma.SupplyReadingFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SupplyReadingFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SupplyReadingFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                findFirst: {
                    args: Prisma.SupplyReadingFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SupplyReadingFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                findMany: {
                    args: Prisma.SupplyReadingFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>[];
                };
                create: {
                    args: Prisma.SupplyReadingCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                createMany: {
                    args: Prisma.SupplyReadingCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SupplyReadingCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>[];
                };
                delete: {
                    args: Prisma.SupplyReadingDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                update: {
                    args: Prisma.SupplyReadingUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                deleteMany: {
                    args: Prisma.SupplyReadingDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SupplyReadingUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SupplyReadingUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>[];
                };
                upsert: {
                    args: Prisma.SupplyReadingUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplyReadingPayload>;
                };
                aggregate: {
                    args: Prisma.SupplyReadingAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSupplyReading>;
                };
                groupBy: {
                    args: Prisma.SupplyReadingGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SupplyReadingGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SupplyReadingCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SupplyReadingCountAggregateOutputType> | number;
                };
            };
        };
        RepairRecord: {
            payload: Prisma.$RepairRecordPayload<ExtArgs>;
            fields: Prisma.RepairRecordFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RepairRecordFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RepairRecordFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                findFirst: {
                    args: Prisma.RepairRecordFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RepairRecordFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                findMany: {
                    args: Prisma.RepairRecordFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>[];
                };
                create: {
                    args: Prisma.RepairRecordCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                createMany: {
                    args: Prisma.RepairRecordCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RepairRecordCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>[];
                };
                delete: {
                    args: Prisma.RepairRecordDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                update: {
                    args: Prisma.RepairRecordUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                deleteMany: {
                    args: Prisma.RepairRecordDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RepairRecordUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RepairRecordUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>[];
                };
                upsert: {
                    args: Prisma.RepairRecordUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RepairRecordPayload>;
                };
                aggregate: {
                    args: Prisma.RepairRecordAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRepairRecord>;
                };
                groupBy: {
                    args: Prisma.RepairRecordGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RepairRecordGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RepairRecordCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RepairRecordCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
    readonly color: "color";
    readonly part: "part";
    readonly recycled: "recycled";
    readonly alertThreshold: "alertThreshold";
    readonly disabledAt: "disabledAt";
    readonly yieldPages: "yieldPages";
    readonly hidden: "hidden";
    readonly genuineId: "genuineId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerScalarFieldEnum = (typeof TonerScalarFieldEnum)[keyof typeof TonerScalarFieldEnum];
export declare const TonerPrinterScalarFieldEnum: {
    readonly tonerId: "tonerId";
    readonly printerAssetId: "printerAssetId";
    readonly createdAt: "createdAt";
};
export type TonerPrinterScalarFieldEnum = (typeof TonerPrinterScalarFieldEnum)[keyof typeof TonerPrinterScalarFieldEnum];
export declare const TonerPriceScalarFieldEnum: {
    readonly id: "id";
    readonly tonerId: "tonerId";
    readonly price: "price";
    readonly effectiveFrom: "effectiveFrom";
    readonly note: "note";
    readonly createdAt: "createdAt";
};
export type TonerPriceScalarFieldEnum = (typeof TonerPriceScalarFieldEnum)[keyof typeof TonerPriceScalarFieldEnum];
export declare const TonerOfferScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly brand: "brand";
    readonly kind: "kind";
    readonly part: "part";
    readonly color: "color";
    readonly yieldPages: "yieldPages";
    readonly packQuantity: "packQuantity";
    readonly seller: "seller";
    readonly purchaseType: "purchaseType";
    readonly price: "price";
    readonly pagePrice: "pagePrice";
    readonly monthlyFee: "monthlyFee";
    readonly shippingFee: "shippingFee";
    readonly minOrder: "minOrder";
    readonly leadTime: "leadTime";
    readonly warranty: "warranty";
    readonly takesBack: "takesBack";
    readonly payment: "payment";
    readonly quotedOn: "quotedOn";
    readonly validUntil: "validUntil";
    readonly reference: "reference";
    readonly url: "url";
    readonly contact: "contact";
    readonly note: "note";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerOfferScalarFieldEnum = (typeof TonerOfferScalarFieldEnum)[keyof typeof TonerOfferScalarFieldEnum];
export declare const TonerOfferModelScalarFieldEnum: {
    readonly id: "id";
    readonly offerId: "offerId";
    readonly maker: "maker";
    readonly model: "model";
};
export type TonerOfferModelScalarFieldEnum = (typeof TonerOfferModelScalarFieldEnum)[keyof typeof TonerOfferModelScalarFieldEnum];
export declare const TonerStockScalarFieldEnum: {
    readonly tonerId: "tonerId";
    readonly companyId: "companyId";
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
    readonly companyId: "companyId";
    readonly quantity: "quantity";
    readonly balance: "balance";
    readonly receivedOn: "receivedOn";
    readonly createdAt: "createdAt";
};
export type TonerEntryScalarFieldEnum = (typeof TonerEntryScalarFieldEnum)[keyof typeof TonerEntryScalarFieldEnum];
export declare const TonerOrderScalarFieldEnum: {
    readonly id: "id";
    readonly tonerId: "tonerId";
    readonly companyId: "companyId";
    readonly userId: "userId";
    readonly quantity: "quantity";
    readonly orderedAt: "orderedAt";
    readonly deliveryOn: "deliveryOn";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerOrderScalarFieldEnum = (typeof TonerOrderScalarFieldEnum)[keyof typeof TonerOrderScalarFieldEnum];
export declare const TonerInvoiceScalarFieldEnum: {
    readonly id: "id";
    readonly issuedOn: "issuedOn";
    readonly periodFrom: "periodFrom";
    readonly periodTo: "periodTo";
    readonly invoiceNo: "invoiceNo";
    readonly note: "note";
    readonly checkedAt: "checkedAt";
    readonly checkedBy: "checkedBy";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TonerInvoiceScalarFieldEnum = (typeof TonerInvoiceScalarFieldEnum)[keyof typeof TonerInvoiceScalarFieldEnum];
export declare const TonerInvoiceLineScalarFieldEnum: {
    readonly id: "id";
    readonly invoiceId: "invoiceId";
    readonly tonerId: "tonerId";
    readonly quantity: "quantity";
    readonly unitPrice: "unitPrice";
};
export type TonerInvoiceLineScalarFieldEnum = (typeof TonerInvoiceLineScalarFieldEnum)[keyof typeof TonerInvoiceLineScalarFieldEnum];
export declare const PrinterScalarFieldEnum: {
    readonly id: "id";
    readonly ipAddress: "ipAddress";
    readonly community: "community";
    readonly version: "version";
    readonly protocol: "protocol";
    readonly hostName: "hostName";
    readonly model: "model";
    readonly serialNumber: "serialNumber";
    readonly macAddress: "macAddress";
    readonly location: "location";
    readonly pageCount: "pageCount";
    readonly counterUnit: "counterUnit";
    readonly reachable: "reachable";
    readonly lastError: "lastError";
    readonly lastPolledAt: "lastPolledAt";
    readonly lastSuccessAt: "lastSuccessAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly consoleText: "consoleText";
};
export type PrinterScalarFieldEnum = (typeof PrinterScalarFieldEnum)[keyof typeof PrinterScalarFieldEnum];
export declare const PrinterAlertScalarFieldEnum: {
    readonly id: "id";
    readonly printerId: "printerId";
    readonly alertIndex: "alertIndex";
    readonly severity: "severity";
    readonly alertGroup: "alertGroup";
    readonly groupIndex: "groupIndex";
    readonly code: "code";
    readonly description: "description";
    readonly updatedAt: "updatedAt";
};
export type PrinterAlertScalarFieldEnum = (typeof PrinterAlertScalarFieldEnum)[keyof typeof PrinterAlertScalarFieldEnum];
export declare const PrinterAssetScalarFieldEnum: {
    readonly id: "id";
    readonly companyId: "companyId";
    readonly department: "department";
    readonly no: "no";
    readonly ipAddress: "ipAddress";
    readonly maker: "maker";
    readonly model: "model";
    readonly serialNumber: "serialNumber";
    readonly purchasedOn: "purchasedOn";
    readonly purchasePrice: "purchasePrice";
    readonly contractNo: "contractNo";
    readonly maintVendorId: "maintVendorId";
    readonly maintContract: "maintContract";
    readonly maintStartOn: "maintStartOn";
    readonly maintEndOn: "maintEndOn";
    readonly maintDealOn: "maintDealOn";
    readonly maintFee: "maintFee";
    readonly note: "note";
    readonly disabledAt: "disabledAt";
    readonly countLayout: "countLayout";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PrinterAssetScalarFieldEnum = (typeof PrinterAssetScalarFieldEnum)[keyof typeof PrinterAssetScalarFieldEnum];
export declare const CompanyScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly sortOrder: "sortOrder";
    readonly note: "note";
    readonly disabledAt: "disabledAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum];
export declare const MaintVendorScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly phones: "phones";
    readonly makers: "makers";
    readonly note: "note";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MaintVendorScalarFieldEnum = (typeof MaintVendorScalarFieldEnum)[keyof typeof MaintVendorScalarFieldEnum];
export declare const PageCountDailyScalarFieldEnum: {
    readonly id: "id";
    readonly printerId: "printerId";
    readonly date: "date";
    readonly total: "total";
    readonly totalMono: "totalMono";
    readonly totalColor: "totalColor";
    readonly totalPrintMono: "totalPrintMono";
    readonly totalPrintColor: "totalPrintColor";
    readonly totalCopyMono: "totalCopyMono";
    readonly totalCopyColor: "totalCopyColor";
    readonly totalScanMono: "totalScanMono";
    readonly totalScanColor: "totalScanColor";
    readonly pages: "pages";
    readonly monoPages: "monoPages";
    readonly colorPages: "colorPages";
    readonly printMonoPages: "printMonoPages";
    readonly printColorPages: "printColorPages";
    readonly copyMonoPages: "copyMonoPages";
    readonly copyColorPages: "copyColorPages";
    readonly scanMonoPages: "scanMonoPages";
    readonly scanColorPages: "scanColorPages";
    readonly spanDays: "spanDays";
    readonly capturedAt: "capturedAt";
};
export type PageCountDailyScalarFieldEnum = (typeof PageCountDailyScalarFieldEnum)[keyof typeof PageCountDailyScalarFieldEnum];
export declare const SupplyReadingScalarFieldEnum: {
    readonly id: "id";
    readonly printerId: "printerId";
    readonly supplyIndex: "supplyIndex";
    readonly name: "name";
    readonly supplyType: "supplyType";
    readonly supplyClass: "supplyClass";
    readonly colorant: "colorant";
    readonly level: "level";
    readonly maxCapacity: "maxCapacity";
    readonly percent: "percent";
    readonly updatedAt: "updatedAt";
};
export type SupplyReadingScalarFieldEnum = (typeof SupplyReadingScalarFieldEnum)[keyof typeof SupplyReadingScalarFieldEnum];
export declare const RepairRecordScalarFieldEnum: {
    readonly id: "id";
    readonly assignee: "assignee";
    readonly printerAssetId: "printerAssetId";
    readonly occurredOn: "occurredOn";
    readonly category: "category";
    readonly handledBy: "handledBy";
    readonly detail: "detail";
    readonly cost: "cost";
    readonly restoredOn: "restoredOn";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type RepairRecordScalarFieldEnum = (typeof RepairRecordScalarFieldEnum)[keyof typeof RepairRecordScalarFieldEnum];
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
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type EnumSupplyPartFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SupplyPart'>;
export type ListEnumSupplyPartFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SupplyPart[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumOfferKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OfferKind'>;
export type ListEnumOfferKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OfferKind[]'>;
export type EnumPurchaseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PurchaseType'>;
export type ListEnumPurchaseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PurchaseType[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type EnumTonerActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TonerAction'>;
export type ListEnumTonerActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TonerAction[]'>;
export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>;
export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>;
export type EnumSnmpVersionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnmpVersion'>;
export type ListEnumSnmpVersionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnmpVersion[]'>;
export type EnumPrinterProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PrinterProtocol'>;
export type ListEnumPrinterProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PrinterProtocol[]'>;
export type EnumCountLayoutFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CountLayout'>;
export type ListEnumCountLayoutFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CountLayout[]'>;
export type EnumRepairCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairCategory'>;
export type ListEnumRepairCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairCategory[]'>;
export type EnumRepairHandlerFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairHandler'>;
export type ListEnumRepairHandlerFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairHandler[]'>;
export type EnumRepairStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairStatus'>;
export type ListEnumRepairStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RepairStatus[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientBaseOptions {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
}
export interface PrismaClientOptionsWithAccelerateUrl extends PrismaClientBaseOptions {
    accelerateUrl: string;
    adapter?: never;
}
export interface PrismaClientOptionsWithAdapter extends PrismaClientBaseOptions {
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
}
export type PrismaClientOptions = PrismaClientOptionsWithAccelerateUrl | PrismaClientOptionsWithAdapter;
export type GlobalOmitConfig = {
    toner?: Prisma.TonerOmit;
    tonerPrinter?: Prisma.TonerPrinterOmit;
    tonerPrice?: Prisma.TonerPriceOmit;
    tonerOffer?: Prisma.TonerOfferOmit;
    tonerOfferModel?: Prisma.TonerOfferModelOmit;
    tonerStock?: Prisma.TonerStockOmit;
    tonerEntry?: Prisma.TonerEntryOmit;
    tonerOrder?: Prisma.TonerOrderOmit;
    tonerInvoice?: Prisma.TonerInvoiceOmit;
    tonerInvoiceLine?: Prisma.TonerInvoiceLineOmit;
    printer?: Prisma.PrinterOmit;
    printerAlert?: Prisma.PrinterAlertOmit;
    printerAsset?: Prisma.PrinterAssetOmit;
    company?: Prisma.CompanyOmit;
    maintVendor?: Prisma.MaintVendorOmit;
    pageCountDaily?: Prisma.PageCountDailyOmit;
    supplyReading?: Prisma.SupplyReadingOmit;
    repairRecord?: Prisma.RepairRecordOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
