import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerPayload>;
export type AggregateToner = {
    _count: TonerCountAggregateOutputType | null;
    _min: TonerMinAggregateOutputType | null;
    _max: TonerMaxAggregateOutputType | null;
};
export type TonerMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerCountAggregateOutputType = {
    id: number;
    name: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TonerMinAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerMaxAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerCountAggregateInputType = {
    id?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TonerAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerWhereInput;
    orderBy?: Prisma.TonerOrderByWithRelationInput | Prisma.TonerOrderByWithRelationInput[];
    cursor?: Prisma.TonerWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerCountAggregateInputType;
    _min?: TonerMinAggregateInputType;
    _max?: TonerMaxAggregateInputType;
};
export type GetTonerAggregateType<T extends TonerAggregateArgs> = {
    [P in keyof T & keyof AggregateToner]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateToner[P]> : Prisma.GetScalarType<T[P], AggregateToner[P]>;
};
export type TonerGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerWhereInput;
    orderBy?: Prisma.TonerOrderByWithAggregationInput | Prisma.TonerOrderByWithAggregationInput[];
    by: Prisma.TonerScalarFieldEnum[] | Prisma.TonerScalarFieldEnum;
    having?: Prisma.TonerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerCountAggregateInputType | true;
    _min?: TonerMinAggregateInputType;
    _max?: TonerMaxAggregateInputType;
};
export type TonerGroupByOutputType = {
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TonerCountAggregateOutputType | null;
    _min: TonerMinAggregateOutputType | null;
    _max: TonerMaxAggregateOutputType | null;
};
export type GetTonerGroupByPayload<T extends TonerGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerGroupByOutputType[P]>;
}>>;
export type TonerWhereInput = {
    AND?: Prisma.TonerWhereInput | Prisma.TonerWhereInput[];
    OR?: Prisma.TonerWhereInput[];
    NOT?: Prisma.TonerWhereInput | Prisma.TonerWhereInput[];
    id?: Prisma.StringFilter<"Toner"> | string;
    name?: Prisma.StringNullableFilter<"Toner"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Toner"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Toner"> | Date | string;
    stock?: Prisma.XOR<Prisma.TonerStockNullableScalarRelationFilter, Prisma.TonerStockWhereInput> | null;
    entries?: Prisma.TonerEntryListRelationFilter;
    orders?: Prisma.TonerOrderListRelationFilter;
};
export type TonerOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    stock?: Prisma.TonerStockOrderByWithRelationInput;
    entries?: Prisma.TonerEntryOrderByRelationAggregateInput;
    orders?: Prisma.TonerOrderOrderByRelationAggregateInput;
};
export type TonerWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TonerWhereInput | Prisma.TonerWhereInput[];
    OR?: Prisma.TonerWhereInput[];
    NOT?: Prisma.TonerWhereInput | Prisma.TonerWhereInput[];
    name?: Prisma.StringNullableFilter<"Toner"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Toner"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Toner"> | Date | string;
    stock?: Prisma.XOR<Prisma.TonerStockNullableScalarRelationFilter, Prisma.TonerStockWhereInput> | null;
    entries?: Prisma.TonerEntryListRelationFilter;
    orders?: Prisma.TonerOrderListRelationFilter;
}, "id">;
export type TonerOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TonerCountOrderByAggregateInput;
    _max?: Prisma.TonerMaxOrderByAggregateInput;
    _min?: Prisma.TonerMinOrderByAggregateInput;
};
export type TonerScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerScalarWhereWithAggregatesInput | Prisma.TonerScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerScalarWhereWithAggregatesInput | Prisma.TonerScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Toner"> | string;
    name?: Prisma.StringNullableWithAggregatesFilter<"Toner"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Toner"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Toner"> | Date | string;
};
export type TonerCreateInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockCreateNestedOneWithoutTonerInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutTonerInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutTonerInput;
};
export type TonerUncheckedCreateInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockUncheckedCreateNestedOneWithoutTonerInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutTonerInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutTonerInput;
};
export type TonerUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUpdateOneWithoutTonerNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutTonerNestedInput;
};
export type TonerUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUncheckedUpdateOneWithoutTonerNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutTonerNestedInput;
};
export type TonerCreateManyInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerScalarRelationFilter = {
    is?: Prisma.TonerWhereInput;
    isNot?: Prisma.TonerWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type TonerCreateNestedOneWithoutStockInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutStockInput, Prisma.TonerUncheckedCreateWithoutStockInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutStockInput;
    connect?: Prisma.TonerWhereUniqueInput;
};
export type TonerUpdateOneRequiredWithoutStockNestedInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutStockInput, Prisma.TonerUncheckedCreateWithoutStockInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutStockInput;
    upsert?: Prisma.TonerUpsertWithoutStockInput;
    connect?: Prisma.TonerWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerUpdateToOneWithWhereWithoutStockInput, Prisma.TonerUpdateWithoutStockInput>, Prisma.TonerUncheckedUpdateWithoutStockInput>;
};
export type TonerCreateNestedOneWithoutEntriesInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutEntriesInput, Prisma.TonerUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutEntriesInput;
    connect?: Prisma.TonerWhereUniqueInput;
};
export type TonerUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutEntriesInput, Prisma.TonerUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutEntriesInput;
    upsert?: Prisma.TonerUpsertWithoutEntriesInput;
    connect?: Prisma.TonerWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerUpdateToOneWithWhereWithoutEntriesInput, Prisma.TonerUpdateWithoutEntriesInput>, Prisma.TonerUncheckedUpdateWithoutEntriesInput>;
};
export type TonerCreateNestedOneWithoutOrdersInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutOrdersInput, Prisma.TonerUncheckedCreateWithoutOrdersInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutOrdersInput;
    connect?: Prisma.TonerWhereUniqueInput;
};
export type TonerUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: Prisma.XOR<Prisma.TonerCreateWithoutOrdersInput, Prisma.TonerUncheckedCreateWithoutOrdersInput>;
    connectOrCreate?: Prisma.TonerCreateOrConnectWithoutOrdersInput;
    upsert?: Prisma.TonerUpsertWithoutOrdersInput;
    connect?: Prisma.TonerWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerUpdateToOneWithWhereWithoutOrdersInput, Prisma.TonerUpdateWithoutOrdersInput>, Prisma.TonerUncheckedUpdateWithoutOrdersInput>;
};
export type TonerCreateWithoutStockInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutTonerInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutTonerInput;
};
export type TonerUncheckedCreateWithoutStockInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutTonerInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutTonerInput;
};
export type TonerCreateOrConnectWithoutStockInput = {
    where: Prisma.TonerWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerCreateWithoutStockInput, Prisma.TonerUncheckedCreateWithoutStockInput>;
};
export type TonerUpsertWithoutStockInput = {
    update: Prisma.XOR<Prisma.TonerUpdateWithoutStockInput, Prisma.TonerUncheckedUpdateWithoutStockInput>;
    create: Prisma.XOR<Prisma.TonerCreateWithoutStockInput, Prisma.TonerUncheckedCreateWithoutStockInput>;
    where?: Prisma.TonerWhereInput;
};
export type TonerUpdateToOneWithWhereWithoutStockInput = {
    where?: Prisma.TonerWhereInput;
    data: Prisma.XOR<Prisma.TonerUpdateWithoutStockInput, Prisma.TonerUncheckedUpdateWithoutStockInput>;
};
export type TonerUpdateWithoutStockInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entries?: Prisma.TonerEntryUpdateManyWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutTonerNestedInput;
};
export type TonerUncheckedUpdateWithoutStockInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutTonerNestedInput;
};
export type TonerCreateWithoutEntriesInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockCreateNestedOneWithoutTonerInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutTonerInput;
};
export type TonerUncheckedCreateWithoutEntriesInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockUncheckedCreateNestedOneWithoutTonerInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutTonerInput;
};
export type TonerCreateOrConnectWithoutEntriesInput = {
    where: Prisma.TonerWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerCreateWithoutEntriesInput, Prisma.TonerUncheckedCreateWithoutEntriesInput>;
};
export type TonerUpsertWithoutEntriesInput = {
    update: Prisma.XOR<Prisma.TonerUpdateWithoutEntriesInput, Prisma.TonerUncheckedUpdateWithoutEntriesInput>;
    create: Prisma.XOR<Prisma.TonerCreateWithoutEntriesInput, Prisma.TonerUncheckedCreateWithoutEntriesInput>;
    where?: Prisma.TonerWhereInput;
};
export type TonerUpdateToOneWithWhereWithoutEntriesInput = {
    where?: Prisma.TonerWhereInput;
    data: Prisma.XOR<Prisma.TonerUpdateWithoutEntriesInput, Prisma.TonerUncheckedUpdateWithoutEntriesInput>;
};
export type TonerUpdateWithoutEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUpdateOneWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutTonerNestedInput;
};
export type TonerUncheckedUpdateWithoutEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUncheckedUpdateOneWithoutTonerNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutTonerNestedInput;
};
export type TonerCreateWithoutOrdersInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockCreateNestedOneWithoutTonerInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutTonerInput;
};
export type TonerUncheckedCreateWithoutOrdersInput = {
    id: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stock?: Prisma.TonerStockUncheckedCreateNestedOneWithoutTonerInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutTonerInput;
};
export type TonerCreateOrConnectWithoutOrdersInput = {
    where: Prisma.TonerWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerCreateWithoutOrdersInput, Prisma.TonerUncheckedCreateWithoutOrdersInput>;
};
export type TonerUpsertWithoutOrdersInput = {
    update: Prisma.XOR<Prisma.TonerUpdateWithoutOrdersInput, Prisma.TonerUncheckedUpdateWithoutOrdersInput>;
    create: Prisma.XOR<Prisma.TonerCreateWithoutOrdersInput, Prisma.TonerUncheckedCreateWithoutOrdersInput>;
    where?: Prisma.TonerWhereInput;
};
export type TonerUpdateToOneWithWhereWithoutOrdersInput = {
    where?: Prisma.TonerWhereInput;
    data: Prisma.XOR<Prisma.TonerUpdateWithoutOrdersInput, Prisma.TonerUncheckedUpdateWithoutOrdersInput>;
};
export type TonerUpdateWithoutOrdersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUpdateOneWithoutTonerNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutTonerNestedInput;
};
export type TonerUncheckedUpdateWithoutOrdersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stock?: Prisma.TonerStockUncheckedUpdateOneWithoutTonerNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutTonerNestedInput;
};
export type TonerCountOutputType = {
    entries: number;
    orders: number;
};
export type TonerCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    entries?: boolean | TonerCountOutputTypeCountEntriesArgs;
    orders?: boolean | TonerCountOutputTypeCountOrdersArgs;
};
export type TonerCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerCountOutputTypeSelect<ExtArgs> | null;
};
export type TonerCountOutputTypeCountEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerEntryWhereInput;
};
export type TonerCountOutputTypeCountOrdersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOrderWhereInput;
};
export type TonerSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    stock?: boolean | Prisma.Toner$stockArgs<ExtArgs>;
    entries?: boolean | Prisma.Toner$entriesArgs<ExtArgs>;
    orders?: boolean | Prisma.Toner$ordersArgs<ExtArgs>;
    _count?: boolean | Prisma.TonerCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["toner"]>;
