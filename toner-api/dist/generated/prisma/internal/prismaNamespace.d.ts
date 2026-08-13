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
    readonly TonerStock: "TonerStock";
    readonly TonerEntry: "TonerEntry";
    readonly TonerOrder: "TonerOrder";
    readonly Printer: "Printer";
    readonly PageCountDaily: "PageCountDaily";
    readonly SupplyReading: "SupplyReading";
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
        modelProps: "toner" | "tonerStock" | "tonerEntry" | "tonerOrder" | "printer" | "pageCountDaily" | "supplyReading";
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
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type EnumTonerActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TonerAction'>;
export type ListEnumTonerActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TonerAction[]'>;
export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>;
export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>;
export type EnumSnmpVersionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnmpVersion'>;
export type ListEnumSnmpVersionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SnmpVersion[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
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
    tonerStock?: Prisma.TonerStockOmit;
    tonerEntry?: Prisma.TonerEntryOmit;
    tonerOrder?: Prisma.TonerOrderOmit;
    printer?: Prisma.PrinterOmit;
    pageCountDaily?: Prisma.PageCountDailyOmit;
    supplyReading?: Prisma.SupplyReadingOmit;
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
