import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RepairRecordModel = runtime.Types.Result.DefaultSelection<Prisma.$RepairRecordPayload>;
export type AggregateRepairRecord = {
    _count: RepairRecordCountAggregateOutputType | null;
    _avg: RepairRecordAvgAggregateOutputType | null;
    _sum: RepairRecordSumAggregateOutputType | null;
    _min: RepairRecordMinAggregateOutputType | null;
    _max: RepairRecordMaxAggregateOutputType | null;
};
export type RepairRecordAvgAggregateOutputType = {
    id: number | null;
    printerAssetId: number | null;
};
export type RepairRecordSumAggregateOutputType = {
    id: number | null;
    printerAssetId: number | null;
};
export type RepairRecordMinAggregateOutputType = {
    id: number | null;
    assignee: string | null;
    printerAssetId: number | null;
    occurredOn: Date | null;
    category: $Enums.RepairCategory | null;
    handledBy: $Enums.RepairHandler | null;
    detail: string | null;
    restoredOn: Date | null;
    status: $Enums.RepairStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type RepairRecordMaxAggregateOutputType = {
    id: number | null;
    assignee: string | null;
    printerAssetId: number | null;
    occurredOn: Date | null;
    category: $Enums.RepairCategory | null;
    handledBy: $Enums.RepairHandler | null;
    detail: string | null;
    restoredOn: Date | null;
    status: $Enums.RepairStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type RepairRecordCountAggregateOutputType = {
    id: number;
    assignee: number;
    printerAssetId: number;
    occurredOn: number;
    category: number;
    handledBy: number;
    detail: number;
    restoredOn: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type RepairRecordAvgAggregateInputType = {
    id?: true;
    printerAssetId?: true;
};
export type RepairRecordSumAggregateInputType = {
    id?: true;
    printerAssetId?: true;
};
export type RepairRecordMinAggregateInputType = {
    id?: true;
    assignee?: true;
    printerAssetId?: true;
    occurredOn?: true;
    category?: true;
    handledBy?: true;
    detail?: true;
    restoredOn?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type RepairRecordMaxAggregateInputType = {
    id?: true;
    assignee?: true;
    printerAssetId?: true;
    occurredOn?: true;
    category?: true;
    handledBy?: true;
    detail?: true;
    restoredOn?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type RepairRecordCountAggregateInputType = {
    id?: true;
    assignee?: true;
    printerAssetId?: true;
    occurredOn?: true;
    category?: true;
    handledBy?: true;
    detail?: true;
    restoredOn?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type RepairRecordAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RepairRecordWhereInput;
    orderBy?: Prisma.RepairRecordOrderByWithRelationInput | Prisma.RepairRecordOrderByWithRelationInput[];
    cursor?: Prisma.RepairRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RepairRecordCountAggregateInputType;
    _avg?: RepairRecordAvgAggregateInputType;
    _sum?: RepairRecordSumAggregateInputType;
    _min?: RepairRecordMinAggregateInputType;
    _max?: RepairRecordMaxAggregateInputType;
};
export type GetRepairRecordAggregateType<T extends RepairRecordAggregateArgs> = {
    [P in keyof T & keyof AggregateRepairRecord]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRepairRecord[P]> : Prisma.GetScalarType<T[P], AggregateRepairRecord[P]>;
};
export type RepairRecordGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RepairRecordWhereInput;
    orderBy?: Prisma.RepairRecordOrderByWithAggregationInput | Prisma.RepairRecordOrderByWithAggregationInput[];
    by: Prisma.RepairRecordScalarFieldEnum[] | Prisma.RepairRecordScalarFieldEnum;
    having?: Prisma.RepairRecordScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RepairRecordCountAggregateInputType | true;
    _avg?: RepairRecordAvgAggregateInputType;
    _sum?: RepairRecordSumAggregateInputType;
    _min?: RepairRecordMinAggregateInputType;
    _max?: RepairRecordMaxAggregateInputType;
};
export type RepairRecordGroupByOutputType = {
    id: number;
    assignee: string | null;
    printerAssetId: number;
    occurredOn: Date | null;
    category: $Enums.RepairCategory | null;
    handledBy: $Enums.RepairHandler;
    detail: string | null;
    restoredOn: Date;
    status: $Enums.RepairStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: RepairRecordCountAggregateOutputType | null;
    _avg: RepairRecordAvgAggregateOutputType | null;
    _sum: RepairRecordSumAggregateOutputType | null;
    _min: RepairRecordMinAggregateOutputType | null;
    _max: RepairRecordMaxAggregateOutputType | null;
};
export type GetRepairRecordGroupByPayload<T extends RepairRecordGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RepairRecordGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RepairRecordGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RepairRecordGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RepairRecordGroupByOutputType[P]>;
}>>;
export type RepairRecordWhereInput = {
    AND?: Prisma.RepairRecordWhereInput | Prisma.RepairRecordWhereInput[];
    OR?: Prisma.RepairRecordWhereInput[];
    NOT?: Prisma.RepairRecordWhereInput | Prisma.RepairRecordWhereInput[];
    id?: Prisma.IntFilter<"RepairRecord"> | number;
    assignee?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    printerAssetId?: Prisma.IntFilter<"RepairRecord"> | number;
    occurredOn?: Prisma.DateTimeNullableFilter<"RepairRecord"> | Date | string | null;
    category?: Prisma.EnumRepairCategoryNullableFilter<"RepairRecord"> | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFilter<"RepairRecord"> | $Enums.RepairHandler;
    detail?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    restoredOn?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    status?: Prisma.EnumRepairStatusFilter<"RepairRecord"> | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    asset?: Prisma.XOR<Prisma.PrinterAssetScalarRelationFilter, Prisma.PrinterAssetWhereInput>;
};
export type RepairRecordOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    assignee?: Prisma.SortOrderInput | Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    occurredOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    category?: Prisma.SortOrderInput | Prisma.SortOrder;
    handledBy?: Prisma.SortOrder;
    detail?: Prisma.SortOrderInput | Prisma.SortOrder;
    restoredOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    asset?: Prisma.PrinterAssetOrderByWithRelationInput;
};
export type RepairRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.RepairRecordWhereInput | Prisma.RepairRecordWhereInput[];
    OR?: Prisma.RepairRecordWhereInput[];
    NOT?: Prisma.RepairRecordWhereInput | Prisma.RepairRecordWhereInput[];
    assignee?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    printerAssetId?: Prisma.IntFilter<"RepairRecord"> | number;
    occurredOn?: Prisma.DateTimeNullableFilter<"RepairRecord"> | Date | string | null;
    category?: Prisma.EnumRepairCategoryNullableFilter<"RepairRecord"> | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFilter<"RepairRecord"> | $Enums.RepairHandler;
    detail?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    restoredOn?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    status?: Prisma.EnumRepairStatusFilter<"RepairRecord"> | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    asset?: Prisma.XOR<Prisma.PrinterAssetScalarRelationFilter, Prisma.PrinterAssetWhereInput>;
}, "id">;
export type RepairRecordOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    assignee?: Prisma.SortOrderInput | Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    occurredOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    category?: Prisma.SortOrderInput | Prisma.SortOrder;
    handledBy?: Prisma.SortOrder;
    detail?: Prisma.SortOrderInput | Prisma.SortOrder;
    restoredOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.RepairRecordCountOrderByAggregateInput;
    _avg?: Prisma.RepairRecordAvgOrderByAggregateInput;
    _max?: Prisma.RepairRecordMaxOrderByAggregateInput;
    _min?: Prisma.RepairRecordMinOrderByAggregateInput;
    _sum?: Prisma.RepairRecordSumOrderByAggregateInput;
};
export type RepairRecordScalarWhereWithAggregatesInput = {
    AND?: Prisma.RepairRecordScalarWhereWithAggregatesInput | Prisma.RepairRecordScalarWhereWithAggregatesInput[];
    OR?: Prisma.RepairRecordScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RepairRecordScalarWhereWithAggregatesInput | Prisma.RepairRecordScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"RepairRecord"> | number;
    assignee?: Prisma.StringNullableWithAggregatesFilter<"RepairRecord"> | string | null;
    printerAssetId?: Prisma.IntWithAggregatesFilter<"RepairRecord"> | number;
    occurredOn?: Prisma.DateTimeNullableWithAggregatesFilter<"RepairRecord"> | Date | string | null;
    category?: Prisma.EnumRepairCategoryNullableWithAggregatesFilter<"RepairRecord"> | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerWithAggregatesFilter<"RepairRecord"> | $Enums.RepairHandler;
    detail?: Prisma.StringNullableWithAggregatesFilter<"RepairRecord"> | string | null;
    restoredOn?: Prisma.DateTimeWithAggregatesFilter<"RepairRecord"> | Date | string;
    status?: Prisma.EnumRepairStatusWithAggregatesFilter<"RepairRecord"> | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"RepairRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"RepairRecord"> | Date | string;
};
export type RepairRecordCreateInput = {
    assignee?: string | null;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    asset: Prisma.PrinterAssetCreateNestedOneWithoutRepairsInput;
};
export type RepairRecordUncheckedCreateInput = {
    id?: number;
    assignee?: string | null;
    printerAssetId: number;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RepairRecordUpdateInput = {
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    asset?: Prisma.PrinterAssetUpdateOneRequiredWithoutRepairsNestedInput;
};
export type RepairRecordUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordCreateManyInput = {
    id?: number;
    assignee?: string | null;
    printerAssetId: number;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RepairRecordUpdateManyMutationInput = {
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    printerAssetId?: Prisma.IntFieldUpdateOperationsInput | number;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordListRelationFilter = {
    every?: Prisma.RepairRecordWhereInput;
    some?: Prisma.RepairRecordWhereInput;
    none?: Prisma.RepairRecordWhereInput;
};
export type RepairRecordOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RepairRecordCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    assignee?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    occurredOn?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    handledBy?: Prisma.SortOrder;
    detail?: Prisma.SortOrder;
    restoredOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RepairRecordAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
};
export type RepairRecordMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    assignee?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    occurredOn?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    handledBy?: Prisma.SortOrder;
    detail?: Prisma.SortOrder;
    restoredOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RepairRecordMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    assignee?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
    occurredOn?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    handledBy?: Prisma.SortOrder;
    detail?: Prisma.SortOrder;
    restoredOn?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RepairRecordSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    printerAssetId?: Prisma.SortOrder;
};
export type RepairRecordCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput> | Prisma.RepairRecordCreateWithoutAssetInput[] | Prisma.RepairRecordUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.RepairRecordCreateOrConnectWithoutAssetInput | Prisma.RepairRecordCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.RepairRecordCreateManyAssetInputEnvelope;
    connect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
};
export type RepairRecordUncheckedCreateNestedManyWithoutAssetInput = {
    create?: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput> | Prisma.RepairRecordCreateWithoutAssetInput[] | Prisma.RepairRecordUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.RepairRecordCreateOrConnectWithoutAssetInput | Prisma.RepairRecordCreateOrConnectWithoutAssetInput[];
    createMany?: Prisma.RepairRecordCreateManyAssetInputEnvelope;
    connect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
};
export type RepairRecordUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput> | Prisma.RepairRecordCreateWithoutAssetInput[] | Prisma.RepairRecordUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.RepairRecordCreateOrConnectWithoutAssetInput | Prisma.RepairRecordCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.RepairRecordUpsertWithWhereUniqueWithoutAssetInput | Prisma.RepairRecordUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.RepairRecordCreateManyAssetInputEnvelope;
    set?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    disconnect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    delete?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    connect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    update?: Prisma.RepairRecordUpdateWithWhereUniqueWithoutAssetInput | Prisma.RepairRecordUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.RepairRecordUpdateManyWithWhereWithoutAssetInput | Prisma.RepairRecordUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.RepairRecordScalarWhereInput | Prisma.RepairRecordScalarWhereInput[];
};
export type RepairRecordUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput> | Prisma.RepairRecordCreateWithoutAssetInput[] | Prisma.RepairRecordUncheckedCreateWithoutAssetInput[];
    connectOrCreate?: Prisma.RepairRecordCreateOrConnectWithoutAssetInput | Prisma.RepairRecordCreateOrConnectWithoutAssetInput[];
    upsert?: Prisma.RepairRecordUpsertWithWhereUniqueWithoutAssetInput | Prisma.RepairRecordUpsertWithWhereUniqueWithoutAssetInput[];
    createMany?: Prisma.RepairRecordCreateManyAssetInputEnvelope;
    set?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    disconnect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    delete?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    connect?: Prisma.RepairRecordWhereUniqueInput | Prisma.RepairRecordWhereUniqueInput[];
    update?: Prisma.RepairRecordUpdateWithWhereUniqueWithoutAssetInput | Prisma.RepairRecordUpdateWithWhereUniqueWithoutAssetInput[];
    updateMany?: Prisma.RepairRecordUpdateManyWithWhereWithoutAssetInput | Prisma.RepairRecordUpdateManyWithWhereWithoutAssetInput[];
    deleteMany?: Prisma.RepairRecordScalarWhereInput | Prisma.RepairRecordScalarWhereInput[];
};
export type NullableEnumRepairCategoryFieldUpdateOperationsInput = {
    set?: $Enums.RepairCategory | null;
};
export type EnumRepairHandlerFieldUpdateOperationsInput = {
    set?: $Enums.RepairHandler;
};
export type EnumRepairStatusFieldUpdateOperationsInput = {
    set?: $Enums.RepairStatus;
};
export type RepairRecordCreateWithoutAssetInput = {
    assignee?: string | null;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RepairRecordUncheckedCreateWithoutAssetInput = {
    id?: number;
    assignee?: string | null;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RepairRecordCreateOrConnectWithoutAssetInput = {
    where: Prisma.RepairRecordWhereUniqueInput;
    create: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput>;
};
export type RepairRecordCreateManyAssetInputEnvelope = {
    data: Prisma.RepairRecordCreateManyAssetInput | Prisma.RepairRecordCreateManyAssetInput[];
    skipDuplicates?: boolean;
};
export type RepairRecordUpsertWithWhereUniqueWithoutAssetInput = {
    where: Prisma.RepairRecordWhereUniqueInput;
    update: Prisma.XOR<Prisma.RepairRecordUpdateWithoutAssetInput, Prisma.RepairRecordUncheckedUpdateWithoutAssetInput>;
    create: Prisma.XOR<Prisma.RepairRecordCreateWithoutAssetInput, Prisma.RepairRecordUncheckedCreateWithoutAssetInput>;
};
export type RepairRecordUpdateWithWhereUniqueWithoutAssetInput = {
    where: Prisma.RepairRecordWhereUniqueInput;
    data: Prisma.XOR<Prisma.RepairRecordUpdateWithoutAssetInput, Prisma.RepairRecordUncheckedUpdateWithoutAssetInput>;
};
export type RepairRecordUpdateManyWithWhereWithoutAssetInput = {
    where: Prisma.RepairRecordScalarWhereInput;
    data: Prisma.XOR<Prisma.RepairRecordUpdateManyMutationInput, Prisma.RepairRecordUncheckedUpdateManyWithoutAssetInput>;
};
export type RepairRecordScalarWhereInput = {
    AND?: Prisma.RepairRecordScalarWhereInput | Prisma.RepairRecordScalarWhereInput[];
    OR?: Prisma.RepairRecordScalarWhereInput[];
    NOT?: Prisma.RepairRecordScalarWhereInput | Prisma.RepairRecordScalarWhereInput[];
    id?: Prisma.IntFilter<"RepairRecord"> | number;
    assignee?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    printerAssetId?: Prisma.IntFilter<"RepairRecord"> | number;
    occurredOn?: Prisma.DateTimeNullableFilter<"RepairRecord"> | Date | string | null;
    category?: Prisma.EnumRepairCategoryNullableFilter<"RepairRecord"> | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFilter<"RepairRecord"> | $Enums.RepairHandler;
    detail?: Prisma.StringNullableFilter<"RepairRecord"> | string | null;
    restoredOn?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    status?: Prisma.EnumRepairStatusFilter<"RepairRecord"> | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"RepairRecord"> | Date | string;
};
export type RepairRecordCreateManyAssetInput = {
    id?: number;
    assignee?: string | null;
    occurredOn?: Date | string | null;
    category?: $Enums.RepairCategory | null;
    handledBy?: $Enums.RepairHandler;
    detail?: string | null;
    restoredOn: Date | string;
    status?: $Enums.RepairStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RepairRecordUpdateWithoutAssetInput = {
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordUncheckedUpdateWithoutAssetInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordUncheckedUpdateManyWithoutAssetInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    assignee?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    occurredOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    category?: Prisma.NullableEnumRepairCategoryFieldUpdateOperationsInput | $Enums.RepairCategory | null;
    handledBy?: Prisma.EnumRepairHandlerFieldUpdateOperationsInput | $Enums.RepairHandler;
    detail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    restoredOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumRepairStatusFieldUpdateOperationsInput | $Enums.RepairStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RepairRecordSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    assignee?: boolean;
    printerAssetId?: boolean;
    occurredOn?: boolean;
    category?: boolean;
    handledBy?: boolean;
    detail?: boolean;
    restoredOn?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["repairRecord"]>;
export type RepairRecordSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    assignee?: boolean;
    printerAssetId?: boolean;
    occurredOn?: boolean;
    category?: boolean;
    handledBy?: boolean;
    detail?: boolean;
    restoredOn?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["repairRecord"]>;
export type RepairRecordSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    assignee?: boolean;
    printerAssetId?: boolean;
    occurredOn?: boolean;
    category?: boolean;
    handledBy?: boolean;
    detail?: boolean;
    restoredOn?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["repairRecord"]>;
export type RepairRecordSelectScalar = {
    id?: boolean;
    assignee?: boolean;
    printerAssetId?: boolean;
    occurredOn?: boolean;
    category?: boolean;
    handledBy?: boolean;
    detail?: boolean;
    restoredOn?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type RepairRecordOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "assignee" | "printerAssetId" | "occurredOn" | "category" | "handledBy" | "detail" | "restoredOn" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["repairRecord"]>;
export type RepairRecordInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type RepairRecordIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type RepairRecordIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    asset?: boolean | Prisma.PrinterAssetDefaultArgs<ExtArgs>;
};
export type $RepairRecordPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RepairRecord";
    objects: {
        asset: Prisma.$PrinterAssetPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        assignee: string | null;
        printerAssetId: number;
        occurredOn: Date | null;
        category: $Enums.RepairCategory | null;
        handledBy: $Enums.RepairHandler;
        detail: string | null;
        restoredOn: Date;
        status: $Enums.RepairStatus;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["repairRecord"]>;
    composites: {};
};
export type RepairRecordGetPayload<S extends boolean | null | undefined | RepairRecordDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload, S>;
export type RepairRecordCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RepairRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RepairRecordCountAggregateInputType | true;
};
export interface RepairRecordDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RepairRecord'];
        meta: {
            name: 'RepairRecord';
        };
    };
    findUnique<T extends RepairRecordFindUniqueArgs>(args: Prisma.SelectSubset<T, RepairRecordFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RepairRecordFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RepairRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RepairRecordFindFirstArgs>(args?: Prisma.SelectSubset<T, RepairRecordFindFirstArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RepairRecordFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RepairRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RepairRecordFindManyArgs>(args?: Prisma.SelectSubset<T, RepairRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RepairRecordCreateArgs>(args: Prisma.SelectSubset<T, RepairRecordCreateArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RepairRecordCreateManyArgs>(args?: Prisma.SelectSubset<T, RepairRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RepairRecordCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RepairRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RepairRecordDeleteArgs>(args: Prisma.SelectSubset<T, RepairRecordDeleteArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RepairRecordUpdateArgs>(args: Prisma.SelectSubset<T, RepairRecordUpdateArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RepairRecordDeleteManyArgs>(args?: Prisma.SelectSubset<T, RepairRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RepairRecordUpdateManyArgs>(args: Prisma.SelectSubset<T, RepairRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RepairRecordUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RepairRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RepairRecordUpsertArgs>(args: Prisma.SelectSubset<T, RepairRecordUpsertArgs<ExtArgs>>): Prisma.Prisma__RepairRecordClient<runtime.Types.Result.GetResult<Prisma.$RepairRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RepairRecordCountArgs>(args?: Prisma.Subset<T, RepairRecordCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RepairRecordCountAggregateOutputType> : number>;
    aggregate<T extends RepairRecordAggregateArgs>(args: Prisma.Subset<T, RepairRecordAggregateArgs>): Prisma.PrismaPromise<GetRepairRecordAggregateType<T>>;
    groupBy<T extends RepairRecordGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RepairRecordGroupByArgs['orderBy'];
    } : {
        orderBy?: RepairRecordGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RepairRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRepairRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RepairRecordFieldRefs;
}
export interface Prisma__RepairRecordClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    asset<T extends Prisma.PrinterAssetDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PrinterAssetDefaultArgs<ExtArgs>>): Prisma.Prisma__PrinterAssetClient<runtime.Types.Result.GetResult<Prisma.$PrinterAssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RepairRecordFieldRefs {
    readonly id: Prisma.FieldRef<"RepairRecord", 'Int'>;
    readonly assignee: Prisma.FieldRef<"RepairRecord", 'String'>;
    readonly printerAssetId: Prisma.FieldRef<"RepairRecord", 'Int'>;
    readonly occurredOn: Prisma.FieldRef<"RepairRecord", 'DateTime'>;
    readonly category: Prisma.FieldRef<"RepairRecord", 'RepairCategory'>;
    readonly handledBy: Prisma.FieldRef<"RepairRecord", 'RepairHandler'>;
    readonly detail: Prisma.FieldRef<"RepairRecord", 'String'>;
    readonly restoredOn: Prisma.FieldRef<"RepairRecord", 'DateTime'>;
    readonly status: Prisma.FieldRef<"RepairRecord", 'RepairStatus'>;
    readonly createdAt: Prisma.FieldRef<"RepairRecord", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"RepairRecord", 'DateTime'>;
}
export type RepairRecordFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where: Prisma.RepairRecordWhereUniqueInput;
};
export type RepairRecordFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where: Prisma.RepairRecordWhereUniqueInput;
};
export type RepairRecordFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where?: Prisma.RepairRecordWhereInput;
    orderBy?: Prisma.RepairRecordOrderByWithRelationInput | Prisma.RepairRecordOrderByWithRelationInput[];
    cursor?: Prisma.RepairRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RepairRecordScalarFieldEnum | Prisma.RepairRecordScalarFieldEnum[];
};
export type RepairRecordFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where?: Prisma.RepairRecordWhereInput;
    orderBy?: Prisma.RepairRecordOrderByWithRelationInput | Prisma.RepairRecordOrderByWithRelationInput[];
    cursor?: Prisma.RepairRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RepairRecordScalarFieldEnum | Prisma.RepairRecordScalarFieldEnum[];
};
export type RepairRecordFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where?: Prisma.RepairRecordWhereInput;
    orderBy?: Prisma.RepairRecordOrderByWithRelationInput | Prisma.RepairRecordOrderByWithRelationInput[];
    cursor?: Prisma.RepairRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RepairRecordScalarFieldEnum | Prisma.RepairRecordScalarFieldEnum[];
};
export type RepairRecordCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RepairRecordCreateInput, Prisma.RepairRecordUncheckedCreateInput>;
};
export type RepairRecordCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RepairRecordCreateManyInput | Prisma.RepairRecordCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RepairRecordCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    data: Prisma.RepairRecordCreateManyInput | Prisma.RepairRecordCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RepairRecordIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RepairRecordUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RepairRecordUpdateInput, Prisma.RepairRecordUncheckedUpdateInput>;
    where: Prisma.RepairRecordWhereUniqueInput;
};
export type RepairRecordUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RepairRecordUpdateManyMutationInput, Prisma.RepairRecordUncheckedUpdateManyInput>;
    where?: Prisma.RepairRecordWhereInput;
    limit?: number;
};
export type RepairRecordUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RepairRecordUpdateManyMutationInput, Prisma.RepairRecordUncheckedUpdateManyInput>;
    where?: Prisma.RepairRecordWhereInput;
    limit?: number;
    include?: Prisma.RepairRecordIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RepairRecordUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where: Prisma.RepairRecordWhereUniqueInput;
    create: Prisma.XOR<Prisma.RepairRecordCreateInput, Prisma.RepairRecordUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RepairRecordUpdateInput, Prisma.RepairRecordUncheckedUpdateInput>;
};
export type RepairRecordDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
    where: Prisma.RepairRecordWhereUniqueInput;
};
export type RepairRecordDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RepairRecordWhereInput;
    limit?: number;
};
export type RepairRecordDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RepairRecordSelect<ExtArgs> | null;
    omit?: Prisma.RepairRecordOmit<ExtArgs> | null;
    include?: Prisma.RepairRecordInclude<ExtArgs> | null;
};
