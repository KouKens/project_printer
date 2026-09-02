import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type MaintVendorModel = runtime.Types.Result.DefaultSelection<Prisma.$MaintVendorPayload>;
export type AggregateMaintVendor = {
    _count: MaintVendorCountAggregateOutputType | null;
    _avg: MaintVendorAvgAggregateOutputType | null;
    _sum: MaintVendorSumAggregateOutputType | null;
    _min: MaintVendorMinAggregateOutputType | null;
    _max: MaintVendorMaxAggregateOutputType | null;
};
export type MaintVendorAvgAggregateOutputType = {
    id: number | null;
};
export type MaintVendorSumAggregateOutputType = {
    id: number | null;
};
export type MaintVendorMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MaintVendorMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MaintVendorCountAggregateOutputType = {
    id: number;
    name: number;
    phones: number;
    makers: number;
    note: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MaintVendorAvgAggregateInputType = {
    id?: true;
};
export type MaintVendorSumAggregateInputType = {
    id?: true;
};
export type MaintVendorMinAggregateInputType = {
    id?: true;
    name?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MaintVendorMaxAggregateInputType = {
    id?: true;
    name?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MaintVendorCountAggregateInputType = {
    id?: true;
    name?: true;
    phones?: true;
    makers?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MaintVendorAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MaintVendorWhereInput;
    orderBy?: Prisma.MaintVendorOrderByWithRelationInput | Prisma.MaintVendorOrderByWithRelationInput[];
    cursor?: Prisma.MaintVendorWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | MaintVendorCountAggregateInputType;
    _avg?: MaintVendorAvgAggregateInputType;
    _sum?: MaintVendorSumAggregateInputType;
    _min?: MaintVendorMinAggregateInputType;
    _max?: MaintVendorMaxAggregateInputType;
};
export type GetMaintVendorAggregateType<T extends MaintVendorAggregateArgs> = {
    [P in keyof T & keyof AggregateMaintVendor]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMaintVendor[P]> : Prisma.GetScalarType<T[P], AggregateMaintVendor[P]>;
};
export type MaintVendorGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MaintVendorWhereInput;
    orderBy?: Prisma.MaintVendorOrderByWithAggregationInput | Prisma.MaintVendorOrderByWithAggregationInput[];
    by: Prisma.MaintVendorScalarFieldEnum[] | Prisma.MaintVendorScalarFieldEnum;
    having?: Prisma.MaintVendorScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MaintVendorCountAggregateInputType | true;
    _avg?: MaintVendorAvgAggregateInputType;
    _sum?: MaintVendorSumAggregateInputType;
    _min?: MaintVendorMinAggregateInputType;
    _max?: MaintVendorMaxAggregateInputType;
};
export type MaintVendorGroupByOutputType = {
    id: number;
    name: string;
    phones: string[];
    makers: string[];
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MaintVendorCountAggregateOutputType | null;
    _avg: MaintVendorAvgAggregateOutputType | null;
    _sum: MaintVendorSumAggregateOutputType | null;
    _min: MaintVendorMinAggregateOutputType | null;
    _max: MaintVendorMaxAggregateOutputType | null;
};
export type GetMaintVendorGroupByPayload<T extends MaintVendorGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MaintVendorGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MaintVendorGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MaintVendorGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MaintVendorGroupByOutputType[P]>;
}>>;
export type MaintVendorWhereInput = {
    AND?: Prisma.MaintVendorWhereInput | Prisma.MaintVendorWhereInput[];
    OR?: Prisma.MaintVendorWhereInput[];
    NOT?: Prisma.MaintVendorWhereInput | Prisma.MaintVendorWhereInput[];
    id?: Prisma.IntFilter<"MaintVendor"> | number;
    name?: Prisma.StringFilter<"MaintVendor"> | string;
    phones?: Prisma.StringNullableListFilter<"MaintVendor">;
    makers?: Prisma.StringNullableListFilter<"MaintVendor">;
    note?: Prisma.StringNullableFilter<"MaintVendor"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MaintVendor"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MaintVendor"> | Date | string;
    assets?: Prisma.PrinterAssetListRelationFilter;
};
export type MaintVendorOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    phones?: Prisma.SortOrder;
    makers?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    assets?: Prisma.PrinterAssetOrderByRelationAggregateInput;
};
export type MaintVendorWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    name?: string;
    AND?: Prisma.MaintVendorWhereInput | Prisma.MaintVendorWhereInput[];
    OR?: Prisma.MaintVendorWhereInput[];
    NOT?: Prisma.MaintVendorWhereInput | Prisma.MaintVendorWhereInput[];
    phones?: Prisma.StringNullableListFilter<"MaintVendor">;
    makers?: Prisma.StringNullableListFilter<"MaintVendor">;
    note?: Prisma.StringNullableFilter<"MaintVendor"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MaintVendor"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MaintVendor"> | Date | string;
    assets?: Prisma.PrinterAssetListRelationFilter;
}, "id" | "name">;
export type MaintVendorOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    phones?: Prisma.SortOrder;
    makers?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MaintVendorCountOrderByAggregateInput;
    _avg?: Prisma.MaintVendorAvgOrderByAggregateInput;
    _max?: Prisma.MaintVendorMaxOrderByAggregateInput;
    _min?: Prisma.MaintVendorMinOrderByAggregateInput;
    _sum?: Prisma.MaintVendorSumOrderByAggregateInput;
};
export type MaintVendorScalarWhereWithAggregatesInput = {
    AND?: Prisma.MaintVendorScalarWhereWithAggregatesInput | Prisma.MaintVendorScalarWhereWithAggregatesInput[];
    OR?: Prisma.MaintVendorScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MaintVendorScalarWhereWithAggregatesInput | Prisma.MaintVendorScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"MaintVendor"> | number;
    name?: Prisma.StringWithAggregatesFilter<"MaintVendor"> | string;
    phones?: Prisma.StringNullableListFilter<"MaintVendor">;
    makers?: Prisma.StringNullableListFilter<"MaintVendor">;
    note?: Prisma.StringNullableWithAggregatesFilter<"MaintVendor"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MaintVendor"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MaintVendor"> | Date | string;
};
export type MaintVendorCreateInput = {
    name: string;
    phones?: Prisma.MaintVendorCreatephonesInput | string[];
    makers?: Prisma.MaintVendorCreatemakersInput | string[];
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetCreateNestedManyWithoutMaintVendorInput;
};
export type MaintVendorUncheckedCreateInput = {
    id?: number;
    name: string;
    phones?: Prisma.MaintVendorCreatephonesInput | string[];
    makers?: Prisma.MaintVendorCreatemakersInput | string[];
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetUncheckedCreateNestedManyWithoutMaintVendorInput;
};
export type MaintVendorUpdateInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUpdateManyWithoutMaintVendorNestedInput;
};
export type MaintVendorUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUncheckedUpdateManyWithoutMaintVendorNestedInput;
};
export type MaintVendorCreateManyInput = {
    id?: number;
    name: string;
    phones?: Prisma.MaintVendorCreatephonesInput | string[];
    makers?: Prisma.MaintVendorCreatemakersInput | string[];
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MaintVendorUpdateManyMutationInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MaintVendorUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MaintVendorNullableScalarRelationFilter = {
    is?: Prisma.MaintVendorWhereInput | null;
    isNot?: Prisma.MaintVendorWhereInput | null;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type MaintVendorCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    phones?: Prisma.SortOrder;
    makers?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MaintVendorAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type MaintVendorMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MaintVendorMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MaintVendorSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type MaintVendorCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.MaintVendorCreateWithoutAssetsInput, Prisma.MaintVendorUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.MaintVendorCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.MaintVendorWhereUniqueInput;
};
export type MaintVendorUpdateOneWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.MaintVendorCreateWithoutAssetsInput, Prisma.MaintVendorUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.MaintVendorCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.MaintVendorUpsertWithoutAssetsInput;
    disconnect?: Prisma.MaintVendorWhereInput | boolean;
    delete?: Prisma.MaintVendorWhereInput | boolean;
    connect?: Prisma.MaintVendorWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MaintVendorUpdateToOneWithWhereWithoutAssetsInput, Prisma.MaintVendorUpdateWithoutAssetsInput>, Prisma.MaintVendorUncheckedUpdateWithoutAssetsInput>;
};
export type MaintVendorCreatephonesInput = {
    set: string[];
};
export type MaintVendorCreatemakersInput = {
    set: string[];
};
export type MaintVendorUpdatephonesInput = {
    set?: string[];
    push?: string | string[];
};
export type MaintVendorUpdatemakersInput = {
    set?: string[];
    push?: string | string[];
};
export type MaintVendorCreateWithoutAssetsInput = {
    name: string;
    phones?: Prisma.MaintVendorCreatephonesInput | string[];
    makers?: Prisma.MaintVendorCreatemakersInput | string[];
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MaintVendorUncheckedCreateWithoutAssetsInput = {
    id?: number;
    name: string;
    phones?: Prisma.MaintVendorCreatephonesInput | string[];
    makers?: Prisma.MaintVendorCreatemakersInput | string[];
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MaintVendorCreateOrConnectWithoutAssetsInput = {
    where: Prisma.MaintVendorWhereUniqueInput;
    create: Prisma.XOR<Prisma.MaintVendorCreateWithoutAssetsInput, Prisma.MaintVendorUncheckedCreateWithoutAssetsInput>;
};
export type MaintVendorUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.MaintVendorUpdateWithoutAssetsInput, Prisma.MaintVendorUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.MaintVendorCreateWithoutAssetsInput, Prisma.MaintVendorUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.MaintVendorWhereInput;
};
export type MaintVendorUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.MaintVendorWhereInput;
    data: Prisma.XOR<Prisma.MaintVendorUpdateWithoutAssetsInput, Prisma.MaintVendorUncheckedUpdateWithoutAssetsInput>;
};
export type MaintVendorUpdateWithoutAssetsInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MaintVendorUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    phones?: Prisma.MaintVendorUpdatephonesInput | string[];
    makers?: Prisma.MaintVendorUpdatemakersInput | string[];
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MaintVendorCountOutputType = {
    assets: number;
};
export type MaintVendorCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | MaintVendorCountOutputTypeCountAssetsArgs;
};
export type MaintVendorCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorCountOutputTypeSelect<ExtArgs> | null;
};
export type MaintVendorCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PrinterAssetWhereInput;
};
export type MaintVendorSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    phones?: boolean;
    makers?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    assets?: boolean | Prisma.MaintVendor$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.MaintVendorCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["maintVendor"]>;
