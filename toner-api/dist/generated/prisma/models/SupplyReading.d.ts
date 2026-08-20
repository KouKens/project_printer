import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SupplyReadingModel = runtime.Types.Result.DefaultSelection<Prisma.$SupplyReadingPayload>;
export type AggregateSupplyReading = {
    _count: SupplyReadingCountAggregateOutputType | null;
    _avg: SupplyReadingAvgAggregateOutputType | null;
    _sum: SupplyReadingSumAggregateOutputType | null;
    _min: SupplyReadingMinAggregateOutputType | null;
    _max: SupplyReadingMaxAggregateOutputType | null;
};
export type SupplyReadingAvgAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    supplyIndex: number | null;
    supplyType: number | null;
    supplyClass: number | null;
    level: number | null;
    maxCapacity: number | null;
    percent: number | null;
};
export type SupplyReadingSumAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    supplyIndex: number | null;
    supplyType: number | null;
    supplyClass: number | null;
    level: number | null;
    maxCapacity: number | null;
    percent: number | null;
};
export type SupplyReadingMinAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    supplyIndex: number | null;
    name: string | null;
    supplyType: number | null;
    supplyClass: number | null;
    colorant: string | null;
    level: number | null;
    maxCapacity: number | null;
    percent: number | null;
    updatedAt: Date | null;
};
export type SupplyReadingMaxAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    supplyIndex: number | null;
    name: string | null;
    supplyType: number | null;
    supplyClass: number | null;
    colorant: string | null;
    level: number | null;
    maxCapacity: number | null;
    percent: number | null;
    updatedAt: Date | null;
};
export type SupplyReadingCountAggregateOutputType = {
    id: number;
    printerId: number;
    supplyIndex: number;
    name: number;
    supplyType: number;
    supplyClass: number;
    colorant: number;
    level: number;
    maxCapacity: number;
    percent: number;
    updatedAt: number;
    _all: number;
};
export type SupplyReadingAvgAggregateInputType = {
    id?: true;
    printerId?: true;
    supplyIndex?: true;
    supplyType?: true;
    supplyClass?: true;
    level?: true;
    maxCapacity?: true;
    percent?: true;
};
export type SupplyReadingSumAggregateInputType = {
    id?: true;
    printerId?: true;
    supplyIndex?: true;
    supplyType?: true;
    supplyClass?: true;
    level?: true;
    maxCapacity?: true;
    percent?: true;
};
export type SupplyReadingMinAggregateInputType = {
    id?: true;
    printerId?: true;
    supplyIndex?: true;
    name?: true;
    supplyType?: true;
    supplyClass?: true;
    colorant?: true;
    level?: true;
    maxCapacity?: true;
    percent?: true;
    updatedAt?: true;
};
export type SupplyReadingMaxAggregateInputType = {
    id?: true;
    printerId?: true;
    supplyIndex?: true;
    name?: true;
    supplyType?: true;
    supplyClass?: true;
    colorant?: true;
    level?: true;
    maxCapacity?: true;
    percent?: true;
    updatedAt?: true;
};
export type SupplyReadingCountAggregateInputType = {
    id?: true;
    printerId?: true;
    supplyIndex?: true;
    name?: true;
    supplyType?: true;
    supplyClass?: true;
    colorant?: true;
    level?: true;
    maxCapacity?: true;
    percent?: true;
    updatedAt?: true;
    _all?: true;
};
export type SupplyReadingAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplyReadingWhereInput;
    orderBy?: Prisma.SupplyReadingOrderByWithRelationInput | Prisma.SupplyReadingOrderByWithRelationInput[];
    cursor?: Prisma.SupplyReadingWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SupplyReadingCountAggregateInputType;
    _avg?: SupplyReadingAvgAggregateInputType;
    _sum?: SupplyReadingSumAggregateInputType;
    _min?: SupplyReadingMinAggregateInputType;
    _max?: SupplyReadingMaxAggregateInputType;
};
export type GetSupplyReadingAggregateType<T extends SupplyReadingAggregateArgs> = {
    [P in keyof T & keyof AggregateSupplyReading]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSupplyReading[P]> : Prisma.GetScalarType<T[P], AggregateSupplyReading[P]>;
};
export type SupplyReadingGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplyReadingWhereInput;
    orderBy?: Prisma.SupplyReadingOrderByWithAggregationInput | Prisma.SupplyReadingOrderByWithAggregationInput[];
    by: Prisma.SupplyReadingScalarFieldEnum[] | Prisma.SupplyReadingScalarFieldEnum;
    having?: Prisma.SupplyReadingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SupplyReadingCountAggregateInputType | true;
    _avg?: SupplyReadingAvgAggregateInputType;
    _sum?: SupplyReadingSumAggregateInputType;
    _min?: SupplyReadingMinAggregateInputType;
    _max?: SupplyReadingMaxAggregateInputType;
};
export type SupplyReadingGroupByOutputType = {
    id: number;
    printerId: number;
    supplyIndex: number;
    name: string;
    supplyType: number | null;
    supplyClass: number | null;
    colorant: string | null;
    level: number;
    maxCapacity: number;
    percent: number | null;
    updatedAt: Date;
    _count: SupplyReadingCountAggregateOutputType | null;
    _avg: SupplyReadingAvgAggregateOutputType | null;
    _sum: SupplyReadingSumAggregateOutputType | null;
    _min: SupplyReadingMinAggregateOutputType | null;
    _max: SupplyReadingMaxAggregateOutputType | null;
};
export type GetSupplyReadingGroupByPayload<T extends SupplyReadingGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SupplyReadingGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SupplyReadingGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SupplyReadingGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SupplyReadingGroupByOutputType[P]>;
}>>;
export type SupplyReadingWhereInput = {
    AND?: Prisma.SupplyReadingWhereInput | Prisma.SupplyReadingWhereInput[];
    OR?: Prisma.SupplyReadingWhereInput[];
    NOT?: Prisma.SupplyReadingWhereInput | Prisma.SupplyReadingWhereInput[];
    id?: Prisma.IntFilter<"SupplyReading"> | number;
    printerId?: Prisma.IntFilter<"SupplyReading"> | number;
    supplyIndex?: Prisma.IntFilter<"SupplyReading"> | number;
    name?: Prisma.StringFilter<"SupplyReading"> | string;
    supplyType?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    supplyClass?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    colorant?: Prisma.StringNullableFilter<"SupplyReading"> | string | null;
    level?: Prisma.IntFilter<"SupplyReading"> | number;
    maxCapacity?: Prisma.IntFilter<"SupplyReading"> | number;
    percent?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    updatedAt?: Prisma.DateTimeFilter<"SupplyReading"> | Date | string;
    printer?: Prisma.XOR<Prisma.PrinterScalarRelationFilter, Prisma.PrinterWhereInput>;
};
export type SupplyReadingOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrderInput | Prisma.SortOrder;
    supplyClass?: Prisma.SortOrderInput | Prisma.SortOrder;
    colorant?: Prisma.SortOrderInput | Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrderInput | Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    printer?: Prisma.PrinterOrderByWithRelationInput;
};
export type SupplyReadingWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    printerId_supplyIndex?: Prisma.SupplyReadingPrinterIdSupplyIndexCompoundUniqueInput;
    AND?: Prisma.SupplyReadingWhereInput | Prisma.SupplyReadingWhereInput[];
    OR?: Prisma.SupplyReadingWhereInput[];
    NOT?: Prisma.SupplyReadingWhereInput | Prisma.SupplyReadingWhereInput[];
    printerId?: Prisma.IntFilter<"SupplyReading"> | number;
    supplyIndex?: Prisma.IntFilter<"SupplyReading"> | number;
    name?: Prisma.StringFilter<"SupplyReading"> | string;
    supplyType?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    supplyClass?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    colorant?: Prisma.StringNullableFilter<"SupplyReading"> | string | null;
    level?: Prisma.IntFilter<"SupplyReading"> | number;
    maxCapacity?: Prisma.IntFilter<"SupplyReading"> | number;
    percent?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    updatedAt?: Prisma.DateTimeFilter<"SupplyReading"> | Date | string;
    printer?: Prisma.XOR<Prisma.PrinterScalarRelationFilter, Prisma.PrinterWhereInput>;
}, "id" | "printerId_supplyIndex">;
export type SupplyReadingOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrderInput | Prisma.SortOrder;
    supplyClass?: Prisma.SortOrderInput | Prisma.SortOrder;
    colorant?: Prisma.SortOrderInput | Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrderInput | Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SupplyReadingCountOrderByAggregateInput;
    _avg?: Prisma.SupplyReadingAvgOrderByAggregateInput;
    _max?: Prisma.SupplyReadingMaxOrderByAggregateInput;
    _min?: Prisma.SupplyReadingMinOrderByAggregateInput;
    _sum?: Prisma.SupplyReadingSumOrderByAggregateInput;
};
export type SupplyReadingScalarWhereWithAggregatesInput = {
    AND?: Prisma.SupplyReadingScalarWhereWithAggregatesInput | Prisma.SupplyReadingScalarWhereWithAggregatesInput[];
    OR?: Prisma.SupplyReadingScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SupplyReadingScalarWhereWithAggregatesInput | Prisma.SupplyReadingScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"SupplyReading"> | number;
    printerId?: Prisma.IntWithAggregatesFilter<"SupplyReading"> | number;
    supplyIndex?: Prisma.IntWithAggregatesFilter<"SupplyReading"> | number;
    name?: Prisma.StringWithAggregatesFilter<"SupplyReading"> | string;
    supplyType?: Prisma.IntNullableWithAggregatesFilter<"SupplyReading"> | number | null;
    supplyClass?: Prisma.IntNullableWithAggregatesFilter<"SupplyReading"> | number | null;
    colorant?: Prisma.StringNullableWithAggregatesFilter<"SupplyReading"> | string | null;
    level?: Prisma.IntWithAggregatesFilter<"SupplyReading"> | number;
    maxCapacity?: Prisma.IntWithAggregatesFilter<"SupplyReading"> | number;
    percent?: Prisma.IntNullableWithAggregatesFilter<"SupplyReading"> | number | null;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"SupplyReading"> | Date | string;
};
export type SupplyReadingCreateInput = {
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
    printer: Prisma.PrinterCreateNestedOneWithoutReadingsInput;
};
export type SupplyReadingUncheckedCreateInput = {
    id?: number;
    printerId: number;
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
};
export type SupplyReadingUpdateInput = {
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    printer?: Prisma.PrinterUpdateOneRequiredWithoutReadingsNestedInput;
};
export type SupplyReadingUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    printerId?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingCreateManyInput = {
    id?: number;
    printerId: number;
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
};
export type SupplyReadingUpdateManyMutationInput = {
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    printerId?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingListRelationFilter = {
    every?: Prisma.SupplyReadingWhereInput;
    some?: Prisma.SupplyReadingWhereInput;
    none?: Prisma.SupplyReadingWhereInput;
};
export type SupplyReadingOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SupplyReadingPrinterIdSupplyIndexCompoundUniqueInput = {
    printerId: number;
    supplyIndex: number;
};
export type SupplyReadingCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrder;
    supplyClass?: Prisma.SortOrder;
    colorant?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplyReadingAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrder;
    supplyClass?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrder;
};
export type SupplyReadingMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrder;
    supplyClass?: Prisma.SortOrder;
    colorant?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplyReadingMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrder;
    supplyClass?: Prisma.SortOrder;
    colorant?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplyReadingSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    supplyIndex?: Prisma.SortOrder;
    supplyType?: Prisma.SortOrder;
    supplyClass?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    maxCapacity?: Prisma.SortOrder;
    percent?: Prisma.SortOrder;
};
export type SupplyReadingCreateNestedManyWithoutPrinterInput = {
    create?: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput> | Prisma.SupplyReadingCreateWithoutPrinterInput[] | Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput | Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput[];
    createMany?: Prisma.SupplyReadingCreateManyPrinterInputEnvelope;
    connect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
};
export type SupplyReadingUncheckedCreateNestedManyWithoutPrinterInput = {
    create?: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput> | Prisma.SupplyReadingCreateWithoutPrinterInput[] | Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput | Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput[];
    createMany?: Prisma.SupplyReadingCreateManyPrinterInputEnvelope;
    connect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
};
export type SupplyReadingUpdateManyWithoutPrinterNestedInput = {
    create?: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput> | Prisma.SupplyReadingCreateWithoutPrinterInput[] | Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput | Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput[];
    upsert?: Prisma.SupplyReadingUpsertWithWhereUniqueWithoutPrinterInput | Prisma.SupplyReadingUpsertWithWhereUniqueWithoutPrinterInput[];
    createMany?: Prisma.SupplyReadingCreateManyPrinterInputEnvelope;
    set?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    disconnect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    delete?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    connect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    update?: Prisma.SupplyReadingUpdateWithWhereUniqueWithoutPrinterInput | Prisma.SupplyReadingUpdateWithWhereUniqueWithoutPrinterInput[];
    updateMany?: Prisma.SupplyReadingUpdateManyWithWhereWithoutPrinterInput | Prisma.SupplyReadingUpdateManyWithWhereWithoutPrinterInput[];
    deleteMany?: Prisma.SupplyReadingScalarWhereInput | Prisma.SupplyReadingScalarWhereInput[];
};
export type SupplyReadingUncheckedUpdateManyWithoutPrinterNestedInput = {
    create?: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput> | Prisma.SupplyReadingCreateWithoutPrinterInput[] | Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput | Prisma.SupplyReadingCreateOrConnectWithoutPrinterInput[];
    upsert?: Prisma.SupplyReadingUpsertWithWhereUniqueWithoutPrinterInput | Prisma.SupplyReadingUpsertWithWhereUniqueWithoutPrinterInput[];
    createMany?: Prisma.SupplyReadingCreateManyPrinterInputEnvelope;
    set?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    disconnect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    delete?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    connect?: Prisma.SupplyReadingWhereUniqueInput | Prisma.SupplyReadingWhereUniqueInput[];
    update?: Prisma.SupplyReadingUpdateWithWhereUniqueWithoutPrinterInput | Prisma.SupplyReadingUpdateWithWhereUniqueWithoutPrinterInput[];
    updateMany?: Prisma.SupplyReadingUpdateManyWithWhereWithoutPrinterInput | Prisma.SupplyReadingUpdateManyWithWhereWithoutPrinterInput[];
    deleteMany?: Prisma.SupplyReadingScalarWhereInput | Prisma.SupplyReadingScalarWhereInput[];
};
export type SupplyReadingCreateWithoutPrinterInput = {
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
};
export type SupplyReadingUncheckedCreateWithoutPrinterInput = {
    id?: number;
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
};
export type SupplyReadingCreateOrConnectWithoutPrinterInput = {
    where: Prisma.SupplyReadingWhereUniqueInput;
    create: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput>;
};
export type SupplyReadingCreateManyPrinterInputEnvelope = {
    data: Prisma.SupplyReadingCreateManyPrinterInput | Prisma.SupplyReadingCreateManyPrinterInput[];
    skipDuplicates?: boolean;
};
export type SupplyReadingUpsertWithWhereUniqueWithoutPrinterInput = {
    where: Prisma.SupplyReadingWhereUniqueInput;
    update: Prisma.XOR<Prisma.SupplyReadingUpdateWithoutPrinterInput, Prisma.SupplyReadingUncheckedUpdateWithoutPrinterInput>;
    create: Prisma.XOR<Prisma.SupplyReadingCreateWithoutPrinterInput, Prisma.SupplyReadingUncheckedCreateWithoutPrinterInput>;
};
export type SupplyReadingUpdateWithWhereUniqueWithoutPrinterInput = {
    where: Prisma.SupplyReadingWhereUniqueInput;
    data: Prisma.XOR<Prisma.SupplyReadingUpdateWithoutPrinterInput, Prisma.SupplyReadingUncheckedUpdateWithoutPrinterInput>;
};
export type SupplyReadingUpdateManyWithWhereWithoutPrinterInput = {
    where: Prisma.SupplyReadingScalarWhereInput;
    data: Prisma.XOR<Prisma.SupplyReadingUpdateManyMutationInput, Prisma.SupplyReadingUncheckedUpdateManyWithoutPrinterInput>;
};
export type SupplyReadingScalarWhereInput = {
    AND?: Prisma.SupplyReadingScalarWhereInput | Prisma.SupplyReadingScalarWhereInput[];
    OR?: Prisma.SupplyReadingScalarWhereInput[];
    NOT?: Prisma.SupplyReadingScalarWhereInput | Prisma.SupplyReadingScalarWhereInput[];
    id?: Prisma.IntFilter<"SupplyReading"> | number;
    printerId?: Prisma.IntFilter<"SupplyReading"> | number;
    supplyIndex?: Prisma.IntFilter<"SupplyReading"> | number;
    name?: Prisma.StringFilter<"SupplyReading"> | string;
    supplyType?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    supplyClass?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    colorant?: Prisma.StringNullableFilter<"SupplyReading"> | string | null;
    level?: Prisma.IntFilter<"SupplyReading"> | number;
    maxCapacity?: Prisma.IntFilter<"SupplyReading"> | number;
    percent?: Prisma.IntNullableFilter<"SupplyReading"> | number | null;
    updatedAt?: Prisma.DateTimeFilter<"SupplyReading"> | Date | string;
};
export type SupplyReadingCreateManyPrinterInput = {
    id?: number;
    supplyIndex: number;
    name: string;
    supplyType?: number | null;
    supplyClass?: number | null;
    colorant?: string | null;
    level: number;
    maxCapacity: number;
    percent?: number | null;
    updatedAt?: Date | string;
};
export type SupplyReadingUpdateWithoutPrinterInput = {
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingUncheckedUpdateWithoutPrinterInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingUncheckedUpdateManyWithoutPrinterInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    supplyIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    supplyType?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    supplyClass?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    colorant?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    maxCapacity?: Prisma.IntFieldUpdateOperationsInput | number;
    percent?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplyReadingSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    supplyIndex?: boolean;
    name?: boolean;
    supplyType?: boolean;
    supplyClass?: boolean;
    colorant?: boolean;
    level?: boolean;
    maxCapacity?: boolean;
    percent?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["supplyReading"]>;
export type SupplyReadingSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    supplyIndex?: boolean;
    name?: boolean;
    supplyType?: boolean;
    supplyClass?: boolean;
    colorant?: boolean;
    level?: boolean;
    maxCapacity?: boolean;
    percent?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["supplyReading"]>;
export type SupplyReadingSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    supplyIndex?: boolean;
    name?: boolean;
    supplyType?: boolean;
    supplyClass?: boolean;
    colorant?: boolean;
    level?: boolean;
    maxCapacity?: boolean;
    percent?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["supplyReading"]>;
export type SupplyReadingSelectScalar = {
    id?: boolean;
    printerId?: boolean;
    supplyIndex?: boolean;
    name?: boolean;
    supplyType?: boolean;
    supplyClass?: boolean;
    colorant?: boolean;
    level?: boolean;
    maxCapacity?: boolean;
    percent?: boolean;
    updatedAt?: boolean;
};
export type SupplyReadingOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "printerId" | "supplyIndex" | "name" | "supplyType" | "supplyClass" | "colorant" | "level" | "maxCapacity" | "percent" | "updatedAt", ExtArgs["result"]["supplyReading"]>;
export type SupplyReadingInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type SupplyReadingIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type SupplyReadingIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type $SupplyReadingPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SupplyReading";
    objects: {
        printer: Prisma.$PrinterPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        printerId: number;
        supplyIndex: number;
        name: string;
        supplyType: number | null;
        supplyClass: number | null;
        colorant: string | null;
        level: number;
        maxCapacity: number;
        percent: number | null;
        updatedAt: Date;
    }, ExtArgs["result"]["supplyReading"]>;
    composites: {};
};
export type SupplyReadingGetPayload<S extends boolean | null | undefined | SupplyReadingDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload, S>;
export type SupplyReadingCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SupplyReadingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SupplyReadingCountAggregateInputType | true;
};
export interface SupplyReadingDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SupplyReading'];
        meta: {
            name: 'SupplyReading';
        };
    };
    findUnique<T extends SupplyReadingFindUniqueArgs>(args: Prisma.SelectSubset<T, SupplyReadingFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SupplyReadingFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SupplyReadingFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SupplyReadingFindFirstArgs>(args?: Prisma.SelectSubset<T, SupplyReadingFindFirstArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SupplyReadingFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SupplyReadingFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SupplyReadingFindManyArgs>(args?: Prisma.SelectSubset<T, SupplyReadingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SupplyReadingCreateArgs>(args: Prisma.SelectSubset<T, SupplyReadingCreateArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SupplyReadingCreateManyArgs>(args?: Prisma.SelectSubset<T, SupplyReadingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SupplyReadingCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SupplyReadingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SupplyReadingDeleteArgs>(args: Prisma.SelectSubset<T, SupplyReadingDeleteArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SupplyReadingUpdateArgs>(args: Prisma.SelectSubset<T, SupplyReadingUpdateArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SupplyReadingDeleteManyArgs>(args?: Prisma.SelectSubset<T, SupplyReadingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SupplyReadingUpdateManyArgs>(args: Prisma.SelectSubset<T, SupplyReadingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SupplyReadingUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SupplyReadingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SupplyReadingUpsertArgs>(args: Prisma.SelectSubset<T, SupplyReadingUpsertArgs<ExtArgs>>): Prisma.Prisma__SupplyReadingClient<runtime.Types.Result.GetResult<Prisma.$SupplyReadingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SupplyReadingCountArgs>(args?: Prisma.Subset<T, SupplyReadingCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SupplyReadingCountAggregateOutputType> : number>;
    aggregate<T extends SupplyReadingAggregateArgs>(args: Prisma.Subset<T, SupplyReadingAggregateArgs>): Prisma.PrismaPromise<GetSupplyReadingAggregateType<T>>;
    groupBy<T extends SupplyReadingGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SupplyReadingGroupByArgs['orderBy'];
    } : {
        orderBy?: SupplyReadingGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SupplyReadingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSupplyReadingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SupplyReadingFieldRefs;
}
export interface Prisma__SupplyReadingClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    printer<T extends Prisma.PrinterDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PrinterDefaultArgs<ExtArgs>>): Prisma.Prisma__PrinterClient<runtime.Types.Result.GetResult<Prisma.$PrinterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SupplyReadingFieldRefs {
    readonly id: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly printerId: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly supplyIndex: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly name: Prisma.FieldRef<"SupplyReading", 'String'>;
    readonly supplyType: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly supplyClass: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly colorant: Prisma.FieldRef<"SupplyReading", 'String'>;
    readonly level: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly maxCapacity: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly percent: Prisma.FieldRef<"SupplyReading", 'Int'>;
    readonly updatedAt: Prisma.FieldRef<"SupplyReading", 'DateTime'>;
}
export type SupplyReadingFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where: Prisma.SupplyReadingWhereUniqueInput;
};
export type SupplyReadingFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where: Prisma.SupplyReadingWhereUniqueInput;
};
export type SupplyReadingFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where?: Prisma.SupplyReadingWhereInput;
    orderBy?: Prisma.SupplyReadingOrderByWithRelationInput | Prisma.SupplyReadingOrderByWithRelationInput[];
    cursor?: Prisma.SupplyReadingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplyReadingScalarFieldEnum | Prisma.SupplyReadingScalarFieldEnum[];
};
export type SupplyReadingFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where?: Prisma.SupplyReadingWhereInput;
    orderBy?: Prisma.SupplyReadingOrderByWithRelationInput | Prisma.SupplyReadingOrderByWithRelationInput[];
    cursor?: Prisma.SupplyReadingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplyReadingScalarFieldEnum | Prisma.SupplyReadingScalarFieldEnum[];
};
export type SupplyReadingFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where?: Prisma.SupplyReadingWhereInput;
    orderBy?: Prisma.SupplyReadingOrderByWithRelationInput | Prisma.SupplyReadingOrderByWithRelationInput[];
    cursor?: Prisma.SupplyReadingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplyReadingScalarFieldEnum | Prisma.SupplyReadingScalarFieldEnum[];
};
export type SupplyReadingCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplyReadingCreateInput, Prisma.SupplyReadingUncheckedCreateInput>;
};
export type SupplyReadingCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SupplyReadingCreateManyInput | Prisma.SupplyReadingCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SupplyReadingCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    data: Prisma.SupplyReadingCreateManyInput | Prisma.SupplyReadingCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SupplyReadingIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SupplyReadingUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplyReadingUpdateInput, Prisma.SupplyReadingUncheckedUpdateInput>;
    where: Prisma.SupplyReadingWhereUniqueInput;
};
export type SupplyReadingUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SupplyReadingUpdateManyMutationInput, Prisma.SupplyReadingUncheckedUpdateManyInput>;
    where?: Prisma.SupplyReadingWhereInput;
    limit?: number;
};
export type SupplyReadingUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplyReadingUpdateManyMutationInput, Prisma.SupplyReadingUncheckedUpdateManyInput>;
    where?: Prisma.SupplyReadingWhereInput;
    limit?: number;
    include?: Prisma.SupplyReadingIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SupplyReadingUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where: Prisma.SupplyReadingWhereUniqueInput;
    create: Prisma.XOR<Prisma.SupplyReadingCreateInput, Prisma.SupplyReadingUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SupplyReadingUpdateInput, Prisma.SupplyReadingUncheckedUpdateInput>;
};
export type SupplyReadingDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
    where: Prisma.SupplyReadingWhereUniqueInput;
};
export type SupplyReadingDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplyReadingWhereInput;
    limit?: number;
};
export type SupplyReadingDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplyReadingSelect<ExtArgs> | null;
    omit?: Prisma.SupplyReadingOmit<ExtArgs> | null;
    include?: Prisma.SupplyReadingInclude<ExtArgs> | null;
};
