import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TonerInvoiceModel = runtime.Types.Result.DefaultSelection<Prisma.$TonerInvoicePayload>;
export type AggregateTonerInvoice = {
    _count: TonerInvoiceCountAggregateOutputType | null;
    _avg: TonerInvoiceAvgAggregateOutputType | null;
    _sum: TonerInvoiceSumAggregateOutputType | null;
    _min: TonerInvoiceMinAggregateOutputType | null;
    _max: TonerInvoiceMaxAggregateOutputType | null;
};
export type TonerInvoiceAvgAggregateOutputType = {
    id: number | null;
};
export type TonerInvoiceSumAggregateOutputType = {
    id: number | null;
};
export type TonerInvoiceMinAggregateOutputType = {
    id: number | null;
    issuedOn: Date | null;
    periodFrom: Date | null;
    periodTo: Date | null;
    invoiceNo: string | null;
    note: string | null;
    checkedAt: Date | null;
    checkedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerInvoiceMaxAggregateOutputType = {
    id: number | null;
    issuedOn: Date | null;
    periodFrom: Date | null;
    periodTo: Date | null;
    invoiceNo: string | null;
    note: string | null;
    checkedAt: Date | null;
    checkedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TonerInvoiceCountAggregateOutputType = {
    id: number;
    issuedOn: number;
    periodFrom: number;
    periodTo: number;
    invoiceNo: number;
    note: number;
    checkedAt: number;
    checkedBy: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TonerInvoiceAvgAggregateInputType = {
    id?: true;
};
export type TonerInvoiceSumAggregateInputType = {
    id?: true;
};
export type TonerInvoiceMinAggregateInputType = {
    id?: true;
    issuedOn?: true;
    periodFrom?: true;
    periodTo?: true;
    invoiceNo?: true;
    note?: true;
    checkedAt?: true;
    checkedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerInvoiceMaxAggregateInputType = {
    id?: true;
    issuedOn?: true;
    periodFrom?: true;
    periodTo?: true;
    invoiceNo?: true;
    note?: true;
    checkedAt?: true;
    checkedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TonerInvoiceCountAggregateInputType = {
    id?: true;
    issuedOn?: true;
    periodFrom?: true;
    periodTo?: true;
    invoiceNo?: true;
    note?: true;
    checkedAt?: true;
    checkedBy?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TonerInvoiceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceWhereInput;
    orderBy?: Prisma.TonerInvoiceOrderByWithRelationInput | Prisma.TonerInvoiceOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TonerInvoiceCountAggregateInputType;
    _avg?: TonerInvoiceAvgAggregateInputType;
    _sum?: TonerInvoiceSumAggregateInputType;
    _min?: TonerInvoiceMinAggregateInputType;
    _max?: TonerInvoiceMaxAggregateInputType;
};
export type GetTonerInvoiceAggregateType<T extends TonerInvoiceAggregateArgs> = {
    [P in keyof T & keyof AggregateTonerInvoice]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTonerInvoice[P]> : Prisma.GetScalarType<T[P], AggregateTonerInvoice[P]>;
};
export type TonerInvoiceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceWhereInput;
    orderBy?: Prisma.TonerInvoiceOrderByWithAggregationInput | Prisma.TonerInvoiceOrderByWithAggregationInput[];
    by: Prisma.TonerInvoiceScalarFieldEnum[] | Prisma.TonerInvoiceScalarFieldEnum;
    having?: Prisma.TonerInvoiceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TonerInvoiceCountAggregateInputType | true;
    _avg?: TonerInvoiceAvgAggregateInputType;
    _sum?: TonerInvoiceSumAggregateInputType;
    _min?: TonerInvoiceMinAggregateInputType;
    _max?: TonerInvoiceMaxAggregateInputType;
};
export type TonerInvoiceGroupByOutputType = {
    id: number;
    issuedOn: Date;
    periodFrom: Date;
    periodTo: Date;
    invoiceNo: string | null;
    note: string | null;
    checkedAt: Date | null;
    checkedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TonerInvoiceCountAggregateOutputType | null;
    _avg: TonerInvoiceAvgAggregateOutputType | null;
    _sum: TonerInvoiceSumAggregateOutputType | null;
    _min: TonerInvoiceMinAggregateOutputType | null;
    _max: TonerInvoiceMaxAggregateOutputType | null;
};
export type GetTonerInvoiceGroupByPayload<T extends TonerInvoiceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TonerInvoiceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TonerInvoiceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TonerInvoiceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TonerInvoiceGroupByOutputType[P]>;
}>>;
export type TonerInvoiceWhereInput = {
    AND?: Prisma.TonerInvoiceWhereInput | Prisma.TonerInvoiceWhereInput[];
    OR?: Prisma.TonerInvoiceWhereInput[];
    NOT?: Prisma.TonerInvoiceWhereInput | Prisma.TonerInvoiceWhereInput[];
    id?: Prisma.IntFilter<"TonerInvoice"> | number;
    issuedOn?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    periodFrom?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    periodTo?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    invoiceNo?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    note?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    checkedAt?: Prisma.DateTimeNullableFilter<"TonerInvoice"> | Date | string | null;
    checkedBy?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    lines?: Prisma.TonerInvoiceLineListRelationFilter;
};
export type TonerInvoiceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    issuedOn?: Prisma.SortOrder;
    periodFrom?: Prisma.SortOrder;
    periodTo?: Prisma.SortOrder;
    invoiceNo?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    lines?: Prisma.TonerInvoiceLineOrderByRelationAggregateInput;
};
export type TonerInvoiceWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TonerInvoiceWhereInput | Prisma.TonerInvoiceWhereInput[];
    OR?: Prisma.TonerInvoiceWhereInput[];
    NOT?: Prisma.TonerInvoiceWhereInput | Prisma.TonerInvoiceWhereInput[];
    issuedOn?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    periodFrom?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    periodTo?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    invoiceNo?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    note?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    checkedAt?: Prisma.DateTimeNullableFilter<"TonerInvoice"> | Date | string | null;
    checkedBy?: Prisma.StringNullableFilter<"TonerInvoice"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TonerInvoice"> | Date | string;
    lines?: Prisma.TonerInvoiceLineListRelationFilter;
}, "id">;
export type TonerInvoiceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    issuedOn?: Prisma.SortOrder;
    periodFrom?: Prisma.SortOrder;
    periodTo?: Prisma.SortOrder;
    invoiceNo?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TonerInvoiceCountOrderByAggregateInput;
    _avg?: Prisma.TonerInvoiceAvgOrderByAggregateInput;
    _max?: Prisma.TonerInvoiceMaxOrderByAggregateInput;
    _min?: Prisma.TonerInvoiceMinOrderByAggregateInput;
    _sum?: Prisma.TonerInvoiceSumOrderByAggregateInput;
};
export type TonerInvoiceScalarWhereWithAggregatesInput = {
    AND?: Prisma.TonerInvoiceScalarWhereWithAggregatesInput | Prisma.TonerInvoiceScalarWhereWithAggregatesInput[];
    OR?: Prisma.TonerInvoiceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TonerInvoiceScalarWhereWithAggregatesInput | Prisma.TonerInvoiceScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TonerInvoice"> | number;
    issuedOn?: Prisma.DateTimeWithAggregatesFilter<"TonerInvoice"> | Date | string;
    periodFrom?: Prisma.DateTimeWithAggregatesFilter<"TonerInvoice"> | Date | string;
    periodTo?: Prisma.DateTimeWithAggregatesFilter<"TonerInvoice"> | Date | string;
    invoiceNo?: Prisma.StringNullableWithAggregatesFilter<"TonerInvoice"> | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"TonerInvoice"> | string | null;
    checkedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"TonerInvoice"> | Date | string | null;
    checkedBy?: Prisma.StringNullableWithAggregatesFilter<"TonerInvoice"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TonerInvoice"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"TonerInvoice"> | Date | string;
};
export type TonerInvoiceCreateInput = {
    issuedOn: Date | string;
    periodFrom: Date | string;
    periodTo: Date | string;
    invoiceNo?: string | null;
    note?: string | null;
    checkedAt?: Date | string | null;
    checkedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lines?: Prisma.TonerInvoiceLineCreateNestedManyWithoutInvoiceInput;
};
export type TonerInvoiceUncheckedCreateInput = {
    id?: number;
    issuedOn: Date | string;
    periodFrom: Date | string;
    periodTo: Date | string;
    invoiceNo?: string | null;
    note?: string | null;
    checkedAt?: Date | string | null;
    checkedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lines?: Prisma.TonerInvoiceLineUncheckedCreateNestedManyWithoutInvoiceInput;
};
export type TonerInvoiceUpdateInput = {
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lines?: Prisma.TonerInvoiceLineUpdateManyWithoutInvoiceNestedInput;
};
export type TonerInvoiceUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lines?: Prisma.TonerInvoiceLineUncheckedUpdateManyWithoutInvoiceNestedInput;
};
export type TonerInvoiceCreateManyInput = {
    id?: number;
    issuedOn: Date | string;
    periodFrom: Date | string;
    periodTo: Date | string;
    invoiceNo?: string | null;
    note?: string | null;
    checkedAt?: Date | string | null;
    checkedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerInvoiceUpdateManyMutationInput = {
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerInvoiceUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerInvoiceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    issuedOn?: Prisma.SortOrder;
    periodFrom?: Prisma.SortOrder;
    periodTo?: Prisma.SortOrder;
    invoiceNo?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    checkedAt?: Prisma.SortOrder;
    checkedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerInvoiceAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TonerInvoiceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    issuedOn?: Prisma.SortOrder;
    periodFrom?: Prisma.SortOrder;
    periodTo?: Prisma.SortOrder;
    invoiceNo?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    checkedAt?: Prisma.SortOrder;
    checkedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerInvoiceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    issuedOn?: Prisma.SortOrder;
    periodFrom?: Prisma.SortOrder;
    periodTo?: Prisma.SortOrder;
    invoiceNo?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    checkedAt?: Prisma.SortOrder;
    checkedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TonerInvoiceSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TonerInvoiceScalarRelationFilter = {
    is?: Prisma.TonerInvoiceWhereInput;
    isNot?: Prisma.TonerInvoiceWhereInput;
};
export type TonerInvoiceCreateNestedOneWithoutLinesInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceCreateWithoutLinesInput, Prisma.TonerInvoiceUncheckedCreateWithoutLinesInput>;
    connectOrCreate?: Prisma.TonerInvoiceCreateOrConnectWithoutLinesInput;
    connect?: Prisma.TonerInvoiceWhereUniqueInput;
};
export type TonerInvoiceUpdateOneRequiredWithoutLinesNestedInput = {
    create?: Prisma.XOR<Prisma.TonerInvoiceCreateWithoutLinesInput, Prisma.TonerInvoiceUncheckedCreateWithoutLinesInput>;
    connectOrCreate?: Prisma.TonerInvoiceCreateOrConnectWithoutLinesInput;
    upsert?: Prisma.TonerInvoiceUpsertWithoutLinesInput;
    connect?: Prisma.TonerInvoiceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TonerInvoiceUpdateToOneWithWhereWithoutLinesInput, Prisma.TonerInvoiceUpdateWithoutLinesInput>, Prisma.TonerInvoiceUncheckedUpdateWithoutLinesInput>;
};
export type TonerInvoiceCreateWithoutLinesInput = {
    issuedOn: Date | string;
    periodFrom: Date | string;
    periodTo: Date | string;
    invoiceNo?: string | null;
    note?: string | null;
    checkedAt?: Date | string | null;
    checkedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerInvoiceUncheckedCreateWithoutLinesInput = {
    id?: number;
    issuedOn: Date | string;
    periodFrom: Date | string;
    periodTo: Date | string;
    invoiceNo?: string | null;
    note?: string | null;
    checkedAt?: Date | string | null;
    checkedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TonerInvoiceCreateOrConnectWithoutLinesInput = {
    where: Prisma.TonerInvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerInvoiceCreateWithoutLinesInput, Prisma.TonerInvoiceUncheckedCreateWithoutLinesInput>;
};
export type TonerInvoiceUpsertWithoutLinesInput = {
    update: Prisma.XOR<Prisma.TonerInvoiceUpdateWithoutLinesInput, Prisma.TonerInvoiceUncheckedUpdateWithoutLinesInput>;
    create: Prisma.XOR<Prisma.TonerInvoiceCreateWithoutLinesInput, Prisma.TonerInvoiceUncheckedCreateWithoutLinesInput>;
    where?: Prisma.TonerInvoiceWhereInput;
};
export type TonerInvoiceUpdateToOneWithWhereWithoutLinesInput = {
    where?: Prisma.TonerInvoiceWhereInput;
    data: Prisma.XOR<Prisma.TonerInvoiceUpdateWithoutLinesInput, Prisma.TonerInvoiceUncheckedUpdateWithoutLinesInput>;
};
export type TonerInvoiceUpdateWithoutLinesInput = {
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerInvoiceUncheckedUpdateWithoutLinesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    issuedOn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    periodTo?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoiceNo?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    checkedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TonerInvoiceCountOutputType = {
    lines: number;
};
export type TonerInvoiceCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    lines?: boolean | TonerInvoiceCountOutputTypeCountLinesArgs;
};
export type TonerInvoiceCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceCountOutputTypeSelect<ExtArgs> | null;
};
export type TonerInvoiceCountOutputTypeCountLinesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceLineWhereInput;
};
export type TonerInvoiceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    issuedOn?: boolean;
    periodFrom?: boolean;
    periodTo?: boolean;
    invoiceNo?: boolean;
    note?: boolean;
    checkedAt?: boolean;
    checkedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    lines?: boolean | Prisma.TonerInvoice$linesArgs<ExtArgs>;
    _count?: boolean | Prisma.TonerInvoiceCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tonerInvoice"]>;
export type TonerInvoiceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    issuedOn?: boolean;
    periodFrom?: boolean;
    periodTo?: boolean;
    invoiceNo?: boolean;
    note?: boolean;
    checkedAt?: boolean;
    checkedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tonerInvoice"]>;
export type TonerInvoiceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    issuedOn?: boolean;
    periodFrom?: boolean;
    periodTo?: boolean;
    invoiceNo?: boolean;
    note?: boolean;
    checkedAt?: boolean;
    checkedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tonerInvoice"]>;
export type TonerInvoiceSelectScalar = {
    id?: boolean;
    issuedOn?: boolean;
    periodFrom?: boolean;
    periodTo?: boolean;
    invoiceNo?: boolean;
    note?: boolean;
    checkedAt?: boolean;
    checkedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TonerInvoiceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "issuedOn" | "periodFrom" | "periodTo" | "invoiceNo" | "note" | "checkedAt" | "checkedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["tonerInvoice"]>;
export type TonerInvoiceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    lines?: boolean | Prisma.TonerInvoice$linesArgs<ExtArgs>;
    _count?: boolean | Prisma.TonerInvoiceCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TonerInvoiceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TonerInvoiceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TonerInvoicePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TonerInvoice";
    objects: {
        lines: Prisma.$TonerInvoiceLinePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        issuedOn: Date;
        periodFrom: Date;
        periodTo: Date;
        invoiceNo: string | null;
        note: string | null;
        checkedAt: Date | null;
        checkedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tonerInvoice"]>;
    composites: {};
};
export type TonerInvoiceGetPayload<S extends boolean | null | undefined | TonerInvoiceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload, S>;
export type TonerInvoiceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TonerInvoiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TonerInvoiceCountAggregateInputType | true;
};
export interface TonerInvoiceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TonerInvoice'];
        meta: {
            name: 'TonerInvoice';
        };
    };
    findUnique<T extends TonerInvoiceFindUniqueArgs>(args: Prisma.SelectSubset<T, TonerInvoiceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TonerInvoiceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TonerInvoiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TonerInvoiceFindFirstArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceFindFirstArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TonerInvoiceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TonerInvoiceFindManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TonerInvoiceCreateArgs>(args: Prisma.SelectSubset<T, TonerInvoiceCreateArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TonerInvoiceCreateManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TonerInvoiceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TonerInvoiceDeleteArgs>(args: Prisma.SelectSubset<T, TonerInvoiceDeleteArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TonerInvoiceUpdateArgs>(args: Prisma.SelectSubset<T, TonerInvoiceUpdateArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TonerInvoiceDeleteManyArgs>(args?: Prisma.SelectSubset<T, TonerInvoiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TonerInvoiceUpdateManyArgs>(args: Prisma.SelectSubset<T, TonerInvoiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TonerInvoiceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TonerInvoiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TonerInvoiceUpsertArgs>(args: Prisma.SelectSubset<T, TonerInvoiceUpsertArgs<ExtArgs>>): Prisma.Prisma__TonerInvoiceClient<runtime.Types.Result.GetResult<Prisma.$TonerInvoicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TonerInvoiceCountArgs>(args?: Prisma.Subset<T, TonerInvoiceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TonerInvoiceCountAggregateOutputType> : number>;
    aggregate<T extends TonerInvoiceAggregateArgs>(args: Prisma.Subset<T, TonerInvoiceAggregateArgs>): Prisma.PrismaPromise<GetTonerInvoiceAggregateType<T>>;
    groupBy<T extends TonerInvoiceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TonerInvoiceGroupByArgs['orderBy'];
    } : {
        orderBy?: TonerInvoiceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TonerInvoiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTonerInvoiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TonerInvoiceFieldRefs;
}
export interface Prisma__TonerInvoiceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    lines<T extends Prisma.TonerInvoice$linesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TonerInvoice$linesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TonerInvoiceLinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TonerInvoiceFieldRefs {
    readonly id: Prisma.FieldRef<"TonerInvoice", 'Int'>;
    readonly issuedOn: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
    readonly periodFrom: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
    readonly periodTo: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
    readonly invoiceNo: Prisma.FieldRef<"TonerInvoice", 'String'>;
    readonly note: Prisma.FieldRef<"TonerInvoice", 'String'>;
    readonly checkedAt: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
    readonly checkedBy: Prisma.FieldRef<"TonerInvoice", 'String'>;
    readonly createdAt: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"TonerInvoice", 'DateTime'>;
}
export type TonerInvoiceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceWhereUniqueInput;
};
export type TonerInvoiceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceWhereUniqueInput;
};
export type TonerInvoiceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceWhereInput;
    orderBy?: Prisma.TonerInvoiceOrderByWithRelationInput | Prisma.TonerInvoiceOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceScalarFieldEnum | Prisma.TonerInvoiceScalarFieldEnum[];
};
export type TonerInvoiceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceWhereInput;
    orderBy?: Prisma.TonerInvoiceOrderByWithRelationInput | Prisma.TonerInvoiceOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceScalarFieldEnum | Prisma.TonerInvoiceScalarFieldEnum[];
};
export type TonerInvoiceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where?: Prisma.TonerInvoiceWhereInput;
    orderBy?: Prisma.TonerInvoiceOrderByWithRelationInput | Prisma.TonerInvoiceOrderByWithRelationInput[];
    cursor?: Prisma.TonerInvoiceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TonerInvoiceScalarFieldEnum | Prisma.TonerInvoiceScalarFieldEnum[];
};
export type TonerInvoiceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceCreateInput, Prisma.TonerInvoiceUncheckedCreateInput>;
};
export type TonerInvoiceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TonerInvoiceCreateManyInput | Prisma.TonerInvoiceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerInvoiceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    data: Prisma.TonerInvoiceCreateManyInput | Prisma.TonerInvoiceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TonerInvoiceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceUpdateInput, Prisma.TonerInvoiceUncheckedUpdateInput>;
    where: Prisma.TonerInvoiceWhereUniqueInput;
};
export type TonerInvoiceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TonerInvoiceUpdateManyMutationInput, Prisma.TonerInvoiceUncheckedUpdateManyInput>;
    where?: Prisma.TonerInvoiceWhereInput;
    limit?: number;
};
export type TonerInvoiceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TonerInvoiceUpdateManyMutationInput, Prisma.TonerInvoiceUncheckedUpdateManyInput>;
    where?: Prisma.TonerInvoiceWhereInput;
    limit?: number;
};
export type TonerInvoiceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceWhereUniqueInput;
    create: Prisma.XOR<Prisma.TonerInvoiceCreateInput, Prisma.TonerInvoiceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TonerInvoiceUpdateInput, Prisma.TonerInvoiceUncheckedUpdateInput>;
};
export type TonerInvoiceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
    where: Prisma.TonerInvoiceWhereUniqueInput;
};
export type TonerInvoiceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TonerInvoiceWhereInput;
    limit?: number;
};
export type TonerInvoice$linesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TonerInvoiceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TonerInvoiceSelect<ExtArgs> | null;
    omit?: Prisma.TonerInvoiceOmit<ExtArgs> | null;
    include?: Prisma.TonerInvoiceInclude<ExtArgs> | null;
};
