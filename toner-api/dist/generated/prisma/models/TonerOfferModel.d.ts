import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerOfferModelModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerOfferModelPayload>;
export type AggregateTonerOfferModel = {
    _count: TonerOfferModelCountAggregateOutputType | null;
    _avg: TonerOfferModelAvgAggregateOutputType | null;
    _sum: TonerOfferModelSumAggregateOutputType | null;
    _min: TonerOfferModelMinAggregateOutputType | null;
    _max: TonerOfferModelMaxAggregateOutputType | null;
};
export type TonerOfferModelAvgAggregateOutputType = {
    id: number | null;
    offerId: number | null;
};
export type TonerOfferModelSumAggregateOutputType = {
    id: number | null;
    offerId: number | null;
};
export type TonerOfferModelMinAggregateOutputType = {
    id: number | null;
    offerId: number | null;
    maker: string | null;
    model: string | null;
};
export type TonerOfferModelMaxAggregateOutputType = {
    id: number | null;
    offerId: number | null;
    maker: string | null;
    model: string | null;
};
export type TonerOfferModelCountAggregateOutputType = {
    id: number;
    offerId: number;
    maker: number;
    model: number;
    _all: number;
};
export type TonerOfferModelAvgAggregateInputType = {
    id?: true;
    offerId?: true;
};
export type TonerOfferModelSumAggregateInputType = {
    id?: true;
    offerId?: true;
};
export type TonerOfferModelMinAggregateInputType = {
    id?: true;
    offerId?: true;
    maker?: true;
    model?: true;
};
export type TonerOfferModelMaxAggregateInputType = {
    id?: true;
    offerId?: true;
    maker?: true;
    model?: true;
};
export type TonerOfferModelCountAggregateInputType = {
    id?: true;
    offerId?: true;
    maker?: true;
    model?: true;
    _all?: true;
};
export type TonerOfferModelAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOfferModelWhereInput;
    orderBy?: Prisma.TonerOfferModelOrderByWithRelationInput | Prisma.TonerOfferModelOrderByWithRelationInput[];
    cursor?: Prisma.TonerOfferModelWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerOfferModelCountAggregateInputType;
    _avg?: TonerOfferModelAvgAggregateInputType;
    _sum?: TonerOfferModelSumAggregateInputType;
    _min?: TonerOfferModelMinAggregateInputType;
    _max?: TonerOfferModelMaxAggregateInputType;
};
export type GetTonerOfferModelAggregateType<T extends TonerOfferModelAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerOfferModel]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerOfferModel[P]> : Prisma.GetScalarType<T[P], AggregateTonerOfferModel[P]>;
};
export type TonerOfferModelGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOfferModelWhereInput;
    orderBy?: Prisma.TonerOfferModelOrderByWithAggregationInput | Prisma.TonerOfferModelOrderByWithAggregationInput[];
    by: Prisma.TonerOfferModelScalarFieldEnum[] | Prisma.TonerOfferModelScalarFieldEnum;
    having?: Prisma.TonerOfferModelScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerOfferModelCountAggregateInputType | true;
    _avg?: TonerOfferModelAvgAggregateInputType;
    _sum?: TonerOfferModelSumAggregateInputType;
    _min?: TonerOfferModelMinAggregateInputType;
    _max?: TonerOfferModelMaxAggregateInputType;
};
export type TonerOfferModelGroupByOutputType = {
    id: number;
    offerId: number;
    maker: string | null;
    model: string;
    _count: TonerOfferModelCountAggregateOutputType | null;
    _avg: TonerOfferModelAvgAggregateOutputType | null;
    _sum: TonerOfferModelSumAggregateOutputType | null;
    _min: TonerOfferModelMinAggregateOutputType | null;
    _max: TonerOfferModelMaxAggregateOutputType | null;
};
export type GetTonerOfferModelGroupByPayload<T extends TonerOfferModelGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerOfferModelGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerOfferModelGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerOfferModelGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerOfferModelGroupByOutputType[P]>;
}>>;
export type TonerOfferModelWhereInput = {
    AND?: Prisma.TonerOfferModelWhereInput | Prisma.TonerOfferModelWhereInput[];
    OR?: Prisma.TonerOfferModelWhereInput[];
    NOT?: Prisma.TonerOfferModelWhereInput | Prisma.TonerOfferModelWhereInput[];
    id?: Prisma.IntFilter<"TonerOfferModel"> | number;
    offerId?: Prisma.IntFilter<"TonerOfferModel"> | number;
    maker?: Prisma.StringNullableFilter<"TonerOfferModel"> | string | null;
    model?: Prisma.StringFilter<"TonerOfferModel"> | string;
    offer?: Prisma.XOR<Prisma.TonerOfferScalarRelationFilter, Prisma.TonerOfferWhereInput>;
};
export type TonerOfferModelOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
    maker?: Prisma.SortOrderInput | Prisma.SortOrder;
    model?: Prisma.SortOrder;
    offer?: Prisma.TonerOfferOrderByWithRelationInput;
};
export type TonerOfferModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TonerOfferModelWhereInput | Prisma.TonerOfferModelWhereInput[];
    OR?: Prisma.TonerOfferModelWhereInput[];
    NOT?: Prisma.TonerOfferModelWhereInput | Prisma.TonerOfferModelWhereInput[];
    offerId?: Prisma.IntFilter<"TonerOfferModel"> | number;
    maker?: Prisma.StringNullableFilter<"TonerOfferModel"> | string | null;
    model?: Prisma.StringFilter<"TonerOfferModel"> | string;
    offer?: Prisma.XOR<Prisma.TonerOfferScalarRelationFilter, Prisma.TonerOfferWhereInput>;
}, "id">;
export type TonerOfferModelOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
    maker?: Prisma.SortOrderInput | Prisma.SortOrder;
    model?: Prisma.SortOrder;
    _count?: Prisma.TonerOfferModelCountOrderByAggregateInput;
    _avg?: Prisma.TonerOfferModelAvgOrderByAggregateInput;
    _max?: Prisma.TonerOfferModelMaxOrderByAggregateInput;
    _min?: Prisma.TonerOfferModelMinOrderByAggregateInput;
    _sum?: Prisma.TonerOfferModelSumOrderByAggregateInput;
};
export type TonerOfferModelScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerOfferModelScalarWhereWithAggregatesInput | Prisma.TonerOfferModelScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerOfferModelScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerOfferModelScalarWhereWithAggregatesInput | Prisma.TonerOfferModelScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerOfferModel"> | number;
    offerId?: Prisma.IntWithAggregatesFilter<"TonerOfferModel"> | number;
    maker?: Prisma.StringNullableWithAggregatesFilter<"TonerOfferModel"> | string | null;
    model?: Prisma.StringWithAggregatesFilter<"TonerOfferModel"> | string;
};
export type TonerOfferModelCreateInput = {
    maker?: string | null;
    model: string;
    offer: Prisma.TonerOfferCreateNestedOneWithoutModelsInput;
};
export type TonerOfferModelUncheckedCreateInput = {
    id?: number;
    offerId: number;
    maker?: string | null;
    model: string;
};
export type TonerOfferModelUpdateInput = {
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    offer?: Prisma.TonerOfferUpdateOneRequiredWithoutModelsNestedInput;
};
export type TonerOfferModelUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    offerId?: Prisma.IntFieldUpdateOperationsInput | number;
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelCreateManyInput = {
    id?: number;
    offerId: number;
    maker?: string | null;
    model: string;
};
export type TonerOfferModelUpdateManyMutationInput = {
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    offerId?: Prisma.IntFieldUpdateOperationsInput | number;
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelListRelationFilter = {
    every?: Prisma.TonerOfferModelWhereInput;
    some?: Prisma.TonerOfferModelWhereInput;
    none?: Prisma.TonerOfferModelWhereInput;
};
export type TonerOfferModelOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerOfferModelCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
    maker?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
};
export type TonerOfferModelAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
};
export type TonerOfferModelMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
    maker?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
};
export type TonerOfferModelMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
    maker?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
};
export type TonerOfferModelSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    offerId?: Prisma.SortOrder;
};
export type TonerOfferModelCreateNestedManyWithoutOfferInput = {
    create?: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput> | Prisma.TonerOfferModelCreateWithoutOfferInput[] | Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput[];
    connectOrCreate?: Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput | Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput[];
    createMany?: Prisma.TonerOfferModelCreateManyOfferInputEnvelope;
    connect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
};
export type TonerOfferModelUncheckedCreateNestedManyWithoutOfferInput = {
    create?: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput> | Prisma.TonerOfferModelCreateWithoutOfferInput[] | Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput[];
    connectOrCreate?: Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput | Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput[];
    createMany?: Prisma.TonerOfferModelCreateManyOfferInputEnvelope;
    connect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
};
export type TonerOfferModelUpdateManyWithoutOfferNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput> | Prisma.TonerOfferModelCreateWithoutOfferInput[] | Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput[];
    connectOrCreate?: Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput | Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput[];
    upsert?: Prisma.TonerOfferModelUpsertWithWhereUniqueWithoutOfferInput | Prisma.TonerOfferModelUpsertWithWhereUniqueWithoutOfferInput[];
    createMany?: Prisma.TonerOfferModelCreateManyOfferInputEnvelope;
    set?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    disconnect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    delete?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    connect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    update?: Prisma.TonerOfferModelUpdateWithWhereUniqueWithoutOfferInput | Prisma.TonerOfferModelUpdateWithWhereUniqueWithoutOfferInput[];
    updateMany?: Prisma.TonerOfferModelUpdateManyWithWhereWithoutOfferInput | Prisma.TonerOfferModelUpdateManyWithWhereWithoutOfferInput[];
    deleteMany?: Prisma.TonerOfferModelScalarWhereInput | Prisma.TonerOfferModelScalarWhereInput[];
};
export type TonerOfferModelUncheckedUpdateManyWithoutOfferNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput> | Prisma.TonerOfferModelCreateWithoutOfferInput[] | Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput[];
    connectOrCreate?: Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput | Prisma.TonerOfferModelCreateOrConnectWithoutOfferInput[];
    upsert?: Prisma.TonerOfferModelUpsertWithWhereUniqueWithoutOfferInput | Prisma.TonerOfferModelUpsertWithWhereUniqueWithoutOfferInput[];
    createMany?: Prisma.TonerOfferModelCreateManyOfferInputEnvelope;
    set?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    disconnect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    delete?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    connect?: Prisma.TonerOfferModelWhereUniqueInput | Prisma.TonerOfferModelWhereUniqueInput[];
    update?: Prisma.TonerOfferModelUpdateWithWhereUniqueWithoutOfferInput | Prisma.TonerOfferModelUpdateWithWhereUniqueWithoutOfferInput[];
    updateMany?: Prisma.TonerOfferModelUpdateManyWithWhereWithoutOfferInput | Prisma.TonerOfferModelUpdateManyWithWhereWithoutOfferInput[];
    deleteMany?: Prisma.TonerOfferModelScalarWhereInput | Prisma.TonerOfferModelScalarWhereInput[];
};
export type TonerOfferModelCreateWithoutOfferInput = {
    maker?: string | null;
    model: string;
};
export type TonerOfferModelUncheckedCreateWithoutOfferInput = {
    id?: number;
    maker?: string | null;
    model: string;
};
export type TonerOfferModelCreateOrConnectWithoutOfferInput = {
    where: Prisma.TonerOfferModelWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput>;
};
export type TonerOfferModelCreateManyOfferInputEnvelope = {
    data: Prisma.TonerOfferModelCreateManyOfferInput | Prisma.TonerOfferModelCreateManyOfferInput[];
    skipDuplicates?: boolean;
};
export type TonerOfferModelUpsertWithWhereUniqueWithoutOfferInput = {
    where: Prisma.TonerOfferModelWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerOfferModelUpdateWithoutOfferInput, Prisma.TonerOfferModelUncheckedUpdateWithoutOfferInput>;
    create: Prisma.XOR<Prisma.TonerOfferModelCreateWithoutOfferInput, Prisma.TonerOfferModelUncheckedCreateWithoutOfferInput>;
};
export type TonerOfferModelUpdateWithWhereUniqueWithoutOfferInput = {
    where: Prisma.TonerOfferModelWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerOfferModelUpdateWithoutOfferInput, Prisma.TonerOfferModelUncheckedUpdateWithoutOfferInput>;
};
export type TonerOfferModelUpdateManyWithWhereWithoutOfferInput = {
    where: Prisma.TonerOfferModelScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerOfferModelUpdateManyMutationInput, Prisma.TonerOfferModelUncheckedUpdateManyWithoutOfferInput>;
};
export type TonerOfferModelScalarWhereInput = {
    AND?: Prisma.TonerOfferModelScalarWhereInput | Prisma.TonerOfferModelScalarWhereInput[];
    OR?: Prisma.TonerOfferModelScalarWhereInput[];
    NOT?: Prisma.TonerOfferModelScalarWhereInput | Prisma.TonerOfferModelScalarWhereInput[];
    id?: Prisma.IntFilter<"TonerOfferModel"> | number;
    offerId?: Prisma.IntFilter<"TonerOfferModel"> | number;
    maker?: Prisma.StringNullableFilter<"TonerOfferModel"> | string | null;
    model?: Prisma.StringFilter<"TonerOfferModel"> | string;
};
export type TonerOfferModelCreateManyOfferInput = {
    id?: number;
    maker?: string | null;
    model: string;
};
export type TonerOfferModelUpdateWithoutOfferInput = {
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelUncheckedUpdateWithoutOfferInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelUncheckedUpdateManyWithoutOfferInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    maker?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TonerOfferModelSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    offerId?: boolean;
    maker?: boolean;
    model?: boolean;
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOfferModel"]>;
export type TonerOfferModelSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    offerId?: boolean;
    maker?: boolean;
    model?: boolean;
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOfferModel"]>;
export type TonerOfferModelSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    offerId?: boolean;
    maker?: boolean;
    model?: boolean;
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOfferModel"]>;
export type TonerOfferModelSelectScalar = {
    id?: boolean;
    offerId?: boolean;
    maker?: boolean;
    model?: boolean;
};
export type TonerOfferModelOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "offerId" | "maker" | "model", ExtArgs["result"]["tonerOfferModel"]>;
export type TonerOfferModelInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
};
export type TonerOfferModelIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
};
export type TonerOfferModelIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    offer?: boolean | Prisma.TonerOfferDefaultArgs<ExtArgs>;
};
export type $TonerOfferModelPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerOfferModel";
    objects: {
        offer: Prisma.$TonerOfferPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        offerId: number;
        maker: string | null;
        model: string;
    }, ExtArgs["result"]["tonerOfferModel"]>;
    composites: {};
};
export type TonerOfferModelGetPayload<S extends boolean | null | undefined | TonerOfferModelDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload, S>;
export type TonerOfferModelCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerOfferModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerOfferModelCountAggregateInputType | true;
};
export interface TonerOfferModelDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerOfferModel'];
        meta: {
            name: 'TonerOfferModel';
        };
    };
    findUnique<T extends TonerOfferModelFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerOfferModelFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerOfferModelFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerOfferModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerOfferModelFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerOfferModelFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerOfferModelFindManyArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerOfferModelCreateArgs>(args: Prisma.SelectSubset<T, TonerOfferModelCreateArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerOfferModelCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerOfferModelCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerOfferModelDeleteArgs>(args: Prisma.SelectSubset<T, TonerOfferModelDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerOfferModelUpdateArgs>(args: Prisma.SelectSubset<T, TonerOfferModelUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerOfferModelDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerOfferModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerOfferModelUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerOfferModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerOfferModelUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerOfferModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerOfferModelUpsertArgs>(args: Prisma.SelectSubset<T, TonerOfferModelUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerOfferModelClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerOfferModelCountArgs>(args?: Prisma.Subset<T, TonerOfferModelCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerOfferModelCountAggregateOutputType> : number>;
    aggregate<T extends TonerOfferModelAggregateArgs>(args: Prisma.Subset<T, TonerOfferModelAggregateArgs>): Prisma.PrismaPromise<GetTonerOfferModelAggregateType<T>>;
    groupBy<T extends TonerOfferModelGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerOfferModelGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerOfferModelGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerOfferModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerOfferModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerOfferModelFieldRefs;
}
export interface Prisma__TonerOfferModelClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    offer<T extends Prisma.TonerOfferDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerOfferDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerOfferClient<runtime.Types.Result.GetResult<Prisma.$TonerOfferPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerOfferModelFieldRefs {
    readonly id: Prisma.FieldRef<"TonerOfferModel", 'Int'>;
    readonly offerId: Prisma.FieldRef<"TonerOfferModel", 'Int'>;
    readonly maker: Prisma.FieldRef<"TonerOfferModel", 'String'>;
    readonly model: Prisma.FieldRef<"TonerOfferModel", 'String'>;
}
export type TonerOfferModelFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where: Prisma.TonerOfferModelWhereUniqueInput;
};
export type TonerOfferModelFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where: Prisma.TonerOfferModelWhereUniqueInput;
};
export type TonerOfferModelFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where?: Prisma.TonerOfferModelWhereInput;
    orderBy?: Prisma.TonerOfferModelOrderByWithRelationInput | Prisma.TonerOfferModelOrderByWithRelationInput[];
    cursor?: Prisma.TonerOfferModelWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerOfferModelScalarFieldEnum | Prisma.TonerOfferModelScalarFieldEnum[];
};
export type TonerOfferModelFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where?: Prisma.TonerOfferModelWhereInput;
    orderBy?: Prisma.TonerOfferModelOrderByWithRelationInput | Prisma.TonerOfferModelOrderByWithRelationInput[];
    cursor?: Prisma.TonerOfferModelWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerOfferModelScalarFieldEnum | Prisma.TonerOfferModelScalarFieldEnum[];
};
export type TonerOfferModelFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where?: Prisma.TonerOfferModelWhereInput;
    orderBy?: Prisma.TonerOfferModelOrderByWithRelationInput | Prisma.TonerOfferModelOrderByWithRelationInput[];
    cursor?: Prisma.TonerOfferModelWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerOfferModelScalarFieldEnum | Prisma.TonerOfferModelScalarFieldEnum[];
};
export type TonerOfferModelCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOfferModelCreateInput, Prisma.TonerOfferModelUncheckedCreateInput>;
};
export type TonerOfferModelCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerOfferModelCreateManyInput | Prisma.TonerOfferModelCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerOfferModelCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    data: Prisma.TonerOfferModelCreateManyInput | Prisma.TonerOfferModelCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerOfferModelIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerOfferModelUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOfferModelUpdateInput, Prisma.TonerOfferModelUncheckedUpdateInput>;
    where: Prisma.TonerOfferModelWhereUniqueInput;
};
export type TonerOfferModelUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerOfferModelUpdateManyMutationInput, Prisma.TonerOfferModelUncheckedUpdateManyInput>;
    where?: Prisma.TonerOfferModelWhereInput;
    limit?: number;
};
export type TonerOfferModelUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOfferModelUpdateManyMutationInput, Prisma.TonerOfferModelUncheckedUpdateManyInput>;
    where?: Prisma.TonerOfferModelWhereInput;
    limit?: number;
    include?: Prisma.TonerOfferModelIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerOfferModelUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where: Prisma.TonerOfferModelWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerOfferModelCreateInput, Prisma.TonerOfferModelUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerOfferModelUpdateInput, Prisma.TonerOfferModelUncheckedUpdateInput>;
};
export type TonerOfferModelDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
    where: Prisma.TonerOfferModelWhereUniqueInput;
};
export type TonerOfferModelDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOfferModelWhereInput;
    limit?: number;
};
export type TonerOfferModelDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOfferModelSelect<ExtArgs> | null;
    omit?: Prisma.TonerOfferModelOmit<ExtArgs> | null;
    include?: Prisma.TonerOfferModelInclude<ExtArgs> | null;
};
