import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerEntryModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerEntryPayload>;
export type AggregateTonerEntry = {
    _count: TonerEntryCountAggregateOutputType | null;
    _avg: TonerEntryAvgAggregateOutputType | null;
    _sum: TonerEntrySumAggregateOutputType | null;
    _min: TonerEntryMinAggregateOutputType | null;
    _max: TonerEntryMaxAggregateOutputType | null;
};
export type TonerEntryAvgAggregateOutputType = {
    id: number | null;
    companyId: number | null;
    quantity: number | null;
    balance: number | null;
};
export type TonerEntrySumAggregateOutputType = {
    id: number | null;
    companyId: number | null;
    quantity: number | null;
    balance: number | null;
};
export type TonerEntryMinAggregateOutputType = {
    id: number | null;
    userId: string | null;
    tonerId: string | null;
    action: $Enums.TonerAction | null;
    companyId: number | null;
    quantity: number | null;
    balance: number | null;
    receivedOn: Date | null;
    createdAt: Date | null;
};
export type TonerEntryMaxAggregateOutputType = {
    id: number | null;
    userId: string | null;
    tonerId: string | null;
    action: $Enums.TonerAction | null;
    companyId: number | null;
    quantity: number | null;
    balance: number | null;
    receivedOn: Date | null;
    createdAt: Date | null;
};
export type TonerEntryCountAggregateOutputType = {
    id: number;
    userId: number;
    tonerId: number;
    action: number;
    companyId: number;
    quantity: number;
    balance: number;
    receivedOn: number;
    createdAt: number;
    _all: number;
};
export type TonerEntryAvgAggregateInputType = {
    id?: true;
    companyId?: true;
    quantity?: true;
    balance?: true;
};
export type TonerEntrySumAggregateInputType = {
    id?: true;
    companyId?: true;
    quantity?: true;
    balance?: true;
};
export type TonerEntryMinAggregateInputType = {
    id?: true;
    userId?: true;
    tonerId?: true;
    action?: true;
    companyId?: true;
    quantity?: true;
    balance?: true;
    receivedOn?: true;
    createdAt?: true;
};
export type TonerEntryMaxAggregateInputType = {
    id?: true;
    userId?: true;
    tonerId?: true;
    action?: true;
    companyId?: true;
    quantity?: true;
    balance?: true;
    receivedOn?: true;
    createdAt?: true;
};
export type TonerEntryCountAggregateInputType = {
    id?: true;
    userId?: true;
    tonerId?: true;
    action?: true;
    companyId?: true;
    quantity?: true;
    balance?: true;
    receivedOn?: true;
    createdAt?: true;
    _all?: true;
};
export type TonerEntryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerEntryWhereInput;
    orderBy?: Prisma.TonerEntryOrderByWithRelationInput | Prisma.TonerEntryOrderByWithRelationInput[];
    cursor?: Prisma.TonerEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerEntryCountAggregateInputType;
    _avg?: TonerEntryAvgAggregateInputType;
    _sum?: TonerEntrySumAggregateInputType;
    _min?: TonerEntryMinAggregateInputType;
    _max?: TonerEntryMaxAggregateInputType;
};
export type GetTonerEntryAggregateType<T extends TonerEntryAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerEntry]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerEntry[P]> : Prisma.GetScalarType<T[P], AggregateTonerEntry[P]>;
};
export type TonerEntryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerEntryWhereInput;
    orderBy?: Prisma.TonerEntryOrderByWithAggregationInput | Prisma.TonerEntryOrderByWithAggregationInput[];
    by: Prisma.TonerEntryScalarFieldEnum[] | Prisma.TonerEntryScalarFieldEnum;
    having?: Prisma.TonerEntryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerEntryCountAggregateInputType | true;
    _avg?: TonerEntryAvgAggregateInputType;
    _sum?: TonerEntrySumAggregateInputType;
    _min?: TonerEntryMinAggregateInputType;
    _max?: TonerEntryMaxAggregateInputType;
};
export type TonerEntryGroupByOutputType = {
    id: number;
    userId: string;
    tonerId: string;
    action: $Enums.TonerAction;
    companyId: number;
    quantity: number;
    balance: number;
    receivedOn: Date | null;
    createdAt: Date;
    _count: TonerEntryCountAggregateOutputType | null;
    _avg: TonerEntryAvgAggregateOutputType | null;
    _sum: TonerEntrySumAggregateOutputType | null;
    _min: TonerEntryMinAggregateOutputType | null;
    _max: TonerEntryMaxAggregateOutputType | null;
};
export type GetTonerEntryGroupByPayload<T extends TonerEntryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerEntryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerEntryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerEntryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerEntryGroupByOutputType[P]>;
}>>;
export type TonerEntryWhereInput = {
    AND?: Prisma.TonerEntryWhereInput | Prisma.TonerEntryWhereInput[];
    OR?: Prisma.TonerEntryWhereInput[];
    NOT?: Prisma.TonerEntryWhereInput | Prisma.TonerEntryWhereInput[];
    id?: Prisma.IntFilter<"TonerEntry"> | number;
    userId?: Prisma.StringFilter<"TonerEntry"> | string;
    tonerId?: Prisma.StringFilter<"TonerEntry"> | string;
    action?: Prisma.EnumTonerActionFilter<"TonerEntry"> | $Enums.TonerAction;
    companyId?: Prisma.IntFilter<"TonerEntry"> | number;
    quantity?: Prisma.IntFilter<"TonerEntry"> | number;
    balance?: Prisma.IntFilter<"TonerEntry"> | number;
    receivedOn?: Prisma.DateTimeNullableFilter<"TonerEntry"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerEntry"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
};
export type TonerEntryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
    receivedOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    toner?: Prisma.TonerOrderByWithRelationInput;
};
export type TonerEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TonerEntryWhereInput | Prisma.TonerEntryWhereInput[];
    OR?: Prisma.TonerEntryWhereInput[];
    NOT?: Prisma.TonerEntryWhereInput | Prisma.TonerEntryWhereInput[];
    userId?: Prisma.StringFilter<"TonerEntry"> | string;
    tonerId?: Prisma.StringFilter<"TonerEntry"> | string;
    action?: Prisma.EnumTonerActionFilter<"TonerEntry"> | $Enums.TonerAction;
    companyId?: Prisma.IntFilter<"TonerEntry"> | number;
    quantity?: Prisma.IntFilter<"TonerEntry"> | number;
    balance?: Prisma.IntFilter<"TonerEntry"> | number;
    receivedOn?: Prisma.DateTimeNullableFilter<"TonerEntry"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerEntry"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    toner?: Prisma.XOR<Prisma.TonerScalarRelationFilter, Prisma.TonerWhereInput>;
}, "id">;
export type TonerEntryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
    receivedOn?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.TonerEntryCountOrderByAggregateInput;
    _avg?: Prisma.TonerEntryAvgOrderByAggregateInput;
    _max?: Prisma.TonerEntryMaxOrderByAggregateInput;
    _min?: Prisma.TonerEntryMinOrderByAggregateInput;
    _sum?: Prisma.TonerEntrySumOrderByAggregateInput;
};
export type TonerEntryScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerEntryScalarWhereWithAggregatesInput | Prisma.TonerEntryScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerEntryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerEntryScalarWhereWithAggregatesInput | Prisma.TonerEntryScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerEntry"> | number;
    userId?: Prisma.StringWithAggregatesFilter<"TonerEntry"> | string;
    tonerId?: Prisma.StringWithAggregatesFilter<"TonerEntry"> | string;
    action?: Prisma.EnumTonerActionWithAggregatesFilter<"TonerEntry"> | $Enums.TonerAction;
    companyId?: Prisma.IntWithAggregatesFilter<"TonerEntry"> | number;
    quantity?: Prisma.IntWithAggregatesFilter<"TonerEntry"> | number;
    balance?: Prisma.IntWithAggregatesFilter<"TonerEntry"> | number;
    receivedOn?: Prisma.DateTimeNullableWithAggregatesFilter<"TonerEntry"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TonerEntry"> | Date | string;
};
export type TonerEntryCreateInput = {
    userId: string;
    action: $Enums.TonerAction;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutEntriesInput;
    toner: Prisma.TonerCreateNestedOneWithoutEntriesInput;
};
export type TonerEntryUncheckedCreateInput = {
    id?: number;
    userId: string;
    tonerId: string;
    action: $Enums.TonerAction;
    companyId: number;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryUpdateInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutEntriesNestedInput;
    toner?: Prisma.TonerUpdateOneRequiredWithoutEntriesNestedInput;
};
export type TonerEntryUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryCreateManyInput = {
    id?: number;
    userId: string;
    tonerId: string;
    action: $Enums.TonerAction;
    companyId: number;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryUpdateManyMutationInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryListRelationFilter = {
    every?: Prisma.TonerEntryWhereInput;
    some?: Prisma.TonerEntryWhereInput;
    none?: Prisma.TonerEntryWhereInput;
};
export type TonerEntryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TonerEntryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
    receivedOn?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerEntryAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
};
export type TonerEntryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
    receivedOn?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerEntryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    tonerId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
    receivedOn?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type TonerEntrySumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    balance?: Prisma.SortOrder;
};
export type TonerEntryCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput> | Prisma.TonerEntryCreateWithoutTonerInput[] | Prisma.TonerEntryUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutTonerInput | Prisma.TonerEntryCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerEntryCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
};
export type TonerEntryUncheckedCreateNestedManyWithoutTonerInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput> | Prisma.TonerEntryCreateWithoutTonerInput[] | Prisma.TonerEntryUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutTonerInput | Prisma.TonerEntryCreateOrConnectWithoutTonerInput[];
    createMany?: Prisma.TonerEntryCreateManyTonerInputEnvelope;
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
};
export type TonerEntryUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput> | Prisma.TonerEntryCreateWithoutTonerInput[] | Prisma.TonerEntryUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutTonerInput | Prisma.TonerEntryCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerEntryUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerEntryUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerEntryCreateManyTonerInputEnvelope;
    set?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    disconnect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    delete?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    update?: Prisma.TonerEntryUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerEntryUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerEntryUpdateManyWithWhereWithoutTonerInput | Prisma.TonerEntryUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
};
export type TonerEntryUncheckedUpdateManyWithoutTonerNestedInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput> | Prisma.TonerEntryCreateWithoutTonerInput[] | Prisma.TonerEntryUncheckedCreateWithoutTonerInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutTonerInput | Prisma.TonerEntryCreateOrConnectWithoutTonerInput[];
    upsert?: Prisma.TonerEntryUpsertWithWhereUniqueWithoutTonerInput | Prisma.TonerEntryUpsertWithWhereUniqueWithoutTonerInput[];
    createMany?: Prisma.TonerEntryCreateManyTonerInputEnvelope;
    set?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    disconnect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    delete?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    update?: Prisma.TonerEntryUpdateWithWhereUniqueWithoutTonerInput | Prisma.TonerEntryUpdateWithWhereUniqueWithoutTonerInput[];
    updateMany?: Prisma.TonerEntryUpdateManyWithWhereWithoutTonerInput | Prisma.TonerEntryUpdateManyWithWhereWithoutTonerInput[];
    deleteMany?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
};
export type EnumTonerActionFieldUpdateOperationsInput = {
    set?: $Enums.TonerAction;
};
export type TonerEntryCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput> | Prisma.TonerEntryCreateWithoutCompanyInput[] | Prisma.TonerEntryUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutCompanyInput | Prisma.TonerEntryCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TonerEntryCreateManyCompanyInputEnvelope;
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
};
export type TonerEntryUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput> | Prisma.TonerEntryCreateWithoutCompanyInput[] | Prisma.TonerEntryUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutCompanyInput | Prisma.TonerEntryCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TonerEntryCreateManyCompanyInputEnvelope;
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
};
export type TonerEntryUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput> | Prisma.TonerEntryCreateWithoutCompanyInput[] | Prisma.TonerEntryUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutCompanyInput | Prisma.TonerEntryCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TonerEntryUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TonerEntryUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TonerEntryCreateManyCompanyInputEnvelope;
    set?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    disconnect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    delete?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    update?: Prisma.TonerEntryUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TonerEntryUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TonerEntryUpdateManyWithWhereWithoutCompanyInput | Prisma.TonerEntryUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
};
export type TonerEntryUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput> | Prisma.TonerEntryCreateWithoutCompanyInput[] | Prisma.TonerEntryUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TonerEntryCreateOrConnectWithoutCompanyInput | Prisma.TonerEntryCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TonerEntryUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TonerEntryUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TonerEntryCreateManyCompanyInputEnvelope;
    set?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    disconnect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    delete?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    connect?: Prisma.TonerEntryWhereUniqueInput | Prisma.TonerEntryWhereUniqueInput[];
    update?: Prisma.TonerEntryUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TonerEntryUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TonerEntryUpdateManyWithWhereWithoutCompanyInput | Prisma.TonerEntryUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
};
export type TonerEntryCreateWithoutTonerInput = {
    userId: string;
    action: $Enums.TonerAction;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutEntriesInput;
};
export type TonerEntryUncheckedCreateWithoutTonerInput = {
    id?: number;
    userId: string;
    action: $Enums.TonerAction;
    companyId: number;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryCreateOrConnectWithoutTonerInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput>;
};
export type TonerEntryCreateManyTonerInputEnvelope = {
    data: Prisma.TonerEntryCreateManyTonerInput | Prisma.TonerEntryCreateManyTonerInput[];
    skipDuplicates?: boolean;
};
export type TonerEntryUpsertWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerEntryUpdateWithoutTonerInput, Prisma.TonerEntryUncheckedUpdateWithoutTonerInput>;
    create: Prisma.XOR<Prisma.TonerEntryCreateWithoutTonerInput, Prisma.TonerEntryUncheckedCreateWithoutTonerInput>;
};
export type TonerEntryUpdateWithWhereUniqueWithoutTonerInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerEntryUpdateWithoutTonerInput, Prisma.TonerEntryUncheckedUpdateWithoutTonerInput>;
};
export type TonerEntryUpdateManyWithWhereWithoutTonerInput = {
    where: Prisma.TonerEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerEntryUpdateManyMutationInput, Prisma.TonerEntryUncheckedUpdateManyWithoutTonerInput>;
};
export type TonerEntryScalarWhereInput = {
    AND?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
    OR?: Prisma.TonerEntryScalarWhereInput[];
    NOT?: Prisma.TonerEntryScalarWhereInput | Prisma.TonerEntryScalarWhereInput[];
    id?: Prisma.IntFilter<"TonerEntry"> | number;
    userId?: Prisma.StringFilter<"TonerEntry"> | string;
    tonerId?: Prisma.StringFilter<"TonerEntry"> | string;
    action?: Prisma.EnumTonerActionFilter<"TonerEntry"> | $Enums.TonerAction;
    companyId?: Prisma.IntFilter<"TonerEntry"> | number;
    quantity?: Prisma.IntFilter<"TonerEntry"> | number;
    balance?: Prisma.IntFilter<"TonerEntry"> | number;
    receivedOn?: Prisma.DateTimeNullableFilter<"TonerEntry"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerEntry"> | Date | string;
};
export type TonerEntryCreateWithoutCompanyInput = {
    userId: string;
    action: $Enums.TonerAction;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
    toner: Prisma.TonerCreateNestedOneWithoutEntriesInput;
};
export type TonerEntryUncheckedCreateWithoutCompanyInput = {
    id?: number;
    userId: string;
    tonerId: string;
    action: $Enums.TonerAction;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryCreateOrConnectWithoutCompanyInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput>;
};
export type TonerEntryCreateManyCompanyInputEnvelope = {
    data: Prisma.TonerEntryCreateManyCompanyInput | Prisma.TonerEntryCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type TonerEntryUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.TonerEntryUpdateWithoutCompanyInput, Prisma.TonerEntryUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.TonerEntryCreateWithoutCompanyInput, Prisma.TonerEntryUncheckedCreateWithoutCompanyInput>;
};
export type TonerEntryUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TonerEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.TonerEntryUpdateWithoutCompanyInput, Prisma.TonerEntryUncheckedUpdateWithoutCompanyInput>;
};
export type TonerEntryUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.TonerEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.TonerEntryUpdateManyMutationInput, Prisma.TonerEntryUncheckedUpdateManyWithoutCompanyInput>;
};
export type TonerEntryCreateManyTonerInput = {
    id?: number;
    userId: string;
    action: $Enums.TonerAction;
    companyId: number;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryUpdateWithoutTonerInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutEntriesNestedInput;
};
export type TonerEntryUncheckedUpdateWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryUncheckedUpdateManyWithoutTonerInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    companyId?: Prisma.IntFieldUpdateOperationsInput | number;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryCreateManyCompanyInput = {
    id?: number;
    userId: string;
    tonerId: string;
    action: $Enums.TonerAction;
    quantity?: number;
    balance?: number;
    receivedOn?: Date | string | null;
    createdAt?: Date | string;
};
export type TonerEntryUpdateWithoutCompanyInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    toner?: Prisma.TonerUpdateOneRequiredWithoutEntriesNestedInput;
};
export type TonerEntryUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntryUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    tonerId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumTonerActionFieldUpdateOperationsInput | $Enums.TonerAction;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    balance?: Prisma.IntFieldUpdateOperationsInput | number;
    receivedOn?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerEntrySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    tonerId?: boolean;
    action?: boolean;
    companyId?: boolean;
    quantity?: boolean;
    balance?: boolean;
    receivedOn?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerEntry"]>;
export type TonerEntrySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    tonerId?: boolean;
    action?: boolean;
    companyId?: boolean;
    quantity?: boolean;
    balance?: boolean;
    receivedOn?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerEntry"]>;
export type TonerEntrySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    tonerId?: boolean;
    action?: boolean;
    companyId?: boolean;
    quantity?: boolean;
    balance?: boolean;
    receivedOn?: boolean;
    createdAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerEntry"]>;
export type TonerEntrySelectScalar = {
    id?: boolean;
    userId?: boolean;
    tonerId?: boolean;
    action?: boolean;
    companyId?: boolean;
    quantity?: boolean;
    balance?: boolean;
    receivedOn?: boolean;
    createdAt?: boolean;
};
export type TonerEntryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "tonerId" | "action" | "companyId" | "quantity" | "balance" | "receivedOn" | "createdAt", ExtArgs["result"]["tonerEntry"]>;
export type TonerEntryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerEntryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type TonerEntryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    toner?: boolean | Prisma.TonerDefaultArgs<ExtArgs>;
};
export type $TonerEntryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerEntry";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        toner: Prisma.$TonerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        userId: string;
        tonerId: string;
        action: $Enums.TonerAction;
        companyId: number;
        quantity: number;
        balance: number;
        receivedOn: Date | null;
        createdAt: Date;
    }, ExtArgs["result"]["tonerEntry"]>;
    composites: {};
};
export type TonerEntryGetPayload<S extends boolean | null | undefined | TonerEntryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload, S>;
export type TonerEntryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerEntryCountAggregateInputType | true;
};
export interface TonerEntryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerEntry'];
        meta: {
            name: 'TonerEntry';
        };
    };
    findUnique<T extends TonerEntryFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerEntryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerEntryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerEntryFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerEntryFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerEntryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerEntryFindManyArgs>(args?: Prisma.SelectSubset<T, TonerEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerEntryCreateArgs>(args: Prisma.SelectSubset<T, TonerEntryCreateArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerEntryCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerEntryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerEntryDeleteArgs>(args: Prisma.SelectSubset<T, TonerEntryDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerEntryUpdateArgs>(args: Prisma.SelectSubset<T, TonerEntryUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerEntryDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerEntryUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerEntryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerEntryUpsertArgs>(args: Prisma.SelectSubset<T, TonerEntryUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerEntryClient<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerEntryCountArgs>(args?: Prisma.Subset<T, TonerEntryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerEntryCountAggregateOutputType> : number>;
    aggregate<T extends TonerEntryAggregateArgs>(args: Prisma.Subset<T, TonerEntryAggregateArgs>): Prisma.PrismaPromise<GetTonerEntryAggregateType<T>>;
    groupBy<T extends TonerEntryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerEntryGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerEntryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerEntryFieldRefs;
}
export interface Prisma__TonerEntryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    toner<T extends Prisma.TonerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerDefaultArgs<ExtArgs>>): Prisma.Prisma__TonerClient<runtime.Types.Result.GetResult<Prisma.$TonerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerEntryFieldRefs {
    readonly id: Prisma.FieldRef<"TonerEntry", 'Int'>;
    readonly userId: Prisma.FieldRef<"TonerEntry", 'String'>;
    readonly tonerId: Prisma.FieldRef<"TonerEntry", 'String'>;
    readonly action: Prisma.FieldRef<"TonerEntry", 'TonerAction'>;
    readonly companyId: Prisma.FieldRef<"TonerEntry", 'Int'>;
    readonly quantity: Prisma.FieldRef<"TonerEntry", 'Int'>;
    readonly balance: Prisma.FieldRef<"TonerEntry", 'Int'>;
    readonly receivedOn: Prisma.FieldRef<"TonerEntry", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"TonerEntry", 'DateTime'>;
}
export type TonerEntryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    where: Prisma.TonerEntryWhereUniqueInput;
};
export type TonerEntryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    where: Prisma.TonerEntryWhereUniqueInput;
};
export type TonerEntryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerEntryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerEntryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerEntryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerEntryCreateInput, Prisma.TonerEntryUncheckedCreateInput>;
};
export type TonerEntryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerEntryCreateManyInput | Prisma.TonerEntryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerEntryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    data: Prisma.TonerEntryCreateManyInput | Prisma.TonerEntryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TonerEntryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TonerEntryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerEntryUpdateInput, Prisma.TonerEntryUncheckedUpdateInput>;
    where: Prisma.TonerEntryWhereUniqueInput;
};
export type TonerEntryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerEntryUpdateManyMutationInput, Prisma.TonerEntryUncheckedUpdateManyInput>;
    where?: Prisma.TonerEntryWhereInput;
    limit?: number;
};
export type TonerEntryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerEntryUpdateManyMutationInput, Prisma.TonerEntryUncheckedUpdateManyInput>;
    where?: Prisma.TonerEntryWhereInput;
    limit?: number;
    include?: Prisma.TonerEntryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TonerEntryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    where: Prisma.TonerEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerEntryCreateInput, Prisma.TonerEntryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerEntryUpdateInput, Prisma.TonerEntryUncheckedUpdateInput>;
};
export type TonerEntryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
    where: Prisma.TonerEntryWhereUniqueInput;
};
export type TonerEntryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerEntryWhereInput;
    limit?: number;
};
export type TonerEntryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerEntrySelect<ExtArgs> | null;
    omit?: Prisma.TonerEntryOmit<ExtArgs> | null;
    include?: Prisma.TonerEntryInclude<ExtArgs> | null;
};
