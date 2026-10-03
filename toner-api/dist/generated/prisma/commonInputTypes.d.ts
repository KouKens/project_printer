import * as $Enums from "./enums.js";
import type * as Prisma from "./internal/prismaNamespace.js";
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type EnumSupplyPartFilter<$PrismaModel = never> = {
    equals?: $Enums.SupplyPart | Prisma.EnumSupplyPartFieldRefInput<$PrismaModel>;
    in?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel> | $Enums.SupplyPart;
};
export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type EnumSupplyPartWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SupplyPart | Prisma.EnumSupplyPartFieldRefInput<$PrismaModel>;
    in?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSupplyPartWithAggregatesFilter<$PrismaModel> | $Enums.SupplyPart;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel>;
};
export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumOfferKindFilter<$PrismaModel = never> = {
    equals?: $Enums.OfferKind | Prisma.EnumOfferKindFieldRefInput<$PrismaModel>;
    in?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOfferKindFilter<$PrismaModel> | $Enums.OfferKind;
};
export type EnumPurchaseTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseType | Prisma.EnumPurchaseTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel> | $Enums.PurchaseType;
};
export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedBoolNullableFilter<$PrismaModel> | boolean | null;
};
export type EnumOfferKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OfferKind | Prisma.EnumOfferKindFieldRefInput<$PrismaModel>;
    in?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOfferKindWithAggregatesFilter<$PrismaModel> | $Enums.OfferKind;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOfferKindFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOfferKindFilter<$PrismaModel>;
};
export type EnumPurchaseTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseType | Prisma.EnumPurchaseTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPurchaseTypeWithAggregatesFilter<$PrismaModel> | $Enums.PurchaseType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel>;
};
export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
};
export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolNullableFilter<$PrismaModel>;
};
export type EnumTonerActionFilter<$PrismaModel = never> = {
    equals?: $Enums.TonerAction | Prisma.EnumTonerActionFieldRefInput<$PrismaModel>;
    in?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTonerActionFilter<$PrismaModel> | $Enums.TonerAction;
};
export type EnumTonerActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TonerAction | Prisma.EnumTonerActionFieldRefInput<$PrismaModel>;
    in?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTonerActionWithAggregatesFilter<$PrismaModel> | $Enums.TonerAction;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTonerActionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTonerActionFilter<$PrismaModel>;
};
export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | Prisma.EnumOrderStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus;
};
export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | Prisma.EnumOrderStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel>;
};
export type EnumSnmpVersionFilter<$PrismaModel = never> = {
    equals?: $Enums.SnmpVersion | Prisma.EnumSnmpVersionFieldRefInput<$PrismaModel>;
    in?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel> | $Enums.SnmpVersion;
};
export type EnumPrinterProtocolFilter<$PrismaModel = never> = {
    equals?: $Enums.PrinterProtocol | Prisma.EnumPrinterProtocolFieldRefInput<$PrismaModel>;
    in?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel> | $Enums.PrinterProtocol;
};
export type EnumSnmpVersionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SnmpVersion | Prisma.EnumSnmpVersionFieldRefInput<$PrismaModel>;
    in?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSnmpVersionWithAggregatesFilter<$PrismaModel> | $Enums.SnmpVersion;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel>;
};
export type EnumPrinterProtocolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PrinterProtocol | Prisma.EnumPrinterProtocolFieldRefInput<$PrismaModel>;
    in?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPrinterProtocolWithAggregatesFilter<$PrismaModel> | $Enums.PrinterProtocol;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel>;
};
export type EnumCountLayoutFilter<$PrismaModel = never> = {
    equals?: $Enums.CountLayout | Prisma.EnumCountLayoutFieldRefInput<$PrismaModel>;
    in?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel> | $Enums.CountLayout;
};
export type EnumCountLayoutWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CountLayout | Prisma.EnumCountLayoutFieldRefInput<$PrismaModel>;
    in?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCountLayoutWithAggregatesFilter<$PrismaModel> | $Enums.CountLayout;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel>;
};
export type EnumRepairCategoryNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairCategory | Prisma.EnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel> | $Enums.RepairCategory | null;
};
export type EnumRepairHandlerFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairHandler | Prisma.EnumRepairHandlerFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel> | $Enums.RepairHandler;
};
export type EnumRepairStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairStatus | Prisma.EnumRepairStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel> | $Enums.RepairStatus;
};
export type EnumRepairCategoryNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairCategory | Prisma.EnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRepairCategoryNullableWithAggregatesFilter<$PrismaModel> | $Enums.RepairCategory | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel>;
};
export type EnumRepairHandlerWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairHandler | Prisma.EnumRepairHandlerFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairHandlerWithAggregatesFilter<$PrismaModel> | $Enums.RepairHandler;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel>;
};
export type EnumRepairStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairStatus | Prisma.EnumRepairStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairStatusWithAggregatesFilter<$PrismaModel> | $Enums.RepairStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel>;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedEnumSupplyPartFilter<$PrismaModel = never> = {
    equals?: $Enums.SupplyPart | Prisma.EnumSupplyPartFieldRefInput<$PrismaModel>;
    in?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel> | $Enums.SupplyPart;
};
export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedEnumSupplyPartWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SupplyPart | Prisma.EnumSupplyPartFieldRefInput<$PrismaModel>;
    in?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SupplyPart[] | Prisma.ListEnumSupplyPartFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSupplyPartWithAggregatesFilter<$PrismaModel> | $Enums.SupplyPart;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSupplyPartFilter<$PrismaModel>;
};
export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedEnumOfferKindFilter<$PrismaModel = never> = {
    equals?: $Enums.OfferKind | Prisma.EnumOfferKindFieldRefInput<$PrismaModel>;
    in?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOfferKindFilter<$PrismaModel> | $Enums.OfferKind;
};
export type NestedEnumPurchaseTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseType | Prisma.EnumPurchaseTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel> | $Enums.PurchaseType;
};
export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedBoolNullableFilter<$PrismaModel> | boolean | null;
};
export type NestedEnumOfferKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OfferKind | Prisma.EnumOfferKindFieldRefInput<$PrismaModel>;
    in?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OfferKind[] | Prisma.ListEnumOfferKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOfferKindWithAggregatesFilter<$PrismaModel> | $Enums.OfferKind;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOfferKindFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOfferKindFilter<$PrismaModel>;
};
export type NestedEnumPurchaseTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PurchaseType | Prisma.EnumPurchaseTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PurchaseType[] | Prisma.ListEnumPurchaseTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPurchaseTypeWithAggregatesFilter<$PrismaModel> | $Enums.PurchaseType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPurchaseTypeFilter<$PrismaModel>;
};
export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
};
export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolNullableFilter<$PrismaModel>;
};
export type NestedEnumTonerActionFilter<$PrismaModel = never> = {
    equals?: $Enums.TonerAction | Prisma.EnumTonerActionFieldRefInput<$PrismaModel>;
    in?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTonerActionFilter<$PrismaModel> | $Enums.TonerAction;
};
export type NestedEnumTonerActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TonerAction | Prisma.EnumTonerActionFieldRefInput<$PrismaModel>;
    in?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TonerAction[] | Prisma.ListEnumTonerActionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTonerActionWithAggregatesFilter<$PrismaModel> | $Enums.TonerAction;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTonerActionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTonerActionFilter<$PrismaModel>;
};
export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | Prisma.EnumOrderStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus;
};
export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | Prisma.EnumOrderStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrderStatus[] | Prisma.ListEnumOrderStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrderStatusFilter<$PrismaModel>;
};
export type NestedEnumSnmpVersionFilter<$PrismaModel = never> = {
    equals?: $Enums.SnmpVersion | Prisma.EnumSnmpVersionFieldRefInput<$PrismaModel>;
    in?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel> | $Enums.SnmpVersion;
};
export type NestedEnumPrinterProtocolFilter<$PrismaModel = never> = {
    equals?: $Enums.PrinterProtocol | Prisma.EnumPrinterProtocolFieldRefInput<$PrismaModel>;
    in?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel> | $Enums.PrinterProtocol;
};
export type NestedEnumSnmpVersionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SnmpVersion | Prisma.EnumSnmpVersionFieldRefInput<$PrismaModel>;
    in?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SnmpVersion[] | Prisma.ListEnumSnmpVersionFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSnmpVersionWithAggregatesFilter<$PrismaModel> | $Enums.SnmpVersion;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSnmpVersionFilter<$PrismaModel>;
};
export type NestedEnumPrinterProtocolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PrinterProtocol | Prisma.EnumPrinterProtocolFieldRefInput<$PrismaModel>;
    in?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PrinterProtocol[] | Prisma.ListEnumPrinterProtocolFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPrinterProtocolWithAggregatesFilter<$PrismaModel> | $Enums.PrinterProtocol;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPrinterProtocolFilter<$PrismaModel>;
};
export type NestedEnumCountLayoutFilter<$PrismaModel = never> = {
    equals?: $Enums.CountLayout | Prisma.EnumCountLayoutFieldRefInput<$PrismaModel>;
    in?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel> | $Enums.CountLayout;
};
export type NestedEnumCountLayoutWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CountLayout | Prisma.EnumCountLayoutFieldRefInput<$PrismaModel>;
    in?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CountLayout[] | Prisma.ListEnumCountLayoutFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCountLayoutWithAggregatesFilter<$PrismaModel> | $Enums.CountLayout;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCountLayoutFilter<$PrismaModel>;
};
export type NestedEnumRepairCategoryNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairCategory | Prisma.EnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel> | $Enums.RepairCategory | null;
};
export type NestedEnumRepairHandlerFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairHandler | Prisma.EnumRepairHandlerFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel> | $Enums.RepairHandler;
};
export type NestedEnumRepairStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairStatus | Prisma.EnumRepairStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel> | $Enums.RepairStatus;
};
export type NestedEnumRepairCategoryNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairCategory | Prisma.EnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    in?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.RepairCategory[] | Prisma.ListEnumRepairCategoryFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumRepairCategoryNullableWithAggregatesFilter<$PrismaModel> | $Enums.RepairCategory | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairCategoryNullableFilter<$PrismaModel>;
};
export type NestedEnumRepairHandlerWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairHandler | Prisma.EnumRepairHandlerFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairHandler[] | Prisma.ListEnumRepairHandlerFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairHandlerWithAggregatesFilter<$PrismaModel> | $Enums.RepairHandler;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairHandlerFilter<$PrismaModel>;
};
export type NestedEnumRepairStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RepairStatus | Prisma.EnumRepairStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RepairStatus[] | Prisma.ListEnumRepairStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRepairStatusWithAggregatesFilter<$PrismaModel> | $Enums.RepairStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRepairStatusFilter<$PrismaModel>;
};