export type MaintVendorSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    phones?: boolean;
    makers?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["maintVendor"]>;
export type MaintVendorSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    phones?: boolean;
    makers?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["maintVendor"]>;
export type MaintVendorSelectScalar = {
    id?: boolean;
    name?: boolean;
    phones?: boolean;
    makers?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MaintVendorOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "phones" | "makers" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["maintVendor"]>;
export type MaintVendorInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | Prisma.MaintVendor$assetsArgs<ExtArgs>;
    _count?: boolean | Prisma.MaintVendorCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MaintVendorIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MaintVendorIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MaintVendorPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MaintVendor";
    objects: {
        assets: Prisma.$PrinterAssetPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        name: string;
        phones: string[];
        makers: string[];
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["maintVendor"]>;
    composites: {};
};
export type MaintVendorGetPayload<S extends boolean | null | undefined | MaintVendorDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload, S>;
export type MaintVendorCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MaintVendorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MaintVendorCountAggregateInputType | true;
};
export interface MaintVendorDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MaintVendor'];
        meta: {
            name: 'MaintVendor';
        };
    };
    findUnique<T extends MaintVendorFindUniqueArgs>(args: Prisma.SelectSubset<T, MaintVendorFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends MaintVendorFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MaintVendorFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends MaintVendorFindFirstArgs>(args?: Prisma.SelectSubset<T, MaintVendorFindFirstArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends MaintVendorFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MaintVendorFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends MaintVendorFindManyArgs>(args?: Prisma.SelectSubset<T, MaintVendorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends MaintVendorCreateArgs>(args: Prisma.SelectSubset<T, MaintVendorCreateArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends MaintVendorCreateManyArgs>(args?: Prisma.SelectSubset<T, MaintVendorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends MaintVendorCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MaintVendorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends MaintVendorDeleteArgs>(args: Prisma.SelectSubset<T, MaintVendorDeleteArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends MaintVendorUpdateArgs>(args: Prisma.SelectSubset<T, MaintVendorUpdateArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends MaintVendorDeleteManyArgs>(args?: Prisma.SelectSubset<T, MaintVendorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends MaintVendorUpdateManyArgs>(args: Prisma.SelectSubset<T, MaintVendorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends MaintVendorUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MaintVendorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends MaintVendorUpsertArgs>(args: Prisma.SelectSubset<T, MaintVendorUpsertArgs<ExtArgs>>): Prisma.Prisma__MaintVendorClient<runtime.Types.Result.GetResult<Prisma.$MaintVendorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends MaintVendorCountArgs>(args?: Prisma.Subset<T, MaintVendorCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MaintVendorCountAggregateOutputType> : number>;
    aggregate<T extends MaintVendorAggregateArgs>(args: Prisma.Subset<T, MaintVendorAggregateArgs>): Prisma.PrismaPromise<GetMaintVendorAggregateType<T>>;
    groupBy<T extends MaintVendorGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MaintVendorGroupByArgs['orderBy'];
    } : {
        orderBy?: MaintVendorGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MaintVendorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMaintVendorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: MaintVendorFieldRefs;
}
export interface Prisma__MaintVendorClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    assets<T extends Prisma.MaintVendor$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MaintVendor$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PrinterAssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface MaintVendorFieldRefs {
    readonly id: Prisma.FieldRef<"MaintVendor", 'Int'>;
    readonly name: Prisma.FieldRef<"MaintVendor", 'String'>;
    readonly phones: Prisma.FieldRef<"MaintVendor", 'String[]'>;
    readonly makers: Prisma.FieldRef<"MaintVendor", 'String[]'>;
    readonly note: Prisma.FieldRef<"MaintVendor", 'String'>;
    readonly createdAt: Prisma.FieldRef<"MaintVendor", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MaintVendor", 'DateTime'>;
}
export type MaintVendorFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where: Prisma.MaintVendorWhereUniqueInput;
};
export type MaintVendorFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where: Prisma.MaintVendorWhereUniqueInput;
};
export type MaintVendorFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where?: Prisma.MaintVendorWhereInput;
    orderBy?: Prisma.MaintVendorOrderByWithRelationInput | Prisma.MaintVendorOrderByWithRelationInput[];
    cursor?: Prisma.MaintVendorWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MaintVendorScalarFieldEnum | Prisma.MaintVendorScalarFieldEnum[];
};
export type MaintVendorFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where?: Prisma.MaintVendorWhereInput;
    orderBy?: Prisma.MaintVendorOrderByWithRelationInput | Prisma.MaintVendorOrderByWithRelationInput[];
    cursor?: Prisma.MaintVendorWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MaintVendorScalarFieldEnum | Prisma.MaintVendorScalarFieldEnum[];
};
export type MaintVendorFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where?: Prisma.MaintVendorWhereInput;
    orderBy?: Prisma.MaintVendorOrderByWithRelationInput | Prisma.MaintVendorOrderByWithRelationInput[];
    cursor?: Prisma.MaintVendorWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MaintVendorScalarFieldEnum | Prisma.MaintVendorScalarFieldEnum[];
};
export type MaintVendorCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MaintVendorCreateInput, Prisma.MaintVendorUncheckedCreateInput>;
};
export type MaintVendorCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.MaintVendorCreateManyInput | Prisma.MaintVendorCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MaintVendorCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    data: Prisma.MaintVendorCreateManyInput | Prisma.MaintVendorCreateManyInput[];
    skipDuplicates?: boolean;
};
export type MaintVendorUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MaintVendorUpdateInput, Prisma.MaintVendorUncheckedUpdateInput>;
    where: Prisma.MaintVendorWhereUniqueInput;
};
export type MaintVendorUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.MaintVendorUpdateManyMutationInput, Prisma.MaintVendorUncheckedUpdateManyInput>;
    where?: Prisma.MaintVendorWhereInput;
    limit?: number;
};
export type MaintVendorUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.MaintVendorUpdateManyMutationInput, Prisma.MaintVendorUncheckedUpdateManyInput>;
    where?: Prisma.MaintVendorWhereInput;
    limit?: number;
};
export type MaintVendorUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where: Prisma.MaintVendorWhereUniqueInput;
    create: Prisma.XOR<Prisma.MaintVendorCreateInput, Prisma.MaintVendorUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.MaintVendorUpdateInput, Prisma.MaintVendorUncheckedUpdateInput>;
};
export type MaintVendorDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
    where: Prisma.MaintVendorWhereUniqueInput;
};
export type MaintVendorDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MaintVendorWhereInput;
    limit?: number;
};
export type MaintVendor$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAssetSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAssetOmit<ExtArgs> | null;
    include?: Prisma.PrinterAssetInclude<ExtArgs> | null;
    where?: Prisma.PrinterAssetWhereInput;
    orderBy?: Prisma.PrinterAssetOrderByWithRelationInput | Prisma.PrinterAssetOrderByWithRelationInput[];
    cursor?: Prisma.PrinterAssetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PrinterAssetScalarFieldEnum | Prisma.PrinterAssetScalarFieldEnum[];
};
export type MaintVendorDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.MaintVendorSelect<ExtArgs> | null;
    omit?: Prisma.MaintVendorOmit<ExtArgs> | null;
    include?: Prisma.MaintVendorInclude<ExtArgs> | null;
};
