import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerPriceModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerPricePayload>;
export type AggregateTonerPrice = {
    _count: TonerPriceCountAggregateOutputType | null;
    _avg: TonerPriceAvgAggregateOutputType | null;
    _sum: TonerPriceSumAggregateOutputType | null;
    _min: TonerPriceMinAggregateOutputType | null;
    _max: TonerPriceMaxAggregateOutputType | null;
};
export type TonerPriceAvgAggregateOutputType = {
    id: number | null;
    price: number | null;
};
export type TonerPriceSumAggregateOutputType = {
    id: number | null;
    price: number | null;
};
export type TonerPriceMinAggregateOutputType = {
    id: number | null;
    tonerId: string | null;
    price: number | null;
    effectiveFrom: Date | null;
    note: string | null;
    createdAt: Date | null;
};
export type TonerPriceMaxAggregateOutputType = {
    id: number | null;
    tonerId: string | null;
    price: number | null;
    effectiveFrom: Date | null;
    note: string | null;
    createdAt: Date | null;
};
export type TonerPriceCountAggregateOutputType = {
    id: number;
    tonerId: number;
    price: number;
    effectiveFrom: number;
    note: number;
    createdAt: number;
    _all: number;
};
export type TonerPriceAvgAggregateInputType = {
    id?: true;
    price?: true;
};
export type TonerPriceSumAggregateInputType = {
    id?: true;
    price?: true;
};
export type TonerPriceMinAggregateInputType = {
    id?: true;
    tonerId?: true;
    price?: true;
    effectiveFrom?: true;
    note?: true;
    createdAt?: true;
};
export type TonerPriceMaxAggregateInputType = {
    id?: true;
    tonerId?: true;
    price?: true;
    effectiveFrom?: true;
    note?: true;
    createdAt?: true;
};
export type TonerPriceCountAggregateInputType = {
    id?: true;
    tonerId?: true;
    price?: true;
    effectiveFrom?: true;
    note?: true;
    createdAt?: true;
    _all?: true;
};
export type TonerPriceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPriceWhereInput;
    orderBy?: Prisma.TonerPriceOrderByWithRelationInput | Prisma.TonerPriceOrderByWithRelationInput[];
    cursor?: Prisma.TonerPriceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerPriceCountAggregateInputType;
    _avg?: TonerPriceAvgAggregateInputType;
    _sum?: TonerPriceSumAggregateInputType;
    _min?: TonerPriceMinAggregateInputType;
    _max?: TonerPriceMaxAggregateInputType;
};
export type GetTonerPriceAggregateType<T extends TonerPriceAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerPrice]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerPrice[P]> : Prisma.GetScalarType<T[P], AggregateTonerPrice[P]>;
};
export type TonerPriceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPriceWhereInput;
    orderBy?: Prisma.TonerPriceOrderByWithAggregationInput | Prisma.TonerPriceOrderByWithAggregationInput[];
    by: Prisma.TonerPriceScalarFieldEnum[] | Prisma.TonerPriceScalarFieldEnum;
    having?: Prisma.TonerPriceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerPriceCountAggregateInputType | true;
    _avg?: TonerPriceAvgAggregateInputType;
    _sum?: TonerPriceSumAggregateInputType;
    _min?: TonerPriceMinAggregateInputType;
    _max?: TonerPriceMaxAggregateInputType;
};
export type TonerPriceGroupByOutputType = {
    id: number;
    tonerId: string;
    price: number;
    effectiveFrom: Date;
    note: string | null;
    createdAt: Date;
    _count: TonerPriceCountAggregateOutputType | null;
    _avg: TonerPriceAvgAggregateOutputType | null;
    _sum: TonerPriceSumAggregateOutputType | null;
    _min: TonerPriceMinAggregateOutputType | null;
    _max: TonerPriceMaxAggregateOutputType | null;
};
export type GetTonerPriceGroupByPayload<T extends TonerPriceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerPriceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerPriceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerPriceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerPriceGroupByOutputType[P]>;
}>>;
export type TonerPriceWhereInput = {
    AND?: Prisma.TonerPriceWhereInput | Prisma.TonerPriceWhereInput[];
    OR?: Prisma.TonerPriceWhereInput[];
    NOT?: Prisma.TonerPriceWhereInput | Prisma.TonerPriceWhereInput[];
    id?: Prisma.IntFilter<"TonerPrice"> | number;
    tonerId?: Prisma.StringFilter<"TonerPrice"> | string;
    price?: Prisma.IntFilter<"TonerPrice"> | number;
    effectiveFrom?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
    note?: Prisma.StringNullableFilter<"TonerPrice"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
};
export type TonerPriceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    effectiveFrom?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    toner?: Prisma.TonerOrderByWithRelationInput;
};
export type TonerPriceWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    tonerId_effectiveFrom?: Prisma.TonerPriceTonerIdEffectiveFromCompoundUniqueInput;
    AND?: Prisma.TonerPriceWhereInput | Prisma.TonerPriceWhereInput[];
    OR?: Prisma.TonerPriceWhereInput[];
    NOT?: Prisma.TonerPriceWhereInput | Prisma.TonerPriceWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerPrice"> | string;
    price?: Prisma.IntFilter<"TonerPrice"> | number;
    effectiveFrom?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
    note?: Prisma.StringNullableFilter<"TonerPrice"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
}, "id" | "tonerId_effectiveFrom">;
export type TonerPriceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    effectiveFrom?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.TonerPriceCountOrderByAggregateInput;
    _avg?: Prisma.TonerPriceAvgOrderByAggregateInput;
    _max?: Prisma.TonerPriceMaxOrderByAggregateInput;
    _min?: Prisma.TonerPriceMinOrderByAggregateInput;
    _sum?: Prisma.TonerPriceSumOrderByAggregateInput;
};
export type TonerPriceScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerPriceScalarWhereWithAggregatesInput | Prisma.TonerPriceScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerPriceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerPriceScalarWhereWithAggregatesInput | Prisma.TonerPriceScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerPrice"> | number;
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerPrice"> | string;
    price?: Prisma.IntWithAggregatesFilter<"TonerPrice"> | number;
    effectiveFrom?: Prisma.DateTimeWithAggregatesFilter<"TonerPrice"> | Date | string;
    note?: Prisma.StringNullableWithAggregatesFilter<"TonerPrice"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TonerPrice"> | Date | string;
};
export type TonerPriceCreateInput = {
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutPricesInput;
};
export type TonerPriceUncheckedCreateInput = {
    id?: number;
    tonerId: string;
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
};
export type TonerPriceUpdateInput = {
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutPricesNestedInput;
};
export type TonerPriceUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceCreateManyInput = {
    id?: number;
    tonerId: string;
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
};
export type TonerPriceUpdateManyMutationInput = {
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceListRelationFilter = {
    every?: Prisma.TonerPriceWhereInput;
    some?: Prisma.TonerPriceWhereInput;
    none?: Prisma.TonerPriceWhereInput;
};
export type TonerPriceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerPriceTonerIdEffectiveFromCompoundUniqueInput = {
    tonerId: string;
    effectiveFrom: Date | string;
};
export type TonerPriceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    effectiveFrom?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPriceAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
};
export type TonerPriceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    effectiveFrom?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPriceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    effectiveFrom?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPriceSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
};
export type TonerPriceCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput> | Prisma.TonerPriceCreateWithoutTonerInput[] | Prisma.TonerPriceUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPriceCreateOrConnectWithoutTonerInput | Prisma.TonerPriceCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerPriceCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
};
export type TonerPriceUncheckedCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput> | Prisma.TonerPriceCreateWithoutTonerInput[] | Prisma.TonerPriceUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPriceCreateOrConnectWithoutTonerInput | Prisma.TonerPriceCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerPriceCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
};
export type TonerPriceUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput> | Prisma.TonerPriceCreateWithoutTonerInput[] | Prisma.TonerPriceUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPriceCreateOrConnectWithoutTonerInput | Prisma.TonerPriceCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerPriceUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerPriceUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerPriceCreateManyTonerInputEnvelope;
    set?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    disconnect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    delete?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    connect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    update?: Prisma.TonerPriceUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerPriceUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerPriceUpdateManyWithWhereWithoutTonerInput | Prisma.TonerPriceUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerPriceScalarWhereInput | Prisma.TonerPriceScalarWhereInput[];
};
export type TonerPriceUncheckedUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput> | Prisma.TonerPriceCreateWithoutTonerInput[] | Prisma.TonerPriceUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPriceCreateOrConnectWithoutTonerInput | Prisma.TonerPriceCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerPriceUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerPriceUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerPriceCreateManyTonerInputEnvelope;
    set?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    disconnect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    delete?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    connect?: Prisma.TonerPriceWhereUniqueInput | Prisma.TonerPriceWhereUniqueInput[];
    update?: Prisma.TonerPriceUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerPriceUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerPriceUpdateManyWithWhereWithoutTonerInput | Prisma.TonerPriceUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerPriceScalarWhereInput | Prisma.TonerPriceScalarWhereInput[];
};
export type TonerPriceCreateWithoutTonerInput = {
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
};
export type TonerPriceUncheckedCreateWithoutTonerInput = {
    id?: number;
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
};
export type TonerPriceCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerPriceWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput>;
};
export type TonerPriceCreateManyTonerInputEnvelope = {
    data: Prisma.TonerPriceCreateManyTonerInput | Prisma.TonerPriceCreateManyTonerInput[];
    skipDuplicates?: boolean;
};
export type TonerPriceUpsertWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerPriceWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerPriceUpdateWithoutTonerInput, Prisma.TonerPriceUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerPriceCreateWithoutTonerInput, Prisma.TonerPriceUncheckedCreateWithoutTonerInput>;
};
export type TonerPriceUpdateWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerPriceWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerPriceUpdateWithoutTonerInput, Prisma.TonerPriceUncheckedUpdateWithoutTonerInput>;
};
export type TonerPriceUpdateManyWithWhereWithoutTonerInput = {
    where: Prisma.TonerPriceScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerPriceUpdateManyMutationInput, Prisma.TonerPriceUncheckedUpdateManyWithoutTonerInput>;
};
export type TonerPriceScalarWhereInput = {
    AND?: Prisma.TonerPriceScalarWhereInput | Prisma.TonerPriceScalarWhereInput[];
    OR?: Prisma.TonerPriceScalarWhereInput[];
    NOT?: Prisma.TonerPriceScalarWhereInput | Prisma.TonerPriceScalarWhereInput[];
    id?: Prisma.IntFilter<"TonerPrice"> | number;
    tonerId?: Prisma.StringFilter<"TonerPrice"> | string;
    price?: Prisma.IntFilter<"TonerPrice"> | number;
    effectiveFrom?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
    note?: Prisma.StringNullableFilter<"TonerPrice"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerPrice"> | Date | string;
};
export type TonerPriceCreateManyTonerInput = {
    id?: number;
    price: number;
    effectiveFrom: Date | string;
    note?: string | null;
    createdAt?: Date | string;
};
export type TonerPriceUpdateWithoutTonerInput = {
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceUncheckedUpdateWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceUncheckedUpdateManyWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    price?: Prisma.IntFieldUpdateOperationsInput | number;
    effectiveFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPriceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    price?: boolean;
    effectiveFrom?: boolean;
    note?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrice"]>;
export type TonerPriceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    price?: boolean;
    effectiveFrom?: boolean;
    note?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrice"]>;
export type TonerPriceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    price?: boolean;
    effectiveFrom?: boolean;
    note?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrice"]>;
export type TonerPriceSelectScalar = {
    id?: boolean;
    tonerId?: boolean;
    price?: boolean;
    effectiveFrom?: boolean;
    note?: boolean;
    createdAt?: boolean;
};
export type TonerPriceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tonerId" | "price" | "effectiveFrom" | "note" | "createdAt", ExtArgs["result"]["tonerPrice"]>;
export type TonerPriceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerPriceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerPriceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type $TonerPricePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerPrice";
    objects: {
        toner: Prisma.$TonerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        tonerId: string;
        price: number;
        effectiveFrom: Date;
        note: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["tonerPrice"]>;
    composites: {};
};
export type TonerPriceGetPayload<S extends boolean | null | undefined | TonerPriceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerPricePayload, S>;
export type TonerPriceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerPriceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerPriceCountAggregateInputType | true;
};
export interface TonerPriceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerPrice'];
        meta: {
            name: 'TonerPrice';
        };
    };
    findUnique<T extends TonerPriceFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerPriceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerPriceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerPriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerPriceFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerPriceFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerPriceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerPriceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerPriceFindManyArgs>(args?: Prisma.SelectSubset<T, TonerPriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerPriceCreateArgs>(args: Prisma.SelectSubset<T, TonerPriceCreateArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerPriceCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerPriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerPriceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerPriceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerPriceDeleteArgs>(args: Prisma.SelectSubset<T, TonerPriceDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerPriceUpdateArgs>(args: Prisma.SelectSubset<T, TonerPriceUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerPriceDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerPriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerPriceUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerPriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerPriceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerPriceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerPriceUpsertArgs>(args: Prisma.SelectSubset<T, TonerPriceUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerPriceClient<runtime.Types.Result.GetResult<Prisma.$TonerPricePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerPriceCountArgs>(args?: Prisma.Subset<T, TonerPriceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerPriceCountAggregateOutputType> : number>;
    aggregate<T extends TonerPriceAggregateArgs>(args: Prisma.Subset<T, TonerPriceAggregateArgs>): Prisma.PrismaPromise<GetTonerPriceAggregateType<T>>;
    groupBy<T extends TonerPriceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerPriceGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerPriceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerPriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerPriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerPriceFieldRefs;
}
export interface Prisma__TonerPriceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerPriceFieldRefs {
    readonly id: Prisma.FieldRef<"TonerPrice", 'Int'>;
    readonly tonerId: Prisma.FieldRef<"TonerPrice", 'String'>;
    readonly price: Prisma.FieldRef<"TonerPrice", 'Int'>;
    readonly effectiveFrom: Prisma.FieldRef<"TonerPrice", 'DateTime'>;
    readonly note: Prisma.FieldRef<"TonerPrice", 'String'>;
    readonly createdAt: Prisma.FieldRef<"TonerPrice", 'DateTime'>;
}
export type TonerPriceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where: Prisma.TonerPriceWhereUniqueInput;
};
export type TonerPriceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where: Prisma.TonerPriceWhereUniqueInput;
};
export type TonerPriceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where?: Prisma.TonerPriceWhereInput;
    orderBy?: Prisma.TonerPriceOrderByWithRelationInput | Prisma.TonerPriceOrderByWithRelationInput[];
    cursor?: Prisma.TonerPriceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPriceScalarFieldEnum | Prisma.TonerPriceScalarFieldEnum[];
};
export type TonerPriceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where?: Prisma.TonerPriceWhereInput;
    orderBy?: Prisma.TonerPriceOrderByWithRelationInput | Prisma.TonerPriceOrderByWithRelationInput[];
    cursor?: Prisma.TonerPriceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPriceScalarFieldEnum | Prisma.TonerPriceScalarFieldEnum[];
};
export type TonerPriceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where?: Prisma.TonerPriceWhereInput;
    orderBy?: Prisma.TonerPriceOrderByWithRelationInput | Prisma.TonerPriceOrderByWithRelationInput[];
    cursor?: Prisma.TonerPriceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPriceScalarFieldEnum | Prisma.TonerPriceScalarFieldEnum[];
};
export type TonerPriceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPriceCreateInput, Prisma.TonerPriceUncheckedCreateInput>;
};
export type TonerPriceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerPriceCreateManyInput | Prisma.TonerPriceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerPriceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    data: Prisma.TonerPriceCreateManyInput | Prisma.TonerPriceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerPriceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerPriceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPriceUpdateInput, Prisma.TonerPriceUncheckedUpdateInput>;
    where: Prisma.TonerPriceWhereUniqueInput;
};
export type TonerPriceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerPriceUpdateManyMutationInput, Prisma.TonerPriceUncheckedUpdateManyInput>;
    where?: Prisma.TonerPriceWhereInput;
    limit?: number;
};
export type TonerPriceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPriceUpdateManyMutationInput, Prisma.TonerPriceUncheckedUpdateManyInput>;
    where?: Prisma.TonerPriceWhereInput;
    limit?: number;
    include?: Prisma.TonerPriceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerPriceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where: Prisma.TonerPriceWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerPriceCreateInput, Prisma.TonerPriceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerPriceUpdateInput, Prisma.TonerPriceUncheckedUpdateInput>;
};
export type TonerPriceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
    where: Prisma.TonerPriceWhereUniqueInput;
};
export type TonerPriceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPriceWhereInput;
    limit?: number;
};
export type TonerPriceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPriceSelect<ExtArgs> | null;
    omit?: Prisma.TonerPriceOmit<ExtArgs> | null;
    include?: Prisma.TonerPriceInclude<ExtArgs> | null;
};
