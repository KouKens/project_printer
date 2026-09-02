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
exports.CreateTonerInvoiceDto = exports.CreateTonerInvoiceLineDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
class CreateTonerInvoiceLineDto {
    tonerId;
    quantity;
    unitPrice;
}
exports.CreateTonerInvoiceLineDto = CreateTonerInvoiceLineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'トナーを選んでください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateTonerInvoiceLineDto.prototype, "tonerId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '本数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '本数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(9999, { message: '本数は 9999 以下で入力してください' }),
    __metadata("design:type", Number)
], CreateTonerInvoiceLineDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '単価は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '単価は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(10_000_000, { message: '単価が大きすぎます' }),
    __metadata("design:type", Object)
], CreateTonerInvoiceLineDto.prototype, "unitPrice", void 0);
class CreateTonerInvoiceDto {
    issuedOn;
    periodFrom;
    periodTo;
    invoiceNo;
    note;
    lines;
}
exports.CreateTonerInvoiceDto = CreateTonerInvoiceDto;
__decorate([
    (0, class_validator_1.Matches)(DATE_ONLY, {
        message: '請求日は YYYY-MM-DD の形式で入力してください',
    }),
    __metadata("design:type", String)
], CreateTonerInvoiceDto.prototype, "issuedOn", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_ONLY, {
        message: '対象期間の開始日は YYYY-MM-DD の形式で入力してください',
    }),
    __metadata("design:type", String)
], CreateTonerInvoiceDto.prototype, "periodFrom", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_ONLY, {
        message: '対象期間の終了日は YYYY-MM-DD の形式で入力してください',
    }),
    __metadata("design:type", String)
], CreateTonerInvoiceDto.prototype, "periodTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", Object)
], CreateTonerInvoiceDto.prototype, "invoiceNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(400),
    __metadata("design:type", Object)
], CreateTonerInvoiceDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.ArrayNotEmpty)({ message: '明細を 1 件以上入力してください' }),
    (0, class_validator_1.ArrayMaxSize)(100, { message: '一度に登録できる明細は 100 件までです' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateTonerInvoiceLineDto),
    __metadata("design:type", Array)
], CreateTonerInvoiceDto.prototype, "lines", void 0);
//# sourceMappingURL=create-toner-invoice.dto.js.map