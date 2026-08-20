import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PrinterAlertModel = runtime.Types.Result.DefaultSelection<Prisma.$PrinterAlertPayload>;
export type AggregatePrinterAlert = {
    _count: PrinterAlertCountAggregateOutputType | null;
    _avg: PrinterAlertAvgAggregateOutputType | null;
    _sum: PrinterAlertSumAggregateOutputType | null;
    _min: PrinterAlertMinAggregateOutputType | null;
    _max: PrinterAlertMaxAggregateOutputType | null;
};
export type PrinterAlertAvgAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    alertIndex: number | null;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
};
export type PrinterAlertSumAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    alertIndex: number | null;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
};
export type PrinterAlertMinAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    alertIndex: number | null;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
    updatedAt: Date | null;
};
export type PrinterAlertMaxAggregateOutputType = {
    id: number | null;
    printerId: number | null;
    alertIndex: number | null;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
    updatedAt: Date | null;
};
export type PrinterAlertCountAggregateOutputType = {
    id: number;
    printerId: number;
    alertIndex: number;
    severity: number;
    alertGroup: number;
    groupIndex: number;
    code: number;
    description: number;
    updatedAt: number;
    _all: number;
};
export type PrinterAlertAvgAggregateInputType = {
    id?: true;
    printerId?: true;
    alertIndex?: true;
    severity?: true;
    alertGroup?: true;
    groupIndex?: true;
    code?: true;
};
export type PrinterAlertSumAggregateInputType = {
    id?: true;
    printerId?: true;
    alertIndex?: true;
    severity?: true;
    alertGroup?: true;
    groupIndex?: true;
    code?: true;
};
export type PrinterAlertMinAggregateInputType = {
    id?: true;
    printerId?: true;
    alertIndex?: true;
    severity?: true;
    alertGroup?: true;
    groupIndex?: true;
    code?: true;
    description?: true;
    updatedAt?: true;
};
export type PrinterAlertMaxAggregateInputType = {
    id?: true;
    printerId?: true;
    alertIndex?: true;
    severity?: true;
    alertGroup?: true;
    groupIndex?: true;
    code?: true;
    description?: true;
    updatedAt?: true;
};
export type PrinterAlertCountAggregateInputType = {
    id?: true;
    printerId?: true;
    alertIndex?: true;
    severity?: true;
    alertGroup?: true;
    groupIndex?: true;
    code?: true;
    description?: true;
    updatedAt?: true;
    _all?: true;
};
export type PrinterAlertAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PrinterAlertWhereInput;
    orderBy?: Prisma.PrinterAlertOrderByWithRelationInput | Prisma.PrinterAlertOrderByWithRelationInput[];
    cursor?: Prisma.PrinterAlertWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PrinterAlertCountAggregateInputType;
    _avg?: PrinterAlertAvgAggregateInputType;
    _sum?: PrinterAlertSumAggregateInputType;
    _min?: PrinterAlertMinAggregateInputType;
    _max?: PrinterAlertMaxAggregateInputType;
};
export type GetPrinterAlertAggregateType<T extends PrinterAlertAggregateArgs> = {
    [P in keyof T & keyof AggregatePrinterAlert]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePrinterAlert[P]> : Prisma.GetScalarType<T[P], AggregatePrinterAlert[P]>;
};
export type PrinterAlertGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PrinterAlertWhereInput;
    orderBy?: Prisma.PrinterAlertOrderByWithAggregationInput | Prisma.PrinterAlertOrderByWithAggregationInput[];
    by: Prisma.PrinterAlertScalarFieldEnum[] | Prisma.PrinterAlertScalarFieldEnum;
    having?: Prisma.PrinterAlertScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PrinterAlertCountAggregateInputType | true;
    _avg?: PrinterAlertAvgAggregateInputType;
    _sum?: PrinterAlertSumAggregateInputType;
    _min?: PrinterAlertMinAggregateInputType;
    _max?: PrinterAlertMaxAggregateInputType;
};
export type PrinterAlertGroupByOutputType = {
    id: number;
    printerId: number;
    alertIndex: number;
    severity: number | null;
    alertGroup: number | null;
    groupIndex: number | null;
    code: number | null;
    description: string | null;
    updatedAt: Date;
    _count: PrinterAlertCountAggregateOutputType | null;
    _avg: PrinterAlertAvgAggregateOutputType | null;
    _sum: PrinterAlertSumAggregateOutputType | null;
    _min: PrinterAlertMinAggregateOutputType | null;
    _max: PrinterAlertMaxAggregateOutputType | null;
};
export type GetPrinterAlertGroupByPayload<T extends PrinterAlertGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PrinterAlertGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PrinterAlertGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PrinterAlertGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PrinterAlertGroupByOutputType[P]>;
}>>;
export type PrinterAlertWhereInput = {
    AND?: Prisma.PrinterAlertWhereInput | Prisma.PrinterAlertWhereInput[];
    OR?: Prisma.PrinterAlertWhereInput[];
    NOT?: Prisma.PrinterAlertWhereInput | Prisma.PrinterAlertWhereInput[];
    id?: Prisma.IntFilter<"PrinterAlert"> | number;
    printerId?: Prisma.IntFilter<"PrinterAlert"> | number;
    alertIndex?: Prisma.IntFilter<"PrinterAlert"> | number;
    severity?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    alertGroup?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    groupIndex?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    code?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    description?: Prisma.StringNullableFilter<"PrinterAlert"> | string | null;
    updatedAt?: Prisma.DateTimeFilter<"PrinterAlert"> | Date | string;
    printer?: Prisma.XOR<Prisma.PrinterScalarRelationFilter, Prisma.PrinterWhereInput>;
};
export type PrinterAlertOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrderInput | Prisma.SortOrder;
    alertGroup?: Prisma.SortOrderInput | Prisma.SortOrder;
    groupIndex?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    printer?: Prisma.PrinterOrderByWithRelationInput;
};
export type PrinterAlertWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    printerId_alertIndex?: Prisma.PrinterAlertPrinterIdAlertIndexCompoundUniqueInput;
    AND?: Prisma.PrinterAlertWhereInput | Prisma.PrinterAlertWhereInput[];
    OR?: Prisma.PrinterAlertWhereInput[];
    NOT?: Prisma.PrinterAlertWhereInput | Prisma.PrinterAlertWhereInput[];
    printerId?: Prisma.IntFilter<"PrinterAlert"> | number;
    alertIndex?: Prisma.IntFilter<"PrinterAlert"> | number;
    severity?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    alertGroup?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    groupIndex?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    code?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    description?: Prisma.StringNullableFilter<"PrinterAlert"> | string | null;
    updatedAt?: Prisma.DateTimeFilter<"PrinterAlert"> | Date | string;
    printer?: Prisma.XOR<Prisma.PrinterScalarRelationFilter, Prisma.PrinterWhereInput>;
}, "id" | "printerId_alertIndex">;
export type PrinterAlertOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrderInput | Prisma.SortOrder;
    alertGroup?: Prisma.SortOrderInput | Prisma.SortOrder;
    groupIndex?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PrinterAlertCountOrderByAggregateInput;
    _avg?: Prisma.PrinterAlertAvgOrderByAggregateInput;
    _max?: Prisma.PrinterAlertMaxOrderByAggregateInput;
    _min?: Prisma.PrinterAlertMinOrderByAggregateInput;
    _sum?: Prisma.PrinterAlertSumOrderByAggregateInput;
};
export type PrinterAlertScalarWhereWithAggregatesInput = {
    AND?: Prisma.PrinterAlertScalarWhereWithAggregatesInput | Prisma.PrinterAlertScalarWhereWithAggregatesInput[];
    OR?: Prisma.PrinterAlertScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PrinterAlertScalarWhereWithAggregatesInput | Prisma.PrinterAlertScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"PrinterAlert"> | number;
    printerId?: Prisma.IntWithAggregatesFilter<"PrinterAlert"> | number;
    alertIndex?: Prisma.IntWithAggregatesFilter<"PrinterAlert"> | number;
    severity?: Prisma.IntNullableWithAggregatesFilter<"PrinterAlert"> | number | null;
    alertGroup?: Prisma.IntNullableWithAggregatesFilter<"PrinterAlert"> | number | null;
    groupIndex?: Prisma.IntNullableWithAggregatesFilter<"PrinterAlert"> | number | null;
    code?: Prisma.IntNullableWithAggregatesFilter<"PrinterAlert"> | number | null;
    description?: Prisma.StringNullableWithAggregatesFilter<"PrinterAlert"> | string | null;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"PrinterAlert"> | Date | string;
};
export type PrinterAlertCreateInput = {
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
    printer: Prisma.PrinterCreateNestedOneWithoutAlertsInput;
};
export type PrinterAlertUncheckedCreateInput = {
    id?: number;
    printerId: number;
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
};
export type PrinterAlertUpdateInput = {
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    printer?: Prisma.PrinterUpdateOneRequiredWithoutAlertsNestedInput;
};
export type PrinterAlertUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    printerId?: Prisma.IntFieldUpdateOperationsInput | number;
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertCreateManyInput = {
    id?: number;
    printerId: number;
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
};
export type PrinterAlertUpdateManyMutationInput = {
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    printerId?: Prisma.IntFieldUpdateOperationsInput | number;
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertListRelationFilter = {
    every?: Prisma.PrinterAlertWhereInput;
    some?: Prisma.PrinterAlertWhereInput;
    none?: Prisma.PrinterAlertWhereInput;
};
export type PrinterAlertOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PrinterAlertPrinterIdAlertIndexCompoundUniqueInput = {
    printerId: number;
    alertIndex: number;
};
export type PrinterAlertCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    alertGroup?: Prisma.SortOrder;
    groupIndex?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PrinterAlertAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    alertGroup?: Prisma.SortOrder;
    groupIndex?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
};
export type PrinterAlertMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    alertGroup?: Prisma.SortOrder;
    groupIndex?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PrinterAlertMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    alertGroup?: Prisma.SortOrder;
    groupIndex?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PrinterAlertSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerId?: Prisma.SortOrder;
    alertIndex?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    alertGroup?: Prisma.SortOrder;
    groupIndex?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
};
export type PrinterAlertCreateNestedManyWithoutPrinterInput = {
    create?: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput> | Prisma.PrinterAlertCreateWithoutPrinterInput[] | Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput | Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput[];
    createMany?: Prisma.PrinterAlertCreateManyPrinterInputEnvelope;
    connect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
};
export type PrinterAlertUncheckedCreateNestedManyWithoutPrinterInput = {
    create?: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput> | Prisma.PrinterAlertCreateWithoutPrinterInput[] | Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput | Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput[];
    createMany?: Prisma.PrinterAlertCreateManyPrinterInputEnvelope;
    connect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
};
export type PrinterAlertUpdateManyWithoutPrinterNestedInput = {
    create?: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput> | Prisma.PrinterAlertCreateWithoutPrinterInput[] | Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput | Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput[];
    upsert?: Prisma.PrinterAlertUpsertWithWhereUniqueWithoutPrinterInput | Prisma.PrinterAlertUpsertWithWhereUniqueWithoutPrinterInput[];
    createMany?: Prisma.PrinterAlertCreateManyPrinterInputEnvelope;
    set?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    disconnect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    delete?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    connect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    update?: Prisma.PrinterAlertUpdateWithWhereUniqueWithoutPrinterInput | Prisma.PrinterAlertUpdateWithWhereUniqueWithoutPrinterInput[];
    updateMany?: Prisma.PrinterAlertUpdateManyWithWhereWithoutPrinterInput | Prisma.PrinterAlertUpdateManyWithWhereWithoutPrinterInput[];
    deleteMany?: Prisma.PrinterAlertScalarWhereInput | Prisma.PrinterAlertScalarWhereInput[];
};
export type PrinterAlertUncheckedUpdateManyWithoutPrinterNestedInput = {
    create?: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput> | Prisma.PrinterAlertCreateWithoutPrinterInput[] | Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput[];
    connectOrCreate?: Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput | Prisma.PrinterAlertCreateOrConnectWithoutPrinterInput[];
    upsert?: Prisma.PrinterAlertUpsertWithWhereUniqueWithoutPrinterInput | Prisma.PrinterAlertUpsertWithWhereUniqueWithoutPrinterInput[];
    createMany?: Prisma.PrinterAlertCreateManyPrinterInputEnvelope;
    set?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    disconnect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    delete?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    connect?: Prisma.PrinterAlertWhereUniqueInput | Prisma.PrinterAlertWhereUniqueInput[];
    update?: Prisma.PrinterAlertUpdateWithWhereUniqueWithoutPrinterInput | Prisma.PrinterAlertUpdateWithWhereUniqueWithoutPrinterInput[];
    updateMany?: Prisma.PrinterAlertUpdateManyWithWhereWithoutPrinterInput | Prisma.PrinterAlertUpdateManyWithWhereWithoutPrinterInput[];
    deleteMany?: Prisma.PrinterAlertScalarWhereInput | Prisma.PrinterAlertScalarWhereInput[];
};
export type PrinterAlertCreateWithoutPrinterInput = {
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
};
export type PrinterAlertUncheckedCreateWithoutPrinterInput = {
    id?: number;
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
};
export type PrinterAlertCreateOrConnectWithoutPrinterInput = {
    where: Prisma.PrinterAlertWhereUniqueInput;
    create: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput>;
};
export type PrinterAlertCreateManyPrinterInputEnvelope = {
    data: Prisma.PrinterAlertCreateManyPrinterInput | Prisma.PrinterAlertCreateManyPrinterInput[];
    skipDuplicates?: boolean;
};
export type PrinterAlertUpsertWithWhereUniqueWithoutPrinterInput = {
    where: Prisma.PrinterAlertWhereUniqueInput;
    update: Prisma.XOR<Prisma.PrinterAlertUpdateWithoutPrinterInput, Prisma.PrinterAlertUncheckedUpdateWithoutPrinterInput>;
    create: Prisma.XOR<Prisma.PrinterAlertCreateWithoutPrinterInput, Prisma.PrinterAlertUncheckedCreateWithoutPrinterInput>;
};
export type PrinterAlertUpdateWithWhereUniqueWithoutPrinterInput = {
    where: Prisma.PrinterAlertWhereUniqueInput;
    data: Prisma.XOR<Prisma.PrinterAlertUpdateWithoutPrinterInput, Prisma.PrinterAlertUncheckedUpdateWithoutPrinterInput>;
};
export type PrinterAlertUpdateManyWithWhereWithoutPrinterInput = {
    where: Prisma.PrinterAlertScalarWhereInput;
    data: Prisma.XOR<Prisma.PrinterAlertUpdateManyMutationInput, Prisma.PrinterAlertUncheckedUpdateManyWithoutPrinterInput>;
};
export type PrinterAlertScalarWhereInput = {
    AND?: Prisma.PrinterAlertScalarWhereInput | Prisma.PrinterAlertScalarWhereInput[];
    OR?: Prisma.PrinterAlertScalarWhereInput[];
    NOT?: Prisma.PrinterAlertScalarWhereInput | Prisma.PrinterAlertScalarWhereInput[];
    id?: Prisma.IntFilter<"PrinterAlert"> | number;
    printerId?: Prisma.IntFilter<"PrinterAlert"> | number;
    alertIndex?: Prisma.IntFilter<"PrinterAlert"> | number;
    severity?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    alertGroup?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    groupIndex?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    code?: Prisma.IntNullableFilter<"PrinterAlert"> | number | null;
    description?: Prisma.StringNullableFilter<"PrinterAlert"> | string | null;
    updatedAt?: Prisma.DateTimeFilter<"PrinterAlert"> | Date | string;
};
export type PrinterAlertCreateManyPrinterInput = {
    id?: number;
    alertIndex: number;
    severity?: number | null;
    alertGroup?: number | null;
    groupIndex?: number | null;
    code?: number | null;
    description?: string | null;
    updatedAt?: Date | string;
};
export type PrinterAlertUpdateWithoutPrinterInput = {
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertUncheckedUpdateWithoutPrinterInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertUncheckedUpdateManyWithoutPrinterInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    alertIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    severity?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    alertGroup?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    groupIndex?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    code?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PrinterAlertSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    alertIndex?: boolean;
    severity?: boolean;
    alertGroup?: boolean;
    groupIndex?: boolean;
    code?: boolean;
    description?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["printerAlert"]>;
export type PrinterAlertSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    alertIndex?: boolean;
    severity?: boolean;
    alertGroup?: boolean;
    groupIndex?: boolean;
    code?: boolean;
    description?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["printerAlert"]>;
export type PrinterAlertSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    printerId?: boolean;
    alertIndex?: boolean;
    severity?: boolean;
    alertGroup?: boolean;
    groupIndex?: boolean;
    code?: boolean;
    description?: boolean;
    updatedAt?: boolean;
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["printerAlert"]>;
export type PrinterAlertSelectScalar = {
    id?: boolean;
    printerId?: boolean;
    alertIndex?: boolean;
    severity?: boolean;
    alertGroup?: boolean;
    groupIndex?: boolean;
    code?: boolean;
    description?: boolean;
    updatedAt?: boolean;
};
export type PrinterAlertOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "printerId" | "alertIndex" | "severity" | "alertGroup" | "groupIndex" | "code" | "description" | "updatedAt", ExtArgs["result"]["printerAlert"]>;
export type PrinterAlertInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type PrinterAlertIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type PrinterAlertIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    printer?: boolean | Prisma.PrinterDefaultArgs<ExtArgs>;
};
export type $PrinterAlertPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PrinterAlert";
    objects: {
        printer: Prisma.$PrinterPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        printerId: number;
        alertIndex: number;
        severity: number | null;
        alertGroup: number | null;
        groupIndex: number | null;
        code: number | null;
        description: string | null;
        updatedAt: Date;
    }, ExtArgs["result"]["printerAlert"]>;
    composites: {};
};
export type PrinterAlertGetPayload<S extends boolean | null | undefined | PrinterAlertDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload, S>;
export type PrinterAlertCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PrinterAlertFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PrinterAlertCountAggregateInputType | true;
};
export interface PrinterAlertDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PrinterAlert'];
        meta: {
            name: 'PrinterAlert';
        };
    };
    findUnique<T extends PrinterAlertFindUniqueArgs>(args: Prisma.SelectSubset<T, PrinterAlertFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PrinterAlertFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PrinterAlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PrinterAlertFindFirstArgs>(args?: Prisma.SelectSubset<T, PrinterAlertFindFirstArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PrinterAlertFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PrinterAlertFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PrinterAlertFindManyArgs>(args?: Prisma.SelectSubset<T, PrinterAlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PrinterAlertCreateArgs>(args: Prisma.SelectSubset<T, PrinterAlertCreateArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PrinterAlertCreateManyArgs>(args?: Prisma.SelectSubset<T, PrinterAlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PrinterAlertCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PrinterAlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PrinterAlertDeleteArgs>(args: Prisma.SelectSubset<T, PrinterAlertDeleteArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PrinterAlertUpdateArgs>(args: Prisma.SelectSubset<T, PrinterAlertUpdateArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PrinterAlertDeleteManyArgs>(args?: Prisma.SelectSubset<T, PrinterAlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PrinterAlertUpdateManyArgs>(args: Prisma.SelectSubset<T, PrinterAlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PrinterAlertUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PrinterAlertUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PrinterAlertUpsertArgs>(args: Prisma.SelectSubset<T, PrinterAlertUpsertArgs<ExtArgs>>): Prisma.Prisma__PrinterAlertClient<runtime.Types.Result.GetResult<Prisma.$PrinterAlertPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PrinterAlertCountArgs>(args?: Prisma.Subset<T, PrinterAlertCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PrinterAlertCountAggregateOutputType> : number>;
    aggregate<T extends PrinterAlertAggregateArgs>(args: Prisma.Subset<T, PrinterAlertAggregateArgs>): Prisma.PrismaPromise<GetPrinterAlertAggregateType<T>>;
    groupBy<T extends PrinterAlertGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PrinterAlertGroupByArgs['orderBy'];
    } : {
        orderBy?: PrinterAlertGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PrinterAlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPrinterAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PrinterAlertFieldRefs;
}
export interface Prisma__PrinterAlertClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    printer<T extends Prisma.PrinterDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PrinterDefaultArgs<ExtArgs>>): Prisma.Prisma__PrinterClient<runtime.Types.Result.GetResult<Prisma.$PrinterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PrinterAlertFieldRefs {
    readonly id: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly printerId: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly alertIndex: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly severity: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly alertGroup: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly groupIndex: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly code: Prisma.FieldRef<"PrinterAlert", 'Int'>;
    readonly description: Prisma.FieldRef<"PrinterAlert", 'String'>;
    readonly updatedAt: Prisma.FieldRef<"PrinterAlert", 'DateTime'>;
}
export type PrinterAlertFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where: Prisma.PrinterAlertWhereUniqueInput;
};
export type PrinterAlertFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where: Prisma.PrinterAlertWhereUniqueInput;
};
export type PrinterAlertFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where?: Prisma.PrinterAlertWhereInput;
    orderBy?: Prisma.PrinterAlertOrderByWithRelationInput | Prisma.PrinterAlertOrderByWithRelationInput[];
    cursor?: Prisma.PrinterAlertWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PrinterAlertScalarFieldEnum | Prisma.PrinterAlertScalarFieldEnum[];
};
export type PrinterAlertFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where?: Prisma.PrinterAlertWhereInput;
    orderBy?: Prisma.PrinterAlertOrderByWithRelationInput | Prisma.PrinterAlertOrderByWithRelationInput[];
    cursor?: Prisma.PrinterAlertWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PrinterAlertScalarFieldEnum | Prisma.PrinterAlertScalarFieldEnum[];
};
export type PrinterAlertFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where?: Prisma.PrinterAlertWhereInput;
    orderBy?: Prisma.PrinterAlertOrderByWithRelationInput | Prisma.PrinterAlertOrderByWithRelationInput[];
    cursor?: Prisma.PrinterAlertWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PrinterAlertScalarFieldEnum | Prisma.PrinterAlertScalarFieldEnum[];
};
export type PrinterAlertCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PrinterAlertCreateInput, Prisma.PrinterAlertUncheckedCreateInput>;
};
export type PrinterAlertCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PrinterAlertCreateManyInput | Prisma.PrinterAlertCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PrinterAlertCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    data: Prisma.PrinterAlertCreateManyInput | Prisma.PrinterAlertCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PrinterAlertIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PrinterAlertUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PrinterAlertUpdateInput, Prisma.PrinterAlertUncheckedUpdateInput>;
    where: Prisma.PrinterAlertWhereUniqueInput;
};
export type PrinterAlertUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PrinterAlertUpdateManyMutationInput, Prisma.PrinterAlertUncheckedUpdateManyInput>;
    where?: Prisma.PrinterAlertWhereInput;
    limit?: number;
};
export type PrinterAlertUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PrinterAlertUpdateManyMutationInput, Prisma.PrinterAlertUncheckedUpdateManyInput>;
    where?: Prisma.PrinterAlertWhereInput;
    limit?: number;
    include?: Prisma.PrinterAlertIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PrinterAlertUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where: Prisma.PrinterAlertWhereUniqueInput;
    create: Prisma.XOR<Prisma.PrinterAlertCreateInput, Prisma.PrinterAlertUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PrinterAlertUpdateInput, Prisma.PrinterAlertUncheckedUpdateInput>;
};
export type PrinterAlertDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
    where: Prisma.PrinterAlertWhereUniqueInput;
};
export type PrinterAlertDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PrinterAlertWhereInput;
    limit?: number;
};
export type PrinterAlertDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PrinterAlertSelect<ExtArgs> | null;
    omit?: Prisma.PrinterAlertOmit<ExtArgs> | null;
    include?: Prisma.PrinterAlertInclude<ExtArgs> | null;
};
