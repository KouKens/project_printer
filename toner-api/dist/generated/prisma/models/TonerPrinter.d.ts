import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerPrinterModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerPrinterPayload>;
export type AggregateTonerPrinter = {
    _count: TonerPrinterCountAggregateOutputType | null;
    _avg: TonerPrinterAvgAggregateOutputType | null;
    _sum: TonerPrinterSumAggregateOutputType | null;
    _min: TonerPrinterMinAggregateOutputType | null;
    _max: TonerPrinterMaxAggregateOutputType | null;
};
export type TonerPrinterAvgAggregateOutputType = {
    printerAssetId: number | null;
};
export type TonerPrinterSumAggregateOutputType = {
    printerAssetId: number | null;
};
export type TonerPrinterMinAggregateOutputType = {
    tonerId: string | null;
    printerAssetId: number | null;
    createdAt: Date | null;
};
export type TonerPrinterMaxAggregateOutputType = {
    tonerId: string | null;
    printerAssetId: number | null;
    createdAt: Date | null;
};
export type TonerPrinterCountAggregateOutputType = {
    tonerId: number;
    printerAssetId: number;
    createdAt: number;
    _all: number;
};
export type TonerPrinterAvgAggregateInputType = {
    printerAssetId?: true;
};
export type TonerPrinterSumAggregateInputType = {
    printerAssetId?: true;
};
export type TonerPrinterMinAggregateInputType = {
    tonerId?: true;
    printerAssetId?: true;
    createdAt?: true;
};
export type TonerPrinterMaxAggregateInputType = {
    tonerId?: true;
    printerAssetId?: true;
    createdAt?: true;
};
export type TonerPrinterCountAggregateInputType = {
    tonerId?: true;
    printerAssetId?: true;
    createdAt?: true;
    _all?: true;
};
export type TonerPrinterAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPrinterWhereInput;
    orderBy?: Prisma.TonerPrinterOrderByWithRelationInput | Prisma.TonerPrinterOrderByWithRelationInput[];
    cursor?: Prisma.TonerPrinterWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerPrinterCountAggregateInputType;
    _avg?: TonerPrinterAvgAggregateInputType;
    _sum?: TonerPrinterSumAggregateInputType;
    _min?: TonerPrinterMinAggregateInputType;
    _max?: TonerPrinterMaxAggregateInputType;
};
export type GetTonerPrinterAggregateType<T extends TonerPrinterAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerPrinter]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerPrinter[P]> : Prisma.GetScalarType<T[P], AggregateTonerPrinter[P]>;
};
export type TonerPrinterGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPrinterWhereInput;
    orderBy?: Prisma.TonerPrinterOrderByWithAggregationInput | Prisma.TonerPrinterOrderByWithAggregationInput[];
    by: Prisma.TonerPrinterScalarFieldEnum[] | Prisma.TonerPrinterScalarFieldEnum;
    having?: Prisma.TonerPrinterScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerPrinterCountAggregateInputType | true;
    _avg?: TonerPrinterAvgAggregateInputType;
    _sum?: TonerPrinterSumAggregateInputType;
    _min?: TonerPrinterMinAggregateInputType;
    _max?: TonerPrinterMaxAggregateInputType;
};
export type TonerPrinterGroupByOutputType = {
    tonerId: string;
    printerAssetId: number;
    createdAt: Date;
    _count: TonerPrinterCountAggregateOutputType | null;
    _avg: TonerPrinterAvgAggregateOutputType | null;
    _sum: TonerPrinterSumAggregateOutputType | null;
    _min: TonerPrinterMinAggregateOutputType | null;
    _max: TonerPrinterMaxAggregateOutputType | null;
};
export type GetTonerPrinterGroupByPayload<T extends TonerPrinterGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerPrinterGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerPrinterGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerPrinterGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerPrinterGroupByOutputType[P]>;
}>>;
export type TonerPrinterWhereInput = {
    AND?: Prisma.TonerPrinterWhereInput | Prisma.TonerPrinterWhereInput[];
    OR?: Prisma.TonerPrinterWhereInput[];
    NOT?: Prisma.TonerPrinterWhereInput | Prisma.TonerPrinterWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerPrinter"> | string;
    printerAssetId?: Prisma.IntFilter<"TonerPrinter"> | number;
    createdAt?: Prisma.DateTimeFilter<"TonerPrinter"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
    asset?: Prisma.XOR<Prisma.PrinterAssetScalarRelationFilter, Prisma.PrinterAssetWhereInput>;
};
export type TonerPrinterOrderByWithRelationInput = {
    tonerId?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    toner?: Prisma.TonerOrderByWithRelationInput;
    asset?: Prisma.PrinterAssetOrderByWithRelationInput;
};
export type TonerPrinterWhereUniqueInput = Prisma.AtLeast<{
    tonerId_printerAssetId?: Prisma.TonerPrinterTonerIdPrinterAssetIdCompoundUniqueInput;
    AND?: Prisma.TonerPrinterWhereInput | Prisma.TonerPrinterWhereInput[];
    OR?: Prisma.TonerPrinterWhereInput[];
    NOT?: Prisma.TonerPrinterWhereInput | Prisma.TonerPrinterWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerPrinter"> | string;
    printerAssetId?: Prisma.IntFilter<"TonerPrinter"> | number;
    createdAt?: Prisma.DateTimeFilter<"TonerPrinter"> | Date | string;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
    asset?: Prisma.XOR<Prisma.PrinterAssetScalarRelationFilter, Prisma.PrinterAssetWhereInput>;
}, "tonerId_printerAssetId">;
export type TonerPrinterOrderByWithAggregationInput = {
    tonerId?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.TonerPrinterCountOrderByAggregateInput;
    _avg?: Prisma.TonerPrinterAvgOrderByAggregateInput;
    _max?: Prisma.TonerPrinterMaxOrderByAggregateInput;
    _min?: Prisma.TonerPrinterMinOrderByAggregateInput;
    _sum?: Prisma.TonerPrinterSumOrderByAggregateInput;
};
export type TonerPrinterScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerPrinterScalarWhereWithAggregatesInput | Prisma.TonerPrinterScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerPrinterScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerPrinterScalarWhereWithAggregatesInput | Prisma.TonerPrinterScalarWhereWithAggregatesInput[];
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerPrinter"> | string;
    printerAssetId?: Prisma.IntWithAggregatesFilter<"TonerPrinter"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TonerPrinter"> | Date | string;
};
export type TonerPrinterCreateInput = {
    createdAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutPrintersInput;
    asset: Prisma.PrinterAssetCreateNestedOneWithoutTonersInput;
};
export type TonerPrinterUncheckedCreateInput = {
    tonerId: string;
    printerAssetId: number;
    createdAt?: Date | string;
};
export type TonerPrinterUpdateInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutPrintersNestedInput;
    asset?: Prisma.PrinterAssetUpdateOneRequiredWithoutTonersNestedInput;
};
export type TonerPrinterUncheckedUpdateInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterCreateManyInput = {
    tonerId: string;
    printerAssetId: number;
    createdAt?: Date | string;
};
export type TonerPrinterUpdateManyMutationInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterUncheckedUpdateManyInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterListRelationFilter = {
    every?: Prisma.TonerPrinterWhereInput;
    some?: Prisma.TonerPrinterWhereInput;
    none?: Prisma.TonerPrinterWhereInput;
};
export type TonerPrinterOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerPrinterTonerIdPrinterAssetIdCompoundUniqueInput = {
    tonerId: string;
    printerAssetId: number;
};
export type TonerPrinterCountOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPrinterAvgOrderByAggregateInput = {
    printerAssetId?: Prisma.SortOrder;
};
export type TonerPrinterMaxOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPrinterMinOrderByAggregateInput = {
    tonerId?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerPrinterSumOrderByAggregateInput = {
    printerAssetId?: Prisma.SortOrder;
};
export type TonerPrinterCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput> | Prisma.TonerPrinterCreateWithoutTonerInput[] | Prisma.TonerPrinterUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutTonerInput | Prisma.TonerPrinterCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerPrinterCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
};
export type TonerPrinterUncheckedCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput> | Prisma.TonerPrinterCreateWithoutTonerInput[] | Prisma.TonerPrinterUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutTonerInput | Prisma.TonerPrinterCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerPrinterCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
};
export type TonerPrinterUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput> | Prisma.TonerPrinterCreateWithoutTonerInput[] | Prisma.TonerPrinterUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutTonerInput | Prisma.TonerPrinterCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerPrinterUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerPrinterUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerPrinterCreateManyTonerInputEnvelope;
    set?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    disconnect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    delete?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    update?: Prisma.TonerPrinterUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerPrinterUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerPrinterUpdateManyWithWhereWithoutTonerInput | Prisma.TonerPrinterUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
};
export type TonerPrinterUncheckedUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput> | Prisma.TonerPrinterCreateWithoutTonerInput[] | Prisma.TonerPrinterUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutTonerInput | Prisma.TonerPrinterCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerPrinterUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerPrinterUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerPrinterCreateManyTonerInputEnvelope;
    set?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    disconnect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    delete?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    update?: Prisma.TonerPrinterUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerPrinterUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerPrinterUpdateManyWithWhereWithoutTonerInput | Prisma.TonerPrinterUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type TonerPrinterCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput> | Prisma.TonerPrinterCreateWithoutAssetInput[] | Prisma.TonerPrinterUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutAssetInput | Prisma.TonerPrinterCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.TonerPrinterCreateManyAssetInputEnvelope;
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
};
export type TonerPrinterUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput> | Prisma.TonerPrinterCreateWithoutAssetInput[] | Prisma.TonerPrinterUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutAssetInput | Prisma.TonerPrinterCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.TonerPrinterCreateManyAssetInputEnvelope;
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
};
export type TonerPrinterUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput> | Prisma.TonerPrinterCreateWithoutAssetInput[] | Prisma.TonerPrinterUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutAssetInput | Prisma.TonerPrinterCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.TonerPrinterUpsertWithWhereUniqueWithoutAssetInput | Prisma.TonerPrinterUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.TonerPrinterCreateManyAssetInputEnvelope;
    set?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    disconnect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    delete?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    update?: Prisma.TonerPrinterUpdateWithWhereUniqueWithoutAssetInput | Prisma.TonerPrinterUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.TonerPrinterUpdateManyWithWhereWithoutAssetInput | Prisma.TonerPrinterUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
};
export type TonerPrinterUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput> | Prisma.TonerPrinterCreateWithoutAssetInput[] | Prisma.TonerPrinterUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.TonerPrinterCreateOrConnectWithoutAssetInput | Prisma.TonerPrinterCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.TonerPrinterUpsertWithWhereUniqueWithoutAssetInput | Prisma.TonerPrinterUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.TonerPrinterCreateManyAssetInputEnvelope;
    set?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    disconnect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    delete?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    connect?: Prisma.TonerPrinterWhereUniqueInput | Prisma.TonerPrinterWhereUniqueInput[];
    update?: Prisma.TonerPrinterUpdateWithWhereUniqueWithoutAssetInput | Prisma.TonerPrinterUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.TonerPrinterUpdateManyWithWhereWithoutAssetInput | Prisma.TonerPrinterUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
};
export type TonerPrinterCreateWithoutTonerInput = {
    createdAt?: Date | string;
    asset: Prisma.PrinterAssetCreateNestedOneWithoutTonersInput;
};
export type TonerPrinterUncheckedCreateWithoutTonerInput = {
    printerAssetId: number;
    createdAt?: Date | string;
};
export type TonerPrinterCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput>;
};
export type TonerPrinterCreateManyTonerInputEnvelope = {
    data: Prisma.TonerPrinterCreateManyTonerInput | Prisma.TonerPrinterCreateManyTonerInput[];
    skipDuplicates?: boolean;
};
export type TonerPrinterUpsertWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerPrinterUpdateWithoutTonerInput, Prisma.TonerPrinterUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerPrinterCreateWithoutTonerInput, Prisma.TonerPrinterUncheckedCreateWithoutTonerInput>;
};
export type TonerPrinterUpdateWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateWithoutTonerInput, Prisma.TonerPrinterUncheckedUpdateWithoutTonerInput>;
};
export type TonerPrinterUpdateManyWithWhereWithoutTonerInput = {
    where: Prisma.TonerPrinterScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateManyMutationInput, Prisma.TonerPrinterUncheckedUpdateManyWithoutTonerInput>;
};
export type TonerPrinterScalarWhereInput = {
    AND?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
    OR?: Prisma.TonerPrinterScalarWhereInput[];
    NOT?: Prisma.TonerPrinterScalarWhereInput | Prisma.TonerPrinterScalarWhereInput[];
    tonerId?: Prisma.StringFilter<"TonerPrinter"> | string;
    printerAssetId?: Prisma.IntFilter<"TonerPrinter"> | number;
    createdAt?: Prisma.DateTimeFilter<"TonerPrinter"> | Date | string;
};
export type TonerPrinterCreateWithoutAssetInput = {
    createdAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutPrintersInput;
};
export type TonerPrinterUncheckedCreateWithoutAssetInput = {
    tonerId: string;
    createdAt?: Date | string;
};
export type TonerPrinterCreateOrConnectWithoutAssetInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput>;
};
export type TonerPrinterCreateManyAssetInputEnvelope = {
    data: Prisma.TonerPrinterCreateManyAssetInput | Prisma.TonerPrinterCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type TonerPrinterUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerPrinterUpdateWithoutAssetInput, Prisma.TonerPrinterUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.TonerPrinterCreateWithoutAssetInput, Prisma.TonerPrinterUncheckedCreateWithoutAssetInput>;
};
export type TonerPrinterUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.TonerPrinterWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateWithoutAssetInput, Prisma.TonerPrinterUncheckedUpdateWithoutAssetInput>;
};
export type TonerPrinterUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.TonerPrinterScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateManyMutationInput, Prisma.TonerPrinterUncheckedUpdateManyWithoutAssetInput>;
};
export type TonerPrinterCreateManyTonerInput = {
    printerAssetId: number;
    createdAt?: Date | string;
};
export type TonerPrinterUpdateWithoutTonerInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    asset?: Prisma.PrinterAssetUpdateOneRequiredWithoutTonersNestedInput;
};
export type TonerPrinterUncheckedUpdateWithoutTonerInput = {
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterUncheckedUpdateManyWithoutTonerInput = {
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterCreateManyAssetInput = {
    tonerId: string;
    createdAt?: Date | string;
};
export type TonerPrinterUpdateWithoutAssetInput = {
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutPrintersNestedInput;
};
export type TonerPrinterUncheckedUpdateWithoutAssetInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterUncheckedUpdateManyWithoutAssetInput = {
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerPrinterSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    printerAssetId?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrinter"]>;
export type TonerPrinterSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    printerAssetId?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrinter"]>;
export type TonerPrinterSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    tonerId?: boolean;
    printerAssetId?: boolean;
    createdAt?: boolean;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerPrinter"]>;
export type TonerPrinterSelectScalar = {
    tonerId?: boolean;
    printerAssetId?: boolean;
    createdAt?: boolean;
};
export type TonerPrinterOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"tonerId" | "printerAssetId" | "createdAt", ExtArgs["result"]["tonerPrinter"]>;
export type TonerPrinterInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type TonerPrinterIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type TonerPrinterIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type $TonerPrinterPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerPrinter";
    objects: {
        toner: Prisma.$TonerPayload<ExtArgs>;
        asset: Prisma.$PrinterAssetPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        tonerId: string;
        printerAssetId: number;
        createdAt: Date;
    }, ExtArgs["result"]["tonerPrinter"]>;
    composites: {};
};
export type TonerPrinterGetPayload<S extends boolean | null | undefined | TonerPrinterDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload, S>;
export type TonerPrinterCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerPrinterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerPrinterCountAggregateInputType | true;
};
export interface TonerPrinterDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerPrinter'];
        meta: {
            name: 'TonerPrinter';
        };
    };
    findUnique<T extends TonerPrinterFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerPrinterFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerPrinterFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerPrinterFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerPrinterFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerPrinterFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerPrinterFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerPrinterFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerPrinterFindManyArgs>(args?: Prisma.SelectSubset<T, TonerPrinterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerPrinterCreateArgs>(args: Prisma.SelectSubset<T, TonerPrinterCreateArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerPrinterCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerPrinterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerPrinterCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerPrinterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerPrinterDeleteArgs>(args: Prisma.SelectSubset<T, TonerPrinterDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerPrinterUpdateArgs>(args: Prisma.SelectSubset<T, TonerPrinterUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerPrinterDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerPrinterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerPrinterUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerPrinterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerPrinterUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerPrinterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerPrinterUpsertArgs>(args: Prisma.SelectSubset<T, TonerPrinterUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerPrinterClient<runtime.Types.Result.GetResult<Prisma.$TonerPrinterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerPrinterCountArgs>(args?: Prisma.Subset<T, TonerPrinterCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerPrinterCountAggregateOutputType> : number>;
    aggregate<T extends TonerPrinterAggregateArgs>(args: Prisma.Subset<T, TonerPrinterAggregateArgs>): Prisma.PrismaPromise<GetTonerPrinterAggregateType<T>>;
    groupBy<T extends TonerPrinterGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerPrinterGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerPrinterGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerPrinterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerPrinterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerPrinterFieldRefs;
}
export interface Prisma__TonerPrinterClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    asset<T extends Prisma.PrinterAssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PrinterAssetDefaultArgs<ExtArgs>>): Prisma.Prisma__PrinterAssetClient<runtime.Types.Result.GetResult<Prisma.$PrinterAssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerPrinterFieldRefs {
    readonly tonerId: Prisma.FieldRef<"TonerPrinter", 'String'>;
    readonly printerAssetId: Prisma.FieldRef<"TonerPrinter", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"TonerPrinter", 'DateTime'>;
}
export type TonerPrinterFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where: Prisma.TonerPrinterWhereUniqueInput;
};
export type TonerPrinterFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where: Prisma.TonerPrinterWhereUniqueInput;
};
export type TonerPrinterFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where?: Prisma.TonerPrinterWhereInput;
    orderBy?: Prisma.TonerPrinterOrderByWithRelationInput | Prisma.TonerPrinterOrderByWithRelationInput[];
    cursor?: Prisma.TonerPrinterWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPrinterScalarFieldEnum | Prisma.TonerPrinterScalarFieldEnum[];
};
export type TonerPrinterFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where?: Prisma.TonerPrinterWhereInput;
    orderBy?: Prisma.TonerPrinterOrderByWithRelationInput | Prisma.TonerPrinterOrderByWithRelationInput[];
    cursor?: Prisma.TonerPrinterWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPrinterScalarFieldEnum | Prisma.TonerPrinterScalarFieldEnum[];
};
export type TonerPrinterFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where?: Prisma.TonerPrinterWhereInput;
    orderBy?: Prisma.TonerPrinterOrderByWithRelationInput | Prisma.TonerPrinterOrderByWithRelationInput[];
    cursor?: Prisma.TonerPrinterWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerPrinterScalarFieldEnum | Prisma.TonerPrinterScalarFieldEnum[];
};
export type TonerPrinterCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPrinterCreateInput, Prisma.TonerPrinterUncheckedCreateInput>;
};
export type TonerPrinterCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerPrinterCreateManyInput | Prisma.TonerPrinterCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerPrinterCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    data: Prisma.TonerPrinterCreateManyInput | Prisma.TonerPrinterCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerPrinterIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerPrinterUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateInput, Prisma.TonerPrinterUncheckedUpdateInput>;
    where: Prisma.TonerPrinterWhereUniqueInput;
};
export type TonerPrinterUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerPrinterUpdateManyMutationInput, Prisma.TonerPrinterUncheckedUpdateManyInput>;
    where?: Prisma.TonerPrinterWhereInput;
    limit?: number;
};
export type TonerPrinterUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerPrinterUpdateManyMutationInput, Prisma.TonerPrinterUncheckedUpdateManyInput>;
    where?: Prisma.TonerPrinterWhereInput;
    limit?: number;
    include?: Prisma.TonerPrinterIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerPrinterUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where: Prisma.TonerPrinterWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerPrinterCreateInput, Prisma.TonerPrinterUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerPrinterUpdateInput, Prisma.TonerPrinterUncheckedUpdateInput>;
};
export type TonerPrinterDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
    where: Prisma.TonerPrinterWhereUniqueInput;
};
export type TonerPrinterDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerPrinterWhereInput;
    limit?: number;
};
export type TonerPrinterDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerPrinterSelect<ExtArgs> | null;
    omit?: Prisma.TonerPrinterOmit<ExtArgs> | null;
    include?: Prisma.TonerPrinterInclude<ExtArgs> | null;
};
