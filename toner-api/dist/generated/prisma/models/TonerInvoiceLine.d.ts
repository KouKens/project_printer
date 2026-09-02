import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerInvoiceLineModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerInvoiceLinePayload>;
export type AggregateTonerInvoiceLine = {
    _count: TonerInvoiceLineCountAggregateOutputType | null;
    _avg: TonerInvoiceLineAvgAggregateOutputType | null;
    _sum: TonerInvoiceLineSumAggregateOutputType | null;
    _min: TonerInvoiceLineMinAggregateOutputType | null;
    _max: TonerInvoiceLineMaxAggregateOutputType | null;
};
export type TonerInvoiceLineAvgAggregateOutputType = {
    id: number | null;
    invoiceId: number | null;
    quantity: number | null;
    unitPrice: number | null;
};
export type TonerInvoiceLineSumAggregateOutputType = {
    id: number | null;
    invoiceId: number | null;
    quantity: number | null;
    unitPrice: number | null;
};
export type TonerInvoiceLineMinAggregateOutputType = {
    id: number | null;
    invoiceId: number | null;
    tonerId: string | null;
    quantity: number | null;
    unitPrice: number | null;
};
export type TonerInvoiceLineMaxAggregateOutputType = {
    id: number | null;
    invoiceId: number | null;
    tonerId: string | null;
    quantity: number | null;
    unitPrice: number | null;
};
export type TonerInvoiceLineCountAggregateOutputType = {
    id: number;
    invoiceId: number;
    tonerId: number;
    quantity: number;
    unitPrice: number;
    _all: number;
};
export type TonerInvoiceLineAvgAggregateInputType = {
    id?: true;
    invoiceId?: true;
    quantity?: true;
    unitPrice?: true;
};
export type TonerInvoiceLineSumAggregateInputType = {
    id?: true;
    invoiceId?: true;
    quantity?: true;
    unitPrice?: true;
};
export type TonerInvoiceLineMinAggregateInputType = {
    id?: true;
    invoiceId?: true;
    tonerId?: true;
    quantity?: true;
    unitPrice?: true;
};
export type TonerInvoiceLineMaxAggregateInputType = {
    id?: true;
    invoiceId?: true;
    tonerId?: true;
    quantity?: true;
    unitPrice?: true;
};
export type TonerInvoiceLineCountAggregateInputType = {
    id?: true;
    invoiceId?: true;
    tonerId?: true;
    quantity?: true;
    unitPrice?: true;
    _all?: true;
};
export type TonerInvoiceLineAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceLineWhereInput;
    orderBy?: Prisma.TonerInvoiceLineOrderByWithRelationInput | Prisma.TonerInvoiceLineOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceLineWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerInvoiceLineCountAggregateInputType;
    _avg?: TonerInvoiceLineAvgAggregateInputType;
    _sum?: TonerInvoiceLineSumAggregateInputType;
    _min?: TonerInvoiceLineMinAggregateInputType;
    _max?: TonerInvoiceLineMaxAggregateInputType;
};
export type GetTonerInvoiceLineAggregateType<T extends TonerInvoiceLineAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerInvoiceLine]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerInvoiceLine[P]> : Prisma.GetScalarType<T[P], AggregateTonerInvoiceLine[P]>;
};
export type TonerInvoiceLineGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceLineWhereInput;
    orderBy?: Prisma.TonerInvoiceLineOrderByWithAggregationInput | Prisma.TonerInvoiceLineOrderByWithAggregationInput[];
    by: Prisma.TonerInvoiceLineScalarFieldEnum[] | Prisma.TonerInvoiceLineScalarFieldEnum;
    having?: Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerInvoiceLineCountAggregateInputType | true;
    _avg?: TonerInvoiceLineAvgAggregateInputType;
    _sum?: TonerInvoiceLineSumAggregateInputType;
    _min?: TonerInvoiceLineMinAggregateInputType;
    _max?: TonerInvoiceLineMaxAggregateInputType;
};
export type TonerInvoiceLineGroupByOutputType = {
    id: number;
    invoiceId: number;
    tonerId: string;
    quantity: number;
    unitPrice: number | null;
    _count: TonerInvoiceLineCountAggregateOutputType | null;
    _avg: TonerInvoiceLineAvgAggregateOutputType | null;
    _sum: TonerInvoiceLineSumAggregateOutputType | null;
    _min: TonerInvoiceLineMinAggregateOutputType | null;
    _max: TonerInvoiceLineMaxAggregateOutputType | null;
};
export type GetTonerInvoiceLineGroupByPayload<T extends TonerInvoiceLineGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerInvoiceLineGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerInvoiceLineGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerInvoiceLineGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerInvoiceLineGroupByOutputType[P]>;
}>>;
export type TonerInvoiceLineWhereInput = {
    AND?: Prisma.TonerInvoiceLineWhereInput | Prisma.TonerInvoiceLineWhereInput[];
    OR?: Prisma.TonerInvoiceLineWhereInput[];
    NOT?: Prisma.TonerInvoiceLineWhereInput | Prisma.TonerInvoiceLineWhereInput[];
    id?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    invoiceId?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    tonerId?: Prisma.StringFilter<"TonerInvoiceLine"> | string;
    quantity?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    unitPrice?: Prisma.IntNullableFilter<"TonerInvoiceLine"> | number | null;
    invoice?: Prisma.XOR<Prisma.TonerInvoiceScalarRelationFilter, Prisma.TonerInvoiceWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
};
export type TonerInvoiceLineOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrderInput | Prisma.SortOrder;
    invoice?: Prisma.TonerInvoiceOrderByWithRelationInput;
    toner?: Prisma.TonerOrderByWithRelationInput;
};
export type TonerInvoiceLineWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    invoiceId_tonerId?: Prisma.TonerInvoiceLineInvoiceIdTonerIdCompoundUniqueInput;
    AND?: Prisma.TonerInvoiceLineWhereInput | Prisma.TonerInvoiceLineWhereInput[];
    OR?: Prisma.TonerInvoiceLineWhereInput[];
    NOT?: Prisma.TonerInvoiceLineWhereInput | Prisma.TonerInvoiceLineWhereInput[];
    invoiceId?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    tonerId?: Prisma.StringFilter<"TonerInvoiceLine"> | string;
    quantity?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    unitPrice?: Prisma.IntNullableFilter<"TonerInvoiceLine"> | number | null;
    invoice?: Prisma.XOR<Prisma.TonerInvoiceScalarRelationFilter, Prisma.TonerInvoiceWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
}, "id" | "invoiceId_tonerId">;
export type TonerInvoiceLineOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.TonerInvoiceLineCountOrderByAggregateInput;
    _avg?: Prisma.TonerInvoiceLineAvgOrderByAggregateInput;
    _max?: Prisma.TonerInvoiceLineMaxOrderByAggregateInput;
    _min?: Prisma.TonerInvoiceLineMinOrderByAggregateInput;
    _sum?: Prisma.TonerInvoiceLineSumOrderByAggregateInput;
};
export type TonerInvoiceLineScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput | Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput | Prisma.TonerInvoiceLineScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerInvoiceLine"> | number;
    invoiceId?: Prisma.IntWithAggregatesFilter<"TonerInvoiceLine"> | number;
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerInvoiceLine"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"TonerInvoiceLine"> | number;
    unitPrice?: Prisma.IntNullableWithAggregatesFilter<"TonerInvoiceLine"> | number | null;
};
export type TonerInvoiceLineCreateInput = {
    quantity: number;
    unitPrice?: number | null;
    invoice: Prisma.TonerInvoiceCreateNestedOneWithoutLinesInput;
    toner: Prisma.TonerCreateNestedOneWithoutInvoiceLinesInput;
};
export type TonerInvoiceLineUncheckedCreateInput = {
    id?: number;
    invoiceId: number;
    tonerId: string;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineUpdateInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    invoice?: Prisma.TonerInvoiceUpdateOneRequiredWithoutLinesNestedInput;
    toner?: Prisma.TonerUpdateOneRequiredWithoutInvoiceLinesNestedInput;
};
export type TonerInvoiceLineUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceId?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineCreateManyInput = {
    id?: number;
    invoiceId: number;
    tonerId: string;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineUpdateManyMutationInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceId?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineListRelationFilter = {
    every?: Prisma.TonerInvoiceLineWhereInput;
    some?: Prisma.TonerInvoiceLineWhereInput;
    none?: Prisma.TonerInvoiceLineWhereInput;
};
export type TonerInvoiceLineOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerInvoiceLineInvoiceIdTonerIdCompoundUniqueInput = {
    invoiceId: number;
    tonerId: string;
};
export type TonerInvoiceLineCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type TonerInvoiceLineAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type TonerInvoiceLineMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type TonerInvoiceLineMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type TonerInvoiceLineSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    invoiceId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    unitPrice?: Prisma.SortOrder;
};
export type TonerInvoiceLineCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput> | Prisma.TonerInvoiceLineCreateWithoutTonerInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
};
export type TonerInvoiceLineUncheckedCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput> | Prisma.TonerInvoiceLineCreateWithoutTonerInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
};
export type TonerInvoiceLineUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput> | Prisma.TonerInvoiceLineCreateWithoutTonerInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyTonerInputEnvelope;
    set?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    disconnect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    delete?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    update?: Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutTonerInput | Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
};
export type TonerInvoiceLineUncheckedUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput> | Prisma.TonerInvoiceLineCreateWithoutTonerInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyTonerInputEnvelope;
    set?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    disconnect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    delete?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    update?: Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutTonerInput | Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
};
export type TonerInvoiceLineCreateNestedManyWithoutInvoiceInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput> | Prisma.TonerInvoiceLineCreateWithoutInvoiceInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyInvoiceInputEnvelope;
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
};
export type TonerInvoiceLineUncheckedCreateNestedManyWithoutInvoiceInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput> | Prisma.TonerInvoiceLineCreateWithoutInvoiceInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyInvoiceInputEnvelope;
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
};
export type TonerInvoiceLineUpdateManyWithoutInvoiceNestedInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput> | Prisma.TonerInvoiceLineCreateWithoutInvoiceInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput[];
    upsert?: Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutInvoiceInput | Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutInvoiceInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyInvoiceInputEnvelope;
    set?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    disconnect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    delete?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    update?: Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutInvoiceInput | Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutInvoiceInput[];
    updateMany?: Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutInvoiceInput | Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutInvoiceInput[];
    deleteMany?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
};
export type TonerInvoiceLineUncheckedUpdateManyWithoutInvoiceNestedInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput> | Prisma.TonerInvoiceLineCreateWithoutInvoiceInput[] | Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput[];
    connectOrCreate?: Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput | Prisma.TonerInvoiceLineCreateOrConnectWithoutInvoiceInput[];
    upsert?: Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutInvoiceInput | Prisma.TonerInvoiceLineUpsertWithWhereUniqueWithoutInvoiceInput[];
    createMany?: Prisma.TonerInvoiceLineCreateManyInvoiceInputEnvelope;
    set?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    disconnect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    delete?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    connect?: Prisma.TonerInvoiceLineWhereUniqueInput | Prisma.TonerInvoiceLineWhereUniqueInput[];
    update?: Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutInvoiceInput | Prisma.TonerInvoiceLineUpdateWithWhereUniqueWithoutInvoiceInput[];
    updateMany?: Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutInvoiceInput | Prisma.TonerInvoiceLineUpdateManyWithWhereWithoutInvoiceInput[];
    deleteMany?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
};
export type TonerInvoiceLineCreateWithoutTonerInput = {
    quantity: number;
    unitPrice?: number | null;
    invoice: Prisma.TonerInvoiceCreateNestedOneWithoutLinesInput;
};
export type TonerInvoiceLineUncheckedCreateWithoutTonerInput = {
    id?: number;
    invoiceId: number;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput>;
};
export type TonerInvoiceLineCreateManyTonerInputEnvelope = {
    data: Prisma.TonerInvoiceLineCreateManyTonerInput | Prisma.TonerInvoiceLineCreateManyTonerInput[];
    skipDuplicates?: boolean;
};
export type TonerInvoiceLineUpsertWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerInvoiceLineUpdateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutTonerInput>;
};
export type TonerInvoiceLineUpdateWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateWithoutTonerInput, Prisma.TonerInvoiceLineUncheckedUpdateWithoutTonerInput>;
};
export type TonerInvoiceLineUpdateManyWithWhereWithoutTonerInput = {
    where: Prisma.TonerInvoiceLineScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateManyMutationInput, Prisma.TonerInvoiceLineUncheckedUpdateManyWithoutTonerInput>;
};
export type TonerInvoiceLineScalarWhereInput = {
    AND?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
    OR?: Prisma.TonerInvoiceLineScalarWhereInput[];
    NOT?: Prisma.TonerInvoiceLineScalarWhereInput | Prisma.TonerInvoiceLineScalarWhereInput[];
    id?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    invoiceId?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    tonerId?: Prisma.StringFilter<"TonerInvoiceLine"> | string;
    quantity?: Prisma.IntFilter<"TonerInvoiceLine"> | number;
    unitPrice?: Prisma.IntNullableFilter<"TonerInvoiceLine"> | number | null;
};
export type TonerInvoiceLineCreateWithoutInvoiceInput = {
    quantity: number;
    unitPrice?: number | null;
    toner: Prisma.TonerCreateNestedOneWithoutInvoiceLinesInput;
};
export type TonerInvoiceLineUncheckedCreateWithoutInvoiceInput = {
    id?: number;
    tonerId: string;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineCreateOrConnectWithoutInvoiceInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput>;
};
export type TonerInvoiceLineCreateManyInvoiceInputEnvelope = {
    data: Prisma.TonerInvoiceLineCreateManyInvoiceInput | Prisma.TonerInvoiceLineCreateManyInvoiceInput[];
    skipDuplicates?: boolean;
};
export type TonerInvoiceLineUpsertWithWhereUniqueWithoutInvoiceInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerInvoiceLineUpdateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedUpdateWithoutInvoiceInput>;
    create: Prisma.XOR<Prisma.TonerInvoiceLineCreateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedCreateWithoutInvoiceInput>;
};
export type TonerInvoiceLineUpdateWithWhereUniqueWithoutInvoiceInput = {
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateWithoutInvoiceInput, Prisma.TonerInvoiceLineUncheckedUpdateWithoutInvoiceInput>;
};
export type TonerInvoiceLineUpdateManyWithWhereWithoutInvoiceInput = {
    where: Prisma.TonerInvoiceLineScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateManyMutationInput, Prisma.TonerInvoiceLineUncheckedUpdateManyWithoutInvoiceInput>;
};
export type TonerInvoiceLineCreateManyTonerInput = {
    id?: number;
    invoiceId: number;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineUpdateWithoutTonerInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    invoice?: Prisma.TonerInvoiceUpdateOneRequiredWithoutLinesNestedInput;
};
export type TonerInvoiceLineUncheckedUpdateWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineUncheckedUpdateManyWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineCreateManyInvoiceInput = {
    id?: number;
    tonerId: string;
    quantity: number;
    unitPrice?: number | null;
};
export type TonerInvoiceLineUpdateWithoutInvoiceInput = {
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    toner?: Prisma.TonerUpdateOneRequiredWithoutInvoiceLinesNestedInput;
};
export type TonerInvoiceLineUncheckedUpdateWithoutInvoiceInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineUncheckedUpdateManyWithoutInvoiceInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    unitPrice?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
};
export type TonerInvoiceLineSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceId?: boolean;
    tonerId?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerInvoiceLine"]>;
