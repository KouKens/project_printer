import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CompanyModel = runtime.Types.Result.DefaultSelection<Prisma.$CompanyPayload>;
export type AggregateCompany = {
    _count: CompanyCountAggregateOutputType | null;
    _avg: CompanyAvgAggregateOutputType | null;
    _sum: CompanySumAggregateOutputType | null;
    _min: CompanyMinAggregateOutputType | null;
    _max: CompanyMaxAggregateOutputType | null;
};
export type CompanyAvgAggregateOutputType = {
    id: number | null;
    sortOrder: number | null;
};
export type CompanySumAggregateOutputType = {
    id: number | null;
    sortOrder: number | null;
};
export type CompanyMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    sortOrder: number | null;
    note: string | null;
    disabledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CompanyMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    sortOrder: number | null;
    note: string | null;
    disabledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CompanyCountAggregateOutputType = {
    id: number;
    name: number;
    sortOrder: number;
    note: number;
    disabledAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type CompanyAvgAggregateInputType = {
    id?: true;
    sortOrder?: true;
};
export type CompanySumAggregateInputType = {
    id?: true;
    sortOrder?: true;
};
export type CompanyMinAggregateInputType = {
    id?: true;
    name?: true;
    sortOrder?: true;
    note?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CompanyMaxAggregateInputType = {
    id?: true;
    name?: true;
    sortOrder?: true;
    note?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CompanyCountAggregateInputType = {
    id?: true;
    name?: true;
    sortOrder?: true;
    note?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type CompanyAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput | Prisma.CompanyOrderByWithRelationInput[];
    cursor?: Prisma.CompanyWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CompanyCountAggregateInputType;
    _avg?: CompanyAvgAggregateInputType;
    _sum?: CompanySumAggregateInputType;
    _min?: CompanyMinAggregateInputType;
    _max?: CompanyMaxAggregateInputType;
};
export type GetCompanyAggregateType<T extends CompanyAggregateArgs> = {
    [P in keyof T & keyof AggregateCompany]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCompany[P]> : Prisma.GetScalarType<T[P], AggregateCompany[P]>;
};
export type CompanyGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithAggregationInput | Prisma.CompanyOrderByWithAggregationInput[];
    by: Prisma.CompanyScalarFieldEnum[] | Prisma.CompanyScalarFieldEnum;
    having?: Prisma.CompanyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CompanyCountAggregateInputType | true;
    _avg?: CompanyAvgAggregateInputType;
    _sum?: CompanySumAggregateInputType;
    _min?: CompanyMinAggregateInputType;
    _max?: CompanyMaxAggregateInputType;
};
export type CompanyGroupByOutputType = {
    id: number;
    name: string;
    sortOrder: number;
    note: string | null;
    disabledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: CompanyCountAggregateOutputType | null;
    _avg: CompanyAvgAggregateOutputType | null;
    _sum: CompanySumAggregateOutputType | null;
    _min: CompanyMinAggregateOutputType | null;
    _max: CompanyMaxAggregateOutputType | null;
};
export type GetCompanyGroupByPayload<T extends CompanyGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CompanyGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CompanyGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CompanyGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CompanyGroupByOutputType[P]>;
}>>;
export type CompanyWhereInput = {
    AND?: Prisma.CompanyWhereInput | Prisma.CompanyWhereInput[];
    OR?: Prisma.CompanyWhereInput[];
    NOT?: Prisma.CompanyWhereInput | Prisma.CompanyWhereInput[];
    id?: Prisma.IntFilter<"Company"> | number;
    name?: Prisma.StringFilter<"Company"> | string;
    sortOrder?: Prisma.IntFilter<"Company"> | number;
    note?: Prisma.StringNullableFilter<"Company"> | string | null;
    disabledAt?: Prisma.DateTimeNullableFilter<"Company"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Company"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Company"> | Date | string;
    assets?: Prisma.PrinterAssetListRelationFilter;
    stocks?: Prisma.TonerStockListRelationFilter;
    entries?: Prisma.TonerEntryListRelationFilter;
    orders?: Prisma.TonerOrderListRelationFilter;
};
export type CompanyOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    assets?: Prisma.PrinterAssetOrderByRelationAggregateInput;
    stocks?: Prisma.TonerStockOrderByRelationAggregateInput;
    entries?: Prisma.TonerEntryOrderByRelationAggregateInput;
    orders?: Prisma.TonerOrderOrderByRelationAggregateInput;
};
export type CompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    name?: string;
    AND?: Prisma.CompanyWhereInput | Prisma.CompanyWhereInput[];
    OR?: Prisma.CompanyWhereInput[];
    NOT?: Prisma.CompanyWhereInput | Prisma.CompanyWhereInput[];
    sortOrder?: Prisma.IntFilter<"Company"> | number;
    note?: Prisma.StringNullableFilter<"Company"> | string | null;
    disabledAt?: Prisma.DateTimeNullableFilter<"Company"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Company"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Company"> | Date | string;
    assets?: Prisma.PrinterAssetListRelationFilter;
    stocks?: Prisma.TonerStockListRelationFilter;
    entries?: Prisma.TonerEntryListRelationFilter;
    orders?: Prisma.TonerOrderListRelationFilter;
}, "id" | "name">;
export type CompanyOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CompanyCountOrderByAggregateInput;
    _avg?: Prisma.CompanyAvgOrderByAggregateInput;
    _max?: Prisma.CompanyMaxOrderByAggregateInput;
    _min?: Prisma.CompanyMinOrderByAggregateInput;
    _sum?: Prisma.CompanySumOrderByAggregateInput;
};
export type CompanyScalarWhereWithAggregatesInput = {
    AND?: Prisma.CompanyScalarWhereWithAggregatesInput | Prisma.CompanyScalarWhereWithAggregatesInput[];
    OR?: Prisma.CompanyScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CompanyScalarWhereWithAggregatesInput | Prisma.CompanyScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Company"> | number;
    name?: Prisma.StringWithAggregatesFilter<"Company"> | string;
    sortOrder?: Prisma.IntWithAggregatesFilter<"Company"> | number;
    note?: Prisma.StringNullableWithAggregatesFilter<"Company"> | string | null;
    disabledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Company"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Company"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Company"> | Date | string;
};
export type CompanyCreateInput = {
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutCompanyInput;
};
export type CompanyUncheckedCreateInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetUncheckedCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockUncheckedCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutCompanyInput;
};
export type CompanyUpdateInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutCompanyNestedInput;
};
export type CompanyUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUncheckedUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUncheckedUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutCompanyNestedInput;
};
export type CompanyCreateManyInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CompanyUpdateManyMutationInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CompanyUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CompanyScalarRelationFilter = {
    is?: Prisma.CompanyWhereInput;
    isNot?: Prisma.CompanyWhereInput;
};
export type CompanyCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CompanyAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
};
export type CompanyMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CompanyMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CompanySumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sortOrder?: Prisma.SortOrder;
};
export type CompanyCreateNestedOneWithoutStocksInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutStocksInput, Prisma.CompanyUncheckedCreateWithoutStocksInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutStocksInput;
    connect?: Prisma.CompanyWhereUniqueInput;
};
export type CompanyUpdateOneRequiredWithoutStocksNestedInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutStocksInput, Prisma.CompanyUncheckedCreateWithoutStocksInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutStocksInput;
    upsert?: Prisma.CompanyUpsertWithoutStocksInput;
    connect?: Prisma.CompanyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CompanyUpdateToOneWithWhereWithoutStocksInput, Prisma.CompanyUpdateWithoutStocksInput>, Prisma.CompanyUncheckedUpdateWithoutStocksInput>;
};
export type CompanyCreateNestedOneWithoutEntriesInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutEntriesInput, Prisma.CompanyUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutEntriesInput;
    connect?: Prisma.CompanyWhereUniqueInput;
};
export type CompanyUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutEntriesInput, Prisma.CompanyUncheckedCreateWithoutEntriesInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutEntriesInput;
    upsert?: Prisma.CompanyUpsertWithoutEntriesInput;
    connect?: Prisma.CompanyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CompanyUpdateToOneWithWhereWithoutEntriesInput, Prisma.CompanyUpdateWithoutEntriesInput>, Prisma.CompanyUncheckedUpdateWithoutEntriesInput>;
};
export type CompanyCreateNestedOneWithoutOrdersInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutOrdersInput, Prisma.CompanyUncheckedCreateWithoutOrdersInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutOrdersInput;
    connect?: Prisma.CompanyWhereUniqueInput;
};
export type CompanyUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutOrdersInput, Prisma.CompanyUncheckedCreateWithoutOrdersInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutOrdersInput;
    upsert?: Prisma.CompanyUpsertWithoutOrdersInput;
    connect?: Prisma.CompanyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CompanyUpdateToOneWithWhereWithoutOrdersInput, Prisma.CompanyUpdateWithoutOrdersInput>, Prisma.CompanyUncheckedUpdateWithoutOrdersInput>;
};
export type CompanyCreateNestedOneWithoutAssetsInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutAssetsInput, Prisma.CompanyUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutAssetsInput;
    connect?: Prisma.CompanyWhereUniqueInput;
};
export type CompanyUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: Prisma.XOR<Prisma.CompanyCreateWithoutAssetsInput, Prisma.CompanyUncheckedCreateWithoutAssetsInput>;
    connectOrCreate?: Prisma.CompanyCreateOrConnectWithoutAssetsInput;
    upsert?: Prisma.CompanyUpsertWithoutAssetsInput;
    connect?: Prisma.CompanyWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CompanyUpdateToOneWithWhereWithoutAssetsInput, Prisma.CompanyUpdateWithoutAssetsInput>, Prisma.CompanyUncheckedUpdateWithoutAssetsInput>;
};
export type CompanyCreateWithoutStocksInput = {
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutCompanyInput;
};
export type CompanyUncheckedCreateWithoutStocksInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetUncheckedCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutCompanyInput;
};
export type CompanyCreateOrConnectWithoutStocksInput = {
    where: Prisma.CompanyWhereUniqueInput;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutStocksInput, Prisma.CompanyUncheckedCreateWithoutStocksInput>;
};
export type CompanyUpsertWithoutStocksInput = {
    update: Prisma.XOR<Prisma.CompanyUpdateWithoutStocksInput, Prisma.CompanyUncheckedUpdateWithoutStocksInput>;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutStocksInput, Prisma.CompanyUncheckedCreateWithoutStocksInput>;
    where?: Prisma.CompanyWhereInput;
};
export type CompanyUpdateToOneWithWhereWithoutStocksInput = {
    where?: Prisma.CompanyWhereInput;
    data: Prisma.XOR<Prisma.CompanyUpdateWithoutStocksInput, Prisma.CompanyUncheckedUpdateWithoutStocksInput>;
};
export type CompanyUpdateWithoutStocksInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutCompanyNestedInput;
};
export type CompanyUncheckedUpdateWithoutStocksInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUncheckedUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutCompanyNestedInput;
};
export type CompanyCreateWithoutEntriesInput = {
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutCompanyInput;
};
export type CompanyUncheckedCreateWithoutEntriesInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetUncheckedCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockUncheckedCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutCompanyInput;
};
export type CompanyCreateOrConnectWithoutEntriesInput = {
    where: Prisma.CompanyWhereUniqueInput;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutEntriesInput, Prisma.CompanyUncheckedCreateWithoutEntriesInput>;
};
export type CompanyUpsertWithoutEntriesInput = {
    update: Prisma.XOR<Prisma.CompanyUpdateWithoutEntriesInput, Prisma.CompanyUncheckedUpdateWithoutEntriesInput>;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutEntriesInput, Prisma.CompanyUncheckedCreateWithoutEntriesInput>;
    where?: Prisma.CompanyWhereInput;
};
export type CompanyUpdateToOneWithWhereWithoutEntriesInput = {
    where?: Prisma.CompanyWhereInput;
    data: Prisma.XOR<Prisma.CompanyUpdateWithoutEntriesInput, Prisma.CompanyUncheckedUpdateWithoutEntriesInput>;
};
export type CompanyUpdateWithoutEntriesInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutCompanyNestedInput;
};
export type CompanyUncheckedUpdateWithoutEntriesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUncheckedUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUncheckedUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutCompanyNestedInput;
};
export type CompanyCreateWithoutOrdersInput = {
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutCompanyInput;
};
export type CompanyUncheckedCreateWithoutOrdersInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assets?: Prisma.PrinterAssetUncheckedCreateNestedManyWithoutCompanyInput;
    stocks?: Prisma.TonerStockUncheckedCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutCompanyInput;
};
export type CompanyCreateOrConnectWithoutOrdersInput = {
    where: Prisma.CompanyWhereUniqueInput;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutOrdersInput, Prisma.CompanyUncheckedCreateWithoutOrdersInput>;
};
export type CompanyUpsertWithoutOrdersInput = {
    update: Prisma.XOR<Prisma.CompanyUpdateWithoutOrdersInput, Prisma.CompanyUncheckedUpdateWithoutOrdersInput>;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutOrdersInput, Prisma.CompanyUncheckedCreateWithoutOrdersInput>;
    where?: Prisma.CompanyWhereInput;
};
export type CompanyUpdateToOneWithWhereWithoutOrdersInput = {
    where?: Prisma.CompanyWhereInput;
    data: Prisma.XOR<Prisma.CompanyUpdateWithoutOrdersInput, Prisma.CompanyUncheckedUpdateWithoutOrdersInput>;
};
export type CompanyUpdateWithoutOrdersInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutCompanyNestedInput;
};
export type CompanyUncheckedUpdateWithoutOrdersInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assets?: Prisma.PrinterAssetUncheckedUpdateManyWithoutCompanyNestedInput;
    stocks?: Prisma.TonerStockUncheckedUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutCompanyNestedInput;
};
export type CompanyCreateWithoutAssetsInput = {
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stocks?: Prisma.TonerStockCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderCreateNestedManyWithoutCompanyInput;
};
export type CompanyUncheckedCreateWithoutAssetsInput = {
    id?: number;
    name: string;
    sortOrder?: number;
    note?: string | null;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    stocks?: Prisma.TonerStockUncheckedCreateNestedManyWithoutCompanyInput;
    entries?: Prisma.TonerEntryUncheckedCreateNestedManyWithoutCompanyInput;
    orders?: Prisma.TonerOrderUncheckedCreateNestedManyWithoutCompanyInput;
};
export type CompanyCreateOrConnectWithoutAssetsInput = {
    where: Prisma.CompanyWhereUniqueInput;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutAssetsInput, Prisma.CompanyUncheckedCreateWithoutAssetsInput>;
};
export type CompanyUpsertWithoutAssetsInput = {
    update: Prisma.XOR<Prisma.CompanyUpdateWithoutAssetsInput, Prisma.CompanyUncheckedUpdateWithoutAssetsInput>;
    create: Prisma.XOR<Prisma.CompanyCreateWithoutAssetsInput, Prisma.CompanyUncheckedCreateWithoutAssetsInput>;
    where?: Prisma.CompanyWhereInput;
};
export type CompanyUpdateToOneWithWhereWithoutAssetsInput = {
    where?: Prisma.CompanyWhereInput;
    data: Prisma.XOR<Prisma.CompanyUpdateWithoutAssetsInput, Prisma.CompanyUncheckedUpdateWithoutAssetsInput>;
};
export type CompanyUpdateWithoutAssetsInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stocks?: Prisma.TonerStockUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUpdateManyWithoutCompanyNestedInput;
};
export type CompanyUncheckedUpdateWithoutAssetsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    sortOrder?: Prisma.IntFieldUpdateOperationsInput | number;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    stocks?: Prisma.TonerStockUncheckedUpdateManyWithoutCompanyNestedInput;
    entries?: Prisma.TonerEntryUncheckedUpdateManyWithoutCompanyNestedInput;
    orders?: Prisma.TonerOrderUncheckedUpdateManyWithoutCompanyNestedInput;
};
export type CompanyCountOutputType = {
    assets: number;
    stocks: number;
    entries: number;
    orders: number;
};
export type CompanyCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | CompanyCountOutputTypeCountAssetsArgs;
    stocks?: boolean | CompanyCountOutputTypeCountStocksArgs;
    entries?: boolean | CompanyCountOutputTypeCountEntriesArgs;
    orders?: boolean | CompanyCountOutputTypeCountOrdersArgs;
};
export type CompanyCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanyCountOutputTypeSelect<ExtArgs> | null;
};
export type CompanyCountOutputTypeCountAssetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PrinterAssetWhereInput;
};
export type CompanyCountOutputTypeCountStocksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerStockWhereInput;
};
export type CompanyCountOutputTypeCountEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerEntryWhereInput;
};
export type CompanyCountOutputTypeCountOrdersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerOrderWhereInput;
};
export type CompanySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    sortOrder?: boolean;
    note?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    assets?: boolean | Prisma.Company$assetsArgs<ExtArgs>;
    stocks?: boolean | Prisma.Company$stocksArgs<ExtArgs>;
    entries?: boolean | Prisma.Company$entriesArgs<ExtArgs>;
    orders?: boolean | Prisma.Company$ordersArgs<ExtArgs>;
    _count?: boolean | Prisma.CompanyCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["company"]>;
export type CompanySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    sortOrder?: boolean;
    note?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["company"]>;
export type CompanySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    sortOrder?: boolean;
    note?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["company"]>;
export type CompanySelectScalar = {
    id?: boolean;
    name?: boolean;
    sortOrder?: boolean;
    note?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type CompanyOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "sortOrder" | "note" | "disabledAt" | "createdAt" | "updatedAt", ExtArgs["result"]["company"]>;
export type CompanyInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    assets?: boolean | Prisma.Company$assetsArgs<ExtArgs>;
    stocks?: boolean | Prisma.Company$stocksArgs<ExtArgs>;
    entries?: boolean | Prisma.Company$entriesArgs<ExtArgs>;
    orders?: boolean | Prisma.Company$ordersArgs<ExtArgs>;
    _count?: boolean | Prisma.CompanyCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CompanyIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type CompanyIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $CompanyPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Company";
    objects: {
        assets: Prisma.$PrinterAssetPayload<ExtArgs>[];
        stocks: Prisma.$TonerStockPayload<ExtArgs>[];
        entries: Prisma.$TonerEntryPayload<ExtArgs>[];
        orders: Prisma.$TonerOrderPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        name: string;
        sortOrder: number;
        note: string | null;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["company"]>;
    composites: {};
};
export type CompanyGetPayload<S extends boolean | null | undefined | CompanyDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CompanyPayload, S>;
export type CompanyCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CompanyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CompanyCountAggregateInputType | true;
};
export interface CompanyDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Company'];
        meta: {
            name: 'Company';
        };
    };
    findUnique<T extends CompanyFindUniqueArgs>(args: Prisma.SelectSubset<T, CompanyFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CompanyFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CompanyFindFirstArgs>(args?: Prisma.SelectSubset<T, CompanyFindFirstArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CompanyFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CompanyFindManyArgs>(args?: Prisma.SelectSubset<T, CompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CompanyCreateArgs>(args: Prisma.SelectSubset<T, CompanyCreateArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CompanyCreateManyArgs>(args?: Prisma.SelectSubset<T, CompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CompanyCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CompanyDeleteArgs>(args: Prisma.SelectSubset<T, CompanyDeleteArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CompanyUpdateArgs>(args: Prisma.SelectSubset<T, CompanyUpdateArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CompanyDeleteManyArgs>(args?: Prisma.SelectSubset<T, CompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CompanyUpdateManyArgs>(args: Prisma.SelectSubset<T, CompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CompanyUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CompanyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CompanyUpsertArgs>(args: Prisma.SelectSubset<T, CompanyUpsertArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CompanyCountArgs>(args?: Prisma.Subset<T, CompanyCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CompanyCountAggregateOutputType> : number>;
    aggregate<T extends CompanyAggregateArgs>(args: Prisma.Subset<T, CompanyAggregateArgs>): Prisma.PrismaPromise<GetCompanyAggregateType<T>>;
    groupBy<T extends CompanyGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CompanyGroupByArgs['orderBy'];
    } : {
        orderBy?: CompanyGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CompanyFieldRefs;
}
export interface Prisma__CompanyClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    assets<T extends Prisma.Company$assetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Company$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PrinterAssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    stocks<T extends Prisma.Company$stocksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Company$stocksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerStockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    entries<T extends Prisma.Company$entriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Company$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    orders<T extends Prisma.Company$ordersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Company$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CompanyFieldRefs {
    readonly id: Prisma.FieldRef<"Company", 'Int'>;
    readonly name: Prisma.FieldRef<"Company", 'String'>;
    readonly sortOrder: Prisma.FieldRef<"Company", 'Int'>;
    readonly note: Prisma.FieldRef<"Company", 'String'>;
    readonly disabledAt: Prisma.FieldRef<"Company", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Company", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Company", 'DateTime'>;
}
export type CompanyFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where: Prisma.CompanyWhereUniqueInput;
};
export type CompanyFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where: Prisma.CompanyWhereUniqueInput;
};
export type CompanyFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput | Prisma.CompanyOrderByWithRelationInput[];
    cursor?: Prisma.CompanyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CompanyScalarFieldEnum | Prisma.CompanyScalarFieldEnum[];
};
export type CompanyFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput | Prisma.CompanyOrderByWithRelationInput[];
    cursor?: Prisma.CompanyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CompanyScalarFieldEnum | Prisma.CompanyScalarFieldEnum[];
};
export type CompanyFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput | Prisma.CompanyOrderByWithRelationInput[];
    cursor?: Prisma.CompanyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CompanyScalarFieldEnum | Prisma.CompanyScalarFieldEnum[];
};
export type CompanyCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CompanyCreateInput, Prisma.CompanyUncheckedCreateInput>;
};
export type CompanyCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CompanyCreateManyInput | Prisma.CompanyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CompanyCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    data: Prisma.CompanyCreateManyInput | Prisma.CompanyCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CompanyUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CompanyUpdateInput, Prisma.CompanyUncheckedUpdateInput>;
    where: Prisma.CompanyWhereUniqueInput;
};
export type CompanyUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CompanyUpdateManyMutationInput, Prisma.CompanyUncheckedUpdateManyInput>;
    where?: Prisma.CompanyWhereInput;
    limit?: number;
};
export type CompanyUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CompanyUpdateManyMutationInput, Prisma.CompanyUncheckedUpdateManyInput>;
    where?: Prisma.CompanyWhereInput;
    limit?: number;
};
export type CompanyUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where: Prisma.CompanyWhereUniqueInput;
    create: Prisma.XOR<Prisma.CompanyCreateInput, Prisma.CompanyUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CompanyUpdateInput, Prisma.CompanyUncheckedUpdateInput>;
};
export type CompanyDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
    where: Prisma.CompanyWhereUniqueInput;
};
export type CompanyDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CompanyWhereInput;
    limit?: number;
};
export type Company$assetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Company$stocksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerStockSelect<ExtArgs> | null;
    omit?: Prisma.TonerStockOmit<ExtArgs> | null;
    include?: Prisma.TonerStockInclude<ExtArgs> | null;
    where?: Prisma.TonerStockWhereInput;
    orderBy?: Prisma.TonerStockOrderByWithRelationInput | Prisma.TonerStockOrderByWithRelationInput[];
    cursor?: Prisma.TonerStockWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerStockScalarFieldEnum | Prisma.TonerStockScalarFieldEnum[];
};
export type Company$entriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Company$ordersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type CompanyDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CompanySelect<ExtArgs> | null;
    omit?: Prisma.CompanyOmit<ExtArgs> | null;
    include?: Prisma.CompanyInclude<ExtArgs> | null;
};
