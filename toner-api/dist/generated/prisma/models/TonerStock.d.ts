import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerStockModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerStockPayload>;
export type AggregateTonerStock = {
    _count: TonerStockCountAggregateOutputType | null;
    _avg: TonerStockAvgAggregateOutputType | null;
    _sum: TonerStockSumAggregateOutputType | null;
    _min: TonerStockMinAggregateOutputType | null;
    _max: TonerStockMaxAggregateOutputType | null;
};
export type TonerStockAvgAggregateOutputType = {
    quantity: number | null;
    received: number | null;
    disposed: number | null;
};
export type TonerStockSumAggregateOutputType = {
    quantity: number | null;
    received: number | null;
    disposed: number | null;
};
export type TonerStockMinAggregateOutputType = {
    tonerId: string | null;
    quantity: number | null;
    received: number | null;
    disposed: number | null;
    updatedAt: Date | null;
};
export type TonerStockMaxAggregateOutputType = {
    tonerId: string | null;
    quantity: number | null;
    received: number | null;
    disposed: number | null;
    updatedAt: Date | null;
};
export type TonerStockCountAggregateOutputType = {
    tonerId: number;
    quantity: number;
    received: number;
    disposed: number;
    updatedAt: number;
    _all: number;
};
export type TonerStockAvgAggregateInputType = {
    quantity?: true;
    received?: true;
    disposed?: true;
};
export type TonerStockSumAggregateInputType = {
    quantity?: true;
    received?: true;
    disposed?: true;
};
export type TonerStockMinAggregateInputType = {
    tonerId?: true;
    quantity?: true;
    received?: true;
    disposed?: true;
    updatedAt?: true;
};
export type TonerStockMaxAggregateInputType = {
    tonerId?: true;
    quantity?: true;
    received?: true;
    disposed?: true;
    updatedAt?: true;
};
export type TonerStockCountAggregateInputType = {
    tonerId?: true;
    quantity?: true;
    received?: true;
    disposed?: true;
    updatedAt?: true;
    _all?: true;
};
export type TonerStockAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithRelationInput | Prisma.TonerStockOrderByWithRelationInput[];
    cursor?: Prisma.TonerStockWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerStockCountAggregateInputType;
    _avg?: TonerStockAvgAggregateInputType;
    _sum?: TonerStockSumAggregateInputType;
    _min?: TonerStockMinAggregateInputType;
    _max?: TonerStockMaxAggregateInputType;
};
export type GetTonerStockAggregateType<T extends TonerStockAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerStock]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerStock[P]> : Prisma.GetScalarType<T[P], AggregateTonerStock[P]>;
};
export type TonerStockGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithAggregationInput | Prisma.TonerStockOrderByWithAggregationInput[];
    by: Prisma.TonerStockScalarFieldEnum[] | Prisma.TonerStockScalarFieldEnum;
    having?: Prisma.TonerStockScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerStockCountAggregateInputType | true;
    _avg?: TonerStockAvgAggregateInputType;
    _sum?: TonerStockSumAggregateInputType;
    _min?: TonerStockMinAggregateInputType;
    _max?: TonerStockMaxAggregateInputType;
};
export type TonerStockGroupByOutputType = {
    tonerId: string;
    quantity: number;
    received: number;
    disposed: number;
    updatedAt: Date;
    _count: TonerStockCountAggregateOutputType | null;
    _avg: TonerStockAvgAggregateOutputType | null;
    _sum: TonerStockSumAggregateOutputType | null;
    _min: TonerStockMinAggregateOutputType | null;
    _max: TonerStockMaxAggregateOutputType | null;
};
export type GetTonerStockGroupByPayload<T extends TonerStockGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerStockGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerStockGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerStockGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerStockGroupByOutputType[P]>;
}>>;
export type TonerStockWhereInput = {
    AND?: Prisma.TonerStockWhereInput | Prisma.TonerStockWhereInput[];
    OR?: Prisma.TonerStockWhereInput[];
    NOT?: Prisma.TonerStockWhereInput | Prisma.TonerStockWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerStock"> | string;
    quantity?: Prisma.IntFilter<"TonerStock"> | number;
    received?: Prisma.IntFilter<"TonerStock"> | number;
    disposed?: Prisma.IntFilter<"TonerStock"> | number;
    updatedAt?: Prisma.DateTimeFilter<"TonerStock"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
};
export type TonerStockOrderByWithRelationInput = {
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    toner?: Prisma.TonerOrderByWithRelationInput;
};
export type TonerStockWhereUniqueInput = Prisma.AtLeast<{
    tonerId?: string;
    AND?: Prisma.TonerStockWhereInput | Prisma.TonerStockWhereInput[];
    OR?: Prisma.TonerStockWhereInput[];
    NOT?: Prisma.TonerStockWhereInput | Prisma.TonerStockWhereInput[];
    quantity?: Prisma.IntFilter<"TonerStock"> | number;
    received?: Prisma.IntFilter<"TonerStock"> | number;
    disposed?: Prisma.IntFilter<"TonerStock"> | number;
    updatedAt?: Prisma.DateTimeFilter<"TonerStock"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
}, "tonerId">;
export type TonerStockOrderByWithAggregationInput = {
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TonerStockCountOrderByAggregateInput;
    _avg?: Prisma.TonerStockAvgOrderByAggregateInput;
    _max?: Prisma.TonerStockMaxOrderByAggregateInput;
    _min?: Prisma.TonerStockMinOrderByAggregateInput;
    _sum?: Prisma.TonerStockSumOrderByAggregateInput;
};
export type TonerStockScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerStockScalarWhereWithAggregatesInput | Prisma.TonerStockScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerStockScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerStockScalarWhereWithAggregatesInput | Prisma.TonerStockScalarWhereWithAggregatesInput[];
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerStock"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"TonerStock"> | number;
    received?: Prisma.IntWithAggregatesFilter<"TonerStock"> | number;
    disposed?: Prisma.IntWithAggregatesFilter<"TonerStock"> | number;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"TonerStock"> | Date | string;
};
export type TonerStockCreateInput = {
    quantity?: number;
    received?: number;
    disposed?: number;
    updatedAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutStockInput;
};
export type TonerStockUncheckedCreateInput = {
    tonerId: string;
    quantity?: number;
    received?: number;
    disposed?: number;
    updatedAt?: Date | string;
};
export type TonerStockUpdateInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutStockNestedInput;
};
export type TonerStockUncheckedUpdateInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerStockCreateManyInput = {
    tonerId: string;
    quantity?: number;
    received?: number;
    disposed?: number;
    updatedAt?: Date | string;
};
export type TonerStockUpdateManyMutationInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerStockUncheckedUpdateManyInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerStockNullableScalarRelationFilter = {
    is?: Prisma.TonerStockWhereInput | null;
    isNot?: Prisma.TonerStockWhereInput | null;
};
export type TonerStockCountOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerStockAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
};
export type TonerStockMaxOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerStockMinOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerStockSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
    received?: Prisma.SortOrder;
    disposed?: Prisma.SortOrder;
};
export type TonerStockCreateNestedOneWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
    connectOrCreate?: Prisma.TonerStockCreateOrConnectWithoutTonerInput;
    connect?: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockUncheckedCreateNestedOneWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
    connectOrCreate?: Prisma.TonerStockCreateOrConnectWithoutTonerInput;
    connect?: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockUpdateOneWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
    connectOrCreate?: Prisma.TonerStockCreateOrConnectWithoutTonerInput;
    upsert?: Prisma.TonerStockUpsertWithoutTonerInput;
    disconnect?: Prisma.TonerStockWhereInput | boolean;
    delete?: Prisma.TonerStockWhereInput | boolean;
    connect?: Prisma.TonerStockWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerStockUpdateToOneWithWhereWithoutTonerInput, Prisma.TonerStockUpdateWithoutTonerInput>, Prisma.TonerStockUncheckedUpdateWithoutTonerInput>;
};
export type TonerStockUncheckedUpdateOneWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
    connectOrCreate?: Prisma.TonerStockCreateOrConnectWithoutTonerInput;
    upsert?: Prisma.TonerStockUpsertWithoutTonerInput;
    disconnect?: Prisma.TonerStockWhereInput | boolean;
    delete?: Prisma.TonerStockWhereInput | boolean;
    connect?: Prisma.TonerStockWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerStockUpdateToOneWithWhereWithoutTonerInput, Prisma.TonerStockUpdateWithoutTonerInput>, Prisma.TonerStockUncheckedUpdateWithoutTonerInput>;
};
export type TonerStockCreateWithoutTonerInput = {
    quantity?: number;
    received?: number;
    disposed?: number;
    updatedAt?: Date | string;
};
export type TonerStockUncheckedCreateWithoutTonerInput = {
    quantity?: number;
    received?: number;
    disposed?: number;
    updatedAt?: Date | string;
};
export type TonerStockCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerStockWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
};
export type TonerStockUpsertWithoutTonerInput = {
    update: Prisma.XOR<Prisma.TonerStockUpdateWithoutTonerInput, Prisma.TonerStockUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerStockCreateWithoutTonerInput, Prisma.TonerStockUncheckedCreateWithoutTonerInput>;
    where?: Prisma.TonerStockWhereInput;
};
export type TonerStockUpdateToOneWithWhereWithoutTonerInput = {
    where?: Prisma.TonerStockWhereInput;
    data: Prisma.XOR<Prisma.TonerStockUpdateWithoutTonerInput, Prisma.TonerStockUncheckedUpdateWithoutTonerInput>;
};
export type TonerStockUpdateWithoutTonerInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerStockUncheckedUpdateWithoutTonerInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    received?: Prisma.IntFieldUpdateOperationsInput | number;
    disposed?: Prisma.IntFieldUpdateOperationsInput | number;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerStockSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    quantity?: boolean;
    received?: boolean;
    disposed?: boolean;
    updatedAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerStock"]>;