export type TonerInvoiceLineSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceId?: boolean;
    tonerId?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerInvoiceLine"]>;
export type TonerInvoiceLineSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    invoiceId?: boolean;
    tonerId?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerInvoiceLine"]>;
export type TonerInvoiceLineSelectScalar = {
    id?: boolean;
    invoiceId?: boolean;
    tonerId?: boolean;
    quantity?: boolean;
    unitPrice?: boolean;
};
export type TonerInvoiceLineOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "invoiceId" | "tonerId" | "quantity" | "unitPrice", ExtArgs["result"]["tonerInvoiceLine"]>;
export type TonerInvoiceLineInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerInvoiceLineIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerInvoiceLineIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    invoice?: boolean | Prisma.TonerInvoiceDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type $TonerInvoiceLinePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerInvoiceLine";
    objects: {
        invoice: Prisma.$TonerInvoicePayload<ExtArgs>;
        toner: Prisma.$TonerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        invoiceId: number;
        tonerId: string;
        quantity: number;
        unitPrice: number | null;
    }, ExtArgs["result"]["tonerInvoiceLine"]>;
    composites: {};
};
export type TonerInvoiceLineGetPayload<S extends boolean | null | undefined | TonerInvoiceLineDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload, S>;
export type TonerInvoiceLineCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerInvoiceLineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerInvoiceLineCountAggregateInputType | true;
};
export interface TonerInvoiceLineDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerInvoiceLine'];
        meta: {
            name: 'TonerInvoiceLine';
        };
    };
    findUnique<T extends TonerInvoiceLineFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerInvoiceLineFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerInvoiceLineFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerInvoiceLineFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerInvoiceLineFindManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerInvoiceLineCreateArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineCreateArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerInvoiceLineCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerInvoiceLineCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerInvoiceLineDeleteArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerInvoiceLineUpdateArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerInvoiceLineDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceLineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerInvoiceLineUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerInvoiceLineUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerInvoiceLineUpsertArgs>(args: Prisma.SelectSubset<T, TonerInvoiceLineUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceLineClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerInvoiceLineCountArgs>(args?: Prisma.Subset<T, TonerInvoiceLineCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerInvoiceLineCountAggregateOutputType> : number>;
    aggregate<T extends TonerInvoiceLineAggregateArgs>(args: Prisma.Subset<T, TonerInvoiceLineAggregateArgs>): Prisma.PrismaPromise<GetTonerInvoiceLineAggregateType<T>>;
    groupBy<T extends TonerInvoiceLineGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerInvoiceLineGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerInvoiceLineGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerInvoiceLineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerInvoiceLineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerInvoiceLineFieldRefs;
}
export interface Prisma__TonerInvoiceLineClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    invoice<T extends Prisma.TonerInvoiceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerInvoiceDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerInvoiceLineFieldRefs {
    readonly id: Prisma.FieldRef<"TonerInvoiceLine", 'Int'>;
    readonly invoiceId: Prisma.FieldRef<"TonerInvoiceLine", 'Int'>;
    readonly tonerId: Prisma.FieldRef<"TonerInvoiceLine", 'String'>;
    readonly quantity: Prisma.FieldRef<"TonerInvoiceLine", 'Int'>;
    readonly unitPrice: Prisma.FieldRef<"TonerInvoiceLine", 'Int'>;
}
export type TonerInvoiceLineFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
};
export type TonerInvoiceLineFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
};
export type TonerInvoiceLineFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceLineWhereInput;
    orderBy?: Prisma.TonerInvoiceLineOrderByWithRelationInput | Prisma.TonerInvoiceLineOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceLineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceLineScalarFieldEnum | Prisma.TonerInvoiceLineScalarFieldEnum[];
};
export type TonerInvoiceLineFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceLineWhereInput;
    orderBy?: Prisma.TonerInvoiceLineOrderByWithRelationInput | Prisma.TonerInvoiceLineOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceLineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceLineScalarFieldEnum | Prisma.TonerInvoiceLineScalarFieldEnum[];
};
export type TonerInvoiceLineFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceLineWhereInput;
    orderBy?: Prisma.TonerInvoiceLineOrderByWithRelationInput | Prisma.TonerInvoiceLineOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceLineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceLineScalarFieldEnum | Prisma.TonerInvoiceLineScalarFieldEnum[];
};
export type TonerInvoiceLineCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceLineCreateInput, Prisma.TonerInvoiceLineUncheckedCreateInput>;
};
export type TonerInvoiceLineCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerInvoiceLineCreateManyInput | Prisma.TonerInvoiceLineCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerInvoiceLineCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    data: Prisma.TonerInvoiceLineCreateManyInput | Prisma.TonerInvoiceLineCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerInvoiceLineIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerInvoiceLineUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateInput, Prisma.TonerInvoiceLineUncheckedUpdateInput>;
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
};
export type TonerInvoiceLineUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateManyMutationInput, Prisma.TonerInvoiceLineUncheckedUpdateManyInput>;
    where?: Prisma.TonerInvoiceLineWhereInput;
    limit?: number;
};
export type TonerInvoiceLineUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceLineUpdateManyMutationInput, Prisma.TonerInvoiceLineUncheckedUpdateManyInput>;
    where?: Prisma.TonerInvoiceLineWhereInput;
    limit?: number;
    include?: Prisma.TonerInvoiceLineIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerInvoiceLineUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerInvoiceLineCreateInput, Prisma.TonerInvoiceLineUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerInvoiceLineUpdateInput, Prisma.TonerInvoiceLineUncheckedUpdateInput>;
};
export type TonerInvoiceLineDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceLineWhereUniqueInput;
};
export type TonerInvoiceLineDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceLineWhereInput;
    limit?: number;
};
export type TonerInvoiceLineDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceLineSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceLineOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceLineInclude<ExtArgs> | null;
};