export type TonerSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["toner"]>;
export type TonerSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["toner"]>;
export type TonerSelectScalar = {
    id?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TonerOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["toner"]>;
export type TonerInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    stock?: boolean | Prisma.Toner$stockArgs<ExtArgs>;
    entries?: boolean | Prisma.Toner$entriesArgs<ExtArgs>;
    orders?: boolean | Prisma.Toner$ordersArgs<ExtArgs>;
    _count?: boolean | Prisma.TonerCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TonerIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TonerIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TonerPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Toner";
    objects: {
        stock: Prisma.$TonerStockPayload<ExtArgs> | null;
        entries: Prisma.$TonerEntryPayload<ExtArgs>[];
        orders: Prisma.$TonerOrderPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["toner"]>;
    composites: {};
};
export type TonerGetPayload<S extends boolean | null | undefined | TonerDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerPayload, S>;
export type TonerCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerCountAggregateInputType | true;
};
export interface TonerDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Toner'];
        meta: {
            name: 'Toner';
        };
    };
    findUnique<T extends TonerFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerFindManyArgs>(args?: Prisma.SelectSubset<T, TonerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerCreateArgs>(args: Prisma.SelectSubset<T, TonerCreateArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerDeleteArgs>(args: Prisma.SelectSubset<T, TonerDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerUpdateArgs>(args: Prisma.SelectSubset<T, TonerUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerUpsertArgs>(args: Prisma.SelectSubset<T, TonerUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerCountArgs>(args?: Prisma.Subset<T, TonerCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerCountAggregateOutputType> : number>;
    aggregate<T extends TonerAggregateArgs>(args: Prisma.Subset<T, TonerAggregateArgs>): Prisma.PrismaPromise<GetTonerAggregateType<T>>;
    groupBy<T extends TonerGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerFieldRefs;
}
export interface Prisma__TonerClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    stock<T extends Prisma.Toner$stockArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Toner$stockArgs<ExtArgs>>): Prisma.Prisma__TonerStockClient<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    entries<T extends Prisma.Toner$entriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Toner$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    orders<T extends Prisma.Toner$ordersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Toner$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerFieldRefs {
    readonly id: Prisma.FieldRef<"Toner", 'String'>;
    readonly name: Prisma.FieldRef<"Toner", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Toner", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Toner", 'DateTime'>;
}
export type TonerFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where: Prisma.TonerWhereUniqueInput;
};
export type TonerFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where: Prisma.TonerWhereUniqueInput;
};
export type TonerFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where?: Prisma.TonerWhereInput;
    orderBy?: Prisma.TonerOrderByWithRelationInput | Prisma.TonerOrderByWithRelationInput[];
    cursor?: Prisma.TonerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerScalarFieldEnum | Prisma.TonerScalarFieldEnum[];
};
export type TonerFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where?: Prisma.TonerWhereInput;
    orderBy?: Prisma.TonerOrderByWithRelationInput | Prisma.TonerOrderByWithRelationInput[];
    cursor?: Prisma.TonerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerScalarFieldEnum | Prisma.TonerScalarFieldEnum[];
};
export type TonerFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where?: Prisma.TonerWhereInput;
    orderBy?: Prisma.TonerOrderByWithRelationInput | Prisma.TonerOrderByWithRelationInput[];
    cursor?: Prisma.TonerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerScalarFieldEnum | Prisma.TonerScalarFieldEnum[];
};
export type TonerCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerCreateInput, Prisma.TonerUncheckedCreateInput>;
};
export type TonerCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerCreateManyInput | Prisma.TonerCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    data: Prisma.TonerCreateManyInput | Prisma.TonerCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerUpdateInput, Prisma.TonerUncheckedUpdateInput>;
    where: Prisma.TonerWhereUniqueInput;
};
export type TonerUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerUpdateManyMutationInput, Prisma.TonerUncheckedUpdateManyInput>;
    where?: Prisma.TonerWhereInput;
    limit?: number;
};
export type TonerUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerUpdateManyMutationInput, Prisma.TonerUncheckedUpdateManyInput>;
    where?: Prisma.TonerWhereInput;
    limit?: number;
};
export type TonerUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where: Prisma.TonerWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerCreateInput, Prisma.TonerUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerUpdateInput, Prisma.TonerUncheckedUpdateInput>;
};
export type TonerDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
    where: Prisma.TonerWhereUniqueInput;
};
export type TonerDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerWhereInput;
    limit?: number;
};
export type Toner$stockArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where?: Prisma.TonerStockWhereInput;
};
export type Toner$entriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    where?: Prisma.TonerEntryWhereInput;
    orderBy?: Prisma.TonerEntryOrderByWithRelationInput | Prisma.TonerEntryOrderByWithRelationInput[];
    cursor?: Prisma.TonerEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerEntryScalarFieldEnum | Prisma.TonerEntryScalarFieldEnum[];
};
export type Toner$ordersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    where?: Prisma.TonerOrderWhereInput;
    orderBy?: Prisma.TonerOrderOrderByWithRelationInput | Prisma.TonerOrderOrderByWithRelationInput[];
    cursor?: Prisma.TonerOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerOrderScalarFieldEnum | Prisma.TonerOrderScalarFieldEnum[];
};
export type TonerDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerSelect<ExtArgs> | null;
    omit?: Prisma.TonerOmit<ExtArgs> | null;
    include?: Prisma.TonerInclude<ExtArgs> | null;
};