export type TonerStockSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    quantity?: boolean;
    received?: boolean;
    disposed?: boolean;
    updatedAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerStock"]>;
export type TonerStockSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    quantity?: boolean;
    received?: boolean;
    disposed?: boolean;
    updatedAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerStock"]>;
export type TonerStockSelectScalar = {
    tonerId?: boolean;
    quantity?: boolean;
    received?: boolean;
    disposed?: boolean;
    updatedAt?: boolean;
};
export type TonerStockOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"tonerId" | "quantity" | "received" | "disposed" | "updatedAt", ExtArgs["result"]["tonerStock"]>;
export type TonerStockInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerStockIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerStockIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type $TonerStockPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerStock";
    objects: {
        toner: Prisma.$TonerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        tonerId: string;
        quantity: number;
        received: number;
        disposed: number;
        updatedAt: Date;
    }, ExtArgs["result"]["tonerStock"]>;
    composites: {};
};
export type TonerStockGetPayload<S extends boolean | null | undefined | TonerStockDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerStockPayload, S>;
export type TonerStockCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerStockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerStockCountAggregateInputType | true;
};
export interface TonerStockDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerStock'];
        meta: {
            name: 'TonerStock';
        };
    };
    findUnique<T extends TonerStockFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerStockFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerStockFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerStockFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerStockFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerStockFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerStockFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerStockFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerStockFindManyArgs>(args?: Prisma.SelectSubset<T, TonerStockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerStockCreateArgs>(args: Prisma.SelectSubset<T, TonerStockCreateArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerStockCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerStockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerStockCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerStockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerStockDeleteArgs>(args: Prisma.SelectSubset<T, TonerStockDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerStockUpdateArgs>(args: Prisma.SelectSubset<T, TonerStockUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerStockDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerStockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerStockUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerStockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerStockUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerStockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerStockUpsertArgs>(args: Prisma.SelectSubset<T, TonerStockUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerStockCountArgs>(args?: Prisma.Subset<T, TonerStockCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerStockCountAggregateOutputType> : number>;
    aggregate<T extends TonerStockAggregateArgs>(args: Prisma.Subset<T, TonerStockAggregateArgs>): Prisma.PrismaPromise<GetTonerStockAggregateType<T>>;
    groupBy<T extends TonerStockGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerStockGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerStockGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerStockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerStockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerStockFieldRefs;
}
export interface Prisma__TonerStockClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerStockFieldRefs {
    readonly tonerId: Prisma.FieldRef<"TonerStock", 'String'>;
    readonly quantity: Prisma.FieldRef<"TonerStock", 'Int'>;
    readonly received: Prisma.FieldRef<"TonerStock", 'Int'>;
    readonly disposed: Prisma.FieldRef<"TonerStock", 'Int'>;
    readonly updatedAt: Prisma.FieldRef<"TonerStock", 'DateTime'>;
}
export type TonerStockFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithRelationInput | Prisma.TonerStockOrderByWithRelationInput[];
    cursor?: Prisma.TonerStockWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerStockScalarFieldEnum | Prisma.TonerStockScalarFieldEnum[];
};
export type TonerStockFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithRelationInput | Prisma.TonerStockOrderByWithRelationInput[];
    cursor?: Prisma.TonerStockWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerStockScalarFieldEnum | Prisma.TonerStockScalarFieldEnum[];
};
export type TonerStockFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithRelationInput | Prisma.TonerStockOrderByWithRelationInput[];
    cursor?: Prisma.TonerStockWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerStockScalarFieldEnum | Prisma.TonerStockScalarFieldEnum[];
};
export type TonerStockCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerStockCreateInput, Prisma.TonerStockUncheckedCreateInput>;
};
export type TonerStockCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerStockCreateManyInput | Prisma.TonerStockCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerStockCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    data: Prisma.TonerStockCreateManyInput | Prisma.TonerStockCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerStockIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerStockUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerStockUpdateInput, Prisma.TonerStockUncheckedUpdateInput>;
    where: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerStockUpdateManyMutationInput, Prisma.TonerStockUncheckedUpdateManyInput>;
    where?: Prisma.TonerStockWhereInput;
    limit?: number;
};
export type TonerStockUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerStockUpdateManyMutationInput, Prisma.TonerStockUncheckedUpdateManyInput>;
    where?: Prisma.TonerStockWhereInput;
    limit?: number;
    include?: Prisma.TonerStockIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerStockUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where: Prisma.TonerStockWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerStockCreateInput, Prisma.TonerStockUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerStockUpdateInput, Prisma.TonerStockUncheckedUpdateInput>;
};
export type TonerStockDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where: Prisma.TonerStockWhereUniqueInput;
};
export type TonerStockDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerStockWhereInput;
    limit?: number;
};
export type TonerStockDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
};
