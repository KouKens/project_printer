"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePrinterAssetDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';
class CreatePrinterAssetDto {
    companyId;
    department;
    no;
    ipAddress;
    maker;
    model;
    serialNumber;
    purchasedOn;
    purchasePrice;
    contractNo;
    countLayout;
    maintVendorId;
    maintContract;
    maintStartOn;
    maintEndOn;
    maintDealOn;
    maintFee;
    note;
}
exports.CreatePrinterAssetDto = CreatePrinterAssetDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '拠点を選んでください' }),
    (0, class_validator_1.Min)(1, { message: '拠点を選んでください' }),
    __metadata("design:type", Number)
], CreatePrinterAssetDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "no", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIP)(4, { message: 'IP アドレスの形式が正しくありません' }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maker", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `購入日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "purchasedOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '購入金額は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '購入金額は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(999_999_999),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "contractNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['TOTAL', 'MONO_COLOR', 'COLOR_MONO'], {
        message: '集計表の行は TOTAL / MONO_COLOR / COLOR_MONO のいずれかで指定してください',
    }),
    __metadata("design:type", String)
], CreatePrinterAssetDto.prototype, "countLayout", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '保守業者の指定が不正です' }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintVendorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['有', '×'], {
        message: '保守は「有」「×」のいずれかで指定してください',
    }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintContract", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `保守開始日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintStartOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `保守終了日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintEndOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `保守取引日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintDealOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '保守金額は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '保守金額は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(999_999_999),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "maintFee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", Object)
], CreatePrinterAssetDto.prototype, "note", void 0);
//# sourceMappingURL=create-printer-asset.dto.js.map