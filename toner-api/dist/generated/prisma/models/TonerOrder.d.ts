import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerOrderModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerOrderPayload>;
export type AggregateTonerOrder = {
    _count: TonerOrderCountAggregateOutputType | null;
    _avg: TonerOrderAvgAggregateOutputType | null;
    _sum: TonerOrderSumAggregateOutputType | null;
    _min: TonerOrderMinAggregateOutputType | null;
    _max: TonerOrderMaxAggregateOutputType | null;
};
export type TonerOrderAvgAggregateOutputType = {
    id: number | null;
    companyId: number | null;
    quantity: number | null;
};
export type TonerOrderSumAggregateOutputType = {
    id: number | null;
    companyId: number | null;
    quantity: number | null;
};
export type TonerOrderMinAggregateOutputType = {
    id: number | null;
    tonerId: string | null;
    companyId: number | null;
    userId: string | null;
    quantity: number | null;
    orderedAt: Date | null;
    deliveryOn: Date | null;
    status: $Enums.OrderStatus | null;
    receivedAt: Date | null;
    receiveMode: $Enums.ReceiveMode | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerOrderMaxAggregateOutputType = {
    id: number | null;
    tonerId: string | null;
    companyId: number | null;
    userId: string | null;
    quantity: number | null;
    orderedAt: Date | null;
    deliveryOn: Date | null;
    status: $Enums.OrderStatus | null;
    receivedAt: Date | null;
    receiveMode: $Enums.ReceiveMode | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerOrderCountAggregateOutputType = {
    id: number;
    tonerId: number;
    companyId: number;
    userId: number;
    quantity: number;
    orderedAt: number;
    deliveryOn: number;
    status: number;
    receivedAt: number;
    receiveMode: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TonerOrderAvgAggregateInputType = {
    id?: true;
    companyId?: true;
    quantity?: true;
};
export type TonerOrderSumAggregateInputType = {
    id?: true;
    companyId?: true;
    quantity?: true;
};
export type TonerOrderMinAggregateInputType = {
    id?: true;
    tonerId?: true;
    companyId?: true;
    userId?: true;
    quantity?: true;
    orderedAt?: true;
    deliveryOn?: true;
    status?: true;
    receivedAt?: true;
    receiveMode?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerOrderMaxAggregateInputType = {
    id?: true;
    tonerId?: true;
    companyId?: true;
    userId?: true;
    quantity?: true;
    orderedAt?: true;
    deliveryOn?: true;
    status?: true;
    receivedAt?: true;
    receiveMode?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerOrderCountAggregateInputType = {
    id?: true;
    tonerId?: true;
    companyId?: true;
    userId?: true;
    quantity?: true;
    orderedAt?: true;
    deliveryOn?: true;
    status?: true;
    receivedAt?: true;
    receiveMode?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TonerOrderAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOrderWhereInput;
    orderBy?: Prisma.TonerOrderOrderByWithRelationInput | Prisma.TonerOrderOrderByWithRelationInput[];
    cursor?: Prisma.TonerOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerOrderCountAggregateInputType;
    _avg?: TonerOrderAvgAggregateInputType;
    _sum?: TonerOrderSumAggregateInputType;
    _min?: TonerOrderMinAggregateInputType;
    _max?: TonerOrderMaxAggregateInputType;
};
export type GetTonerOrderAggregateType<T extends TonerOrderAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerOrder]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerOrder[P]> : Prisma.GetScalarType<T[P], AggregateTonerOrder[P]>;
};
export type TonerOrderGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOrderWhereInput;
    orderBy?: Prisma.TonerOrderOrderByWithAggregationInput | Prisma.TonerOrderOrderByWithAggregationInput[];
    by: Prisma.TonerOrderScalarFieldEnum[] | Prisma.TonerOrderScalarFieldEnum;
    having?: Prisma.TonerOrderScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerOrderCountAggregateInputType | true;
    _avg?: TonerOrderAvgAggregateInputType;
    _sum?: TonerOrderSumAggregateInputType;
    _min?: TonerOrderMinAggregateInputType;
    _max?: TonerOrderMaxAggregateInputType;
};
export type TonerOrderGroupByOutputType = {
    id: number;
    tonerId: string;
    companyId: number;
    userId: string | null;
    quantity: number;
    orderedAt: Date;
    deliveryOn: Date | null;
    status: $Enums.OrderStatus;
    receivedAt: Date | null;
    receiveMode: $Enums.ReceiveMode | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TonerOrderCountAggregateOutputType | null;
    _avg: TonerOrderAvgAggregateOutputType | null;
    _sum: TonerOrderSumAggregateOutputType | null;
    _min: TonerOrderMinAggregateOutputType | null;
    _max: TonerOrderMaxAggregateOutputType | null;
};
export type GetTonerOrderGroupByPayload<T extends TonerOrderGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerOrderGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerOrderGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerOrderGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerOrderGroupByOutputType[P]>;
}>>;
export type TonerOrderWhereInput = {
    AND?: Prisma.TonerOrderWhereInput | Prisma.TonerOrderWhereInput[];
    OR?: Prisma.TonerOrderWhereInput[];
    NOT?: Prisma.TonerOrderWhereInput | Prisma.TonerOrderWhereInput[];
    id?: Prisma.IntFilter<"TonerOrder"> | number;
    tonerId?: Prisma.StringFilter<"TonerOrder"> | string;
    companyId?: Prisma.IntFilter<"TonerOrder"> | number;
    userId?: Prisma.StringNullableFilter<"TonerOrder"> | string | null;
    quantity?: Prisma.IntFilter<"TonerOrder"> | number;
    orderedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    deliveryOn?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    status?: Prisma.EnumOrderStatusFilter<"TonerOrder"> | $Enums.OrderStatus;
    receivedAt?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    receiveMode?: Prisma.EnumReceiveModeNullableFilter<"TonerOrder"> | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
};
export type TonerOrderOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    orderedAt?: Prisma.SortOrder;
    deliveryOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    receivedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    receiveMode?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    toner?: Prisma.TonerOrderByWithRelationInput;
};
export type TonerOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TonerOrderWhereInput | Prisma.TonerOrderWhereInput[];
    OR?: Prisma.TonerOrderWhereInput[];
    NOT?: Prisma.TonerOrderWhereInput | Prisma.TonerOrderWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerOrder"> | string;
    companyId?: Prisma.IntFilter<"TonerOrder"> | number;
    userId?: Prisma.StringNullableFilter<"TonerOrder"> | string | null;
    quantity?: Prisma.IntFilter<"TonerOrder"> | number;
    orderedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    deliveryOn?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    status?: Prisma.EnumOrderStatusFilter<"TonerOrder"> | $Enums.OrderStatus;
    receivedAt?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    receiveMode?: Prisma.EnumReceiveModeNullableFilter<"TonerOrder"> | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
}, "id">;
export type TonerOrderOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    orderedAt?: Prisma.SortOrder;
    deliveryOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    receivedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    receiveMode?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TonerOrderCountOrderByAggregateInput;
    _avg?: Prisma.TonerOrderAvgOrderByAggregateInput;
    _max?: Prisma.TonerOrderMaxOrderByAggregateInput;
    _min?: Prisma.TonerOrderMinOrderByAggregateInput;
    _sum?: Prisma.TonerOrderSumOrderByAggregateInput;
};
export type TonerOrderScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerOrderScalarWhereWithAggregatesInput | Prisma.TonerOrderScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerOrderScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerOrderScalarWhereWithAggregatesInput | Prisma.TonerOrderScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerOrder"> | number;
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerOrder"> | string;
    companyId?: Prisma.IntWithAggregatesFilter<"TonerOrder"> | number;
    userId?: Prisma.StringNullableWithAggregatesFilter<"TonerOrder"> | string | null;
    quantity?: Prisma.IntWithAggregatesFilter<"TonerOrder"> | number;
    orderedAt?: Prisma.DateTimeWithAggregatesFilter<"TonerOrder"> | Date | string;
    deliveryOn?: Prisma.DateTimeNullableWithAggregatesFilter<"TonerOrder"> | Date | string | null;
    status?: Prisma.EnumOrderStatusWithAggregatesFilter<"TonerOrder"> | $Enums.OrderStatus;
    receivedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"TonerOrder"> | Date | string | null;
    receiveMode?: Prisma.EnumReceiveModeNullableWithAggregatesFilter<"TonerOrder"> | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TonerOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"TonerOrder"> | Date | string;
};
export type TonerOrderCreateInput = {
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrdersInput;
    toner: Prisma.TonerCreateNestedOneWithoutOrdersInput;
};
export type TonerOrderUncheckedCreateInput = {
    id?: number;
    tonerId: string;
    companyId: number;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderUpdateInput = {
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrdersNestedInput;
    toner?: Prisma.TonerUpdateOneRequiredWithoutOrdersNestedInput;
};
export type TonerOrderUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderCreateManyInput = {
    id?: number;
    tonerId: string;
    companyId: number;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderUpdateManyMutationInput = {
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderListRelationFilter = {
    every?: Prisma.TonerOrderWhereInput;
    some?: Prisma.TonerOrderWhereInput;
    none?: Prisma.TonerOrderWhereInput;
};
export type TonerOrderOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerOrderCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    orderedAt?: Prisma.SortOrder;
    deliveryOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    receivedAt?: Prisma.SortOrder;
    receiveMode?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerOrderAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
};
export type TonerOrderMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    orderedAt?: Prisma.SortOrder;
    deliveryOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    receivedAt?: Prisma.SortOrder;
    receiveMode?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerOrderMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    orderedAt?: Prisma.SortOrder;
    deliveryOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    receivedAt?: Prisma.SortOrder;
    receiveMode?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerOrderSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
};
export type TonerOrderCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput> | Prisma.TonerOrderCreateWithoutTonerInput[] | Prisma.TonerOrderUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutTonerInput | Prisma.TonerOrderCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerOrderCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
};
export type TonerOrderUncheckedCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput> | Prisma.TonerOrderCreateWithoutTonerInput[] | Prisma.TonerOrderUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutTonerInput | Prisma.TonerOrderCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerOrderCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
};
export type TonerOrderUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput> | Prisma.TonerOrderCreateWithoutTonerInput[] | Prisma.TonerOrderUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutTonerInput | Prisma.TonerOrderCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerOrderUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerOrderUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerOrderCreateManyTonerInputEnvelope;
    set?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    disconnect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    delete?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    update?: Prisma.TonerOrderUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerOrderUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerOrderUpdateManyWithWhereWithoutTonerInput | Prisma.TonerOrderUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
};
export type TonerOrderUncheckedUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput> | Prisma.TonerOrderCreateWithoutTonerInput[] | Prisma.TonerOrderUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutTonerInput | Prisma.TonerOrderCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerOrderUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerOrderUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerOrderCreateManyTonerInputEnvelope;
    set?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    disconnect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    delete?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    update?: Prisma.TonerOrderUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerOrderUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerOrderUpdateManyWithWhereWithoutTonerInput | Prisma.TonerOrderUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
};
export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus;
};
export type NullableEnumReceiveModeFieldUpdateOperationsInput = {
    set?: $Enums.ReceiveMode | null;
};
export type TonerOrderCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput> | Prisma.TonerOrderCreateWithoutCompanyInput[] | Prisma.TonerOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutCompanyInput | Prisma.TonerOrderCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TonerOrderCreateManyCompanyInputEnvelope;
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
};
export type TonerOrderUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput> | Prisma.TonerOrderCreateWithoutCompanyInput[] | Prisma.TonerOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutCompanyInput | Prisma.TonerOrderCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TonerOrderCreateManyCompanyInputEnvelope;
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
};
export type TonerOrderUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput> | Prisma.TonerOrderCreateWithoutCompanyInput[] | Prisma.TonerOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutCompanyInput | Prisma.TonerOrderCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TonerOrderUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TonerOrderUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TonerOrderCreateManyCompanyInputEnvelope;
    set?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    disconnect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    delete?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    update?: Prisma.TonerOrderUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TonerOrderUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TonerOrderUpdateManyWithWhereWithoutCompanyInput | Prisma.TonerOrderUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
};
export type TonerOrderUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput> | Prisma.TonerOrderCreateWithoutCompanyInput[] | Prisma.TonerOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerOrderCreateOrConnectWithoutCompanyInput | Prisma.TonerOrderCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TonerOrderUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TonerOrderUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TonerOrderCreateManyCompanyInputEnvelope;
    set?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    disconnect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    delete?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    connect?: Prisma.TonerOrderWhereUniqueInput | Prisma.TonerOrderWhereUniqueInput[];
    update?: Prisma.TonerOrderUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TonerOrderUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TonerOrderUpdateManyWithWhereWithoutCompanyInput | Prisma.TonerOrderUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
};
export type TonerOrderCreateWithoutTonerInput = {
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutOrdersInput;
};
export type TonerOrderUncheckedCreateWithoutTonerInput = {
    id?: number;
    companyId: number;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput>;
};
export type TonerOrderCreateManyTonerInputEnvelope = {
    data: Prisma.TonerOrderCreateManyTonerInput | Prisma.TonerOrderCreateManyTonerInput[];
    skipDuplicates?: boolean;
};
export type TonerOrderUpsertWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerOrderUpdateWithoutTonerInput, Prisma.TonerOrderUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerOrderCreateWithoutTonerInput, Prisma.TonerOrderUncheckedCreateWithoutTonerInput>;
};
export type TonerOrderUpdateWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerOrderUpdateWithoutTonerInput, Prisma.TonerOrderUncheckedUpdateWithoutTonerInput>;
};
export type TonerOrderUpdateManyWithWhereWithoutTonerInput = {
    where: Prisma.TonerOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerOrderUpdateManyMutationInput, Prisma.TonerOrderUncheckedUpdateManyWithoutTonerInput>;
};
export type TonerOrderScalarWhereInput = {
    AND?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
    OR?: Prisma.TonerOrderScalarWhereInput[];
    NOT?: Prisma.TonerOrderScalarWhereInput | Prisma.TonerOrderScalarWhereInput[];
    id?: Prisma.IntFilter<"TonerOrder"> | number;
    tonerId?: Prisma.StringFilter<"TonerOrder"> | string;
    companyId?: Prisma.IntFilter<"TonerOrder"> | number;
    userId?: Prisma.StringNullableFilter<"TonerOrder"> | string | null;
    quantity?: Prisma.IntFilter<"TonerOrder"> | number;
    orderedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    deliveryOn?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    status?: Prisma.EnumOrderStatusFilter<"TonerOrder"> | $Enums.OrderStatus;
    receivedAt?: Prisma.DateTimeNullableFilter<"TonerOrder"> | Date | string | null;
    receiveMode?: Prisma.EnumReceiveModeNullableFilter<"TonerOrder"> | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TonerOrder"> | Date | string;
};
export type TonerOrderCreateWithoutCompanyInput = {
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutOrdersInput;
};
export type TonerOrderUncheckedCreateWithoutCompanyInput = {
    id?: number;
    tonerId: string;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderCreateOrConnectWithoutCompanyInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput>;
};
export type TonerOrderCreateManyCompanyInputEnvelope = {
    data: Prisma.TonerOrderCreateManyCompanyInput | Prisma.TonerOrderCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type TonerOrderUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerOrderUpdateWithoutCompanyInput, Prisma.TonerOrderUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.TonerOrderCreateWithoutCompanyInput, Prisma.TonerOrderUncheckedCreateWithoutCompanyInput>;
};
export type TonerOrderUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TonerOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerOrderUpdateWithoutCompanyInput, Prisma.TonerOrderUncheckedUpdateWithoutCompanyInput>;
};
export type TonerOrderUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.TonerOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerOrderUpdateManyMutationInput, Prisma.TonerOrderUncheckedUpdateManyWithoutCompanyInput>;
};
export type TonerOrderCreateManyTonerInput = {
    id?: number;
    companyId: number;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderUpdateWithoutTonerInput = {
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutOrdersNestedInput;
};
export type TonerOrderUncheckedUpdateWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderUncheckedUpdateManyWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderCreateManyCompanyInput = {
    id?: number;
    tonerId: string;
    userId?: string | null;
    quantity: number;
    orderedAt: Date | string;
    deliveryOn?: Date | string | null;
    status?: $Enums.OrderStatus;
    receivedAt?: Date | string | null;
    receiveMode?: $Enums.ReceiveMode | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerOrderUpdateWithoutCompanyInput = {
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutOrdersNestedInput;
};
export type TonerOrderUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    orderedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deliveryOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    receivedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    receiveMode?: Prisma.NullableEnumReceiveModeFieldUpdateOperationsInput | $Enums.ReceiveMode | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerOrderSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    companyId?: boolean;
    userId?: boolean;
    quantity?: boolean;
    orderedAt?: boolean;
    deliveryOn?: boolean;
    status?: boolean;
    receivedAt?: boolean;
    receiveMode?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOrder"]>;
export type TonerOrderSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    companyId?: boolean;
    userId?: boolean;
    quantity?: boolean;
    orderedAt?: boolean;
    deliveryOn?: boolean;
    status?: boolean;
    receivedAt?: boolean;
    receiveMode?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOrder"]>;
export type TonerOrderSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tonerId?: boolean;
    companyId?: boolean;
    userId?: boolean;
    quantity?: boolean;
    orderedAt?: boolean;
    deliveryOn?: boolean;
    status?: boolean;
    receivedAt?: boolean;
    receiveMode?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerOrder"]>;
export type TonerOrderSelectScalar = {
    id?: boolean;
    tonerId?: boolean;
    companyId?: boolean;
    userId?: boolean;
    quantity?: boolean;
    orderedAt?: boolean;
    deliveryOn?: boolean;
    status?: boolean;
    receivedAt?: boolean;
    receiveMode?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TonerOrderOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tonerId" | "companyId" | "userId" | "quantity" | "orderedAt" | "deliveryOn" | "status" | "receivedAt" | "receiveMode" | "createdAt" | "updatedAt", ExtArgs["result"]["tonerOrder"]>;
export type TonerOrderInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerOrderIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerOrderIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type $TonerOrderPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerOrder";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        toner: Prisma.$TonerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        tonerId: string;
        companyId: number;
        userId: string | null;
        quantity: number;
        orderedAt: Date;
        deliveryOn: Date | null;
        status: $Enums.OrderStatus;
        receivedAt: Date | null;
        receiveMode: $Enums.ReceiveMode | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tonerOrder"]>;
    composites: {};
};
export type TonerOrderGetPayload<S extends boolean | null | undefined | TonerOrderDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload, S>;
export type TonerOrderCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerOrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerOrderCountAggregateInputType | true;
};
export interface TonerOrderDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerOrder'];
        meta: {
            name: 'TonerOrder';
        };
    };
    findUnique<T extends TonerOrderFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerOrderFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerOrderFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerOrderFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerOrderFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerOrderFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerOrderFindManyArgs>(args?: Prisma.SelectSubset<T, TonerOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerOrderCreateArgs>(args: Prisma.SelectSubset<T, TonerOrderCreateArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerOrderCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerOrderCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerOrderDeleteArgs>(args: Prisma.SelectSubset<T, TonerOrderDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerOrderUpdateArgs>(args: Prisma.SelectSubset<T, TonerOrderUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerOrderDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerOrderUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerOrderUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerOrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerOrderUpsertArgs>(args: Prisma.SelectSubset<T, TonerOrderUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerOrderClient<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerOrderCountArgs>(args?: Prisma.Subset<T, TonerOrderCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerOrderCountAggregateOutputType> : number>;
    aggregate<T extends TonerOrderAggregateArgs>(args: Prisma.Subset<T, TonerOrderAggregateArgs>): Prisma.PrismaPromise<GetTonerOrderAggregateType<T>>;
    groupBy<T extends TonerOrderGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerOrderGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerOrderGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerOrderFieldRefs;
}
export interface Prisma__TonerOrderClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerOrderFieldRefs {
    readonly id: Prisma.FieldRef<"TonerOrder", 'Int'>;
    readonly tonerId: Prisma.FieldRef<"TonerOrder", 'String'>;
    readonly companyId: Prisma.FieldRef<"TonerOrder", 'Int'>;
    readonly userId: Prisma.FieldRef<"TonerOrder", 'String'>;
    readonly quantity: Prisma.FieldRef<"TonerOrder", 'Int'>;
    readonly orderedAt: Prisma.FieldRef<"TonerOrder", 'DateTime'>;
    readonly deliveryOn: Prisma.FieldRef<"TonerOrder", 'DateTime'>;
    readonly status: Prisma.FieldRef<"TonerOrder", 'OrderStatus'>;
    readonly receivedAt: Prisma.FieldRef<"TonerOrder", 'DateTime'>;
    readonly receiveMode: Prisma.FieldRef<"TonerOrder", 'ReceiveMode'>;
    readonly createdAt: Prisma.FieldRef<"TonerOrder", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"TonerOrder", 'DateTime'>;
}
export type TonerOrderFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    where: Prisma.TonerOrderWhereUniqueInput;
};
export type TonerOrderFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    where: Prisma.TonerOrderWhereUniqueInput;
};
export type TonerOrderFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerOrderFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerOrderFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerOrderCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOrderCreateInput, Prisma.TonerOrderUncheckedCreateInput>;
};
export type TonerOrderCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerOrderCreateManyInput | Prisma.TonerOrderCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerOrderCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    data: Prisma.TonerOrderCreateManyInput | Prisma.TonerOrderCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerOrderIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerOrderUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOrderUpdateInput, Prisma.TonerOrderUncheckedUpdateInput>;
    where: Prisma.TonerOrderWhereUniqueInput;
};
export type TonerOrderUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerOrderUpdateManyMutationInput, Prisma.TonerOrderUncheckedUpdateManyInput>;
    where?: Prisma.TonerOrderWhereInput;
    limit?: number;
};
export type TonerOrderUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerOrderUpdateManyMutationInput, Prisma.TonerOrderUncheckedUpdateManyInput>;
    where?: Prisma.TonerOrderWhereInput;
    limit?: number;
    include?: Prisma.TonerOrderIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerOrderUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    where: Prisma.TonerOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerOrderCreateInput, Prisma.TonerOrderUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerOrderUpdateInput, Prisma.TonerOrderUncheckedUpdateInput>;
};
export type TonerOrderDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
    where: Prisma.TonerOrderWhereUniqueInput;
};
export type TonerOrderDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOrderWhereInput;
    limit?: number;
};
export type TonerOrderDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerOrderSelect<ExtArgs> | null;
    omit?: Prisma.TonerOrderOmit<ExtArgs> | null;
    include?: Prisma.TonerOrderInclude<ExtArgs> | null;
};
