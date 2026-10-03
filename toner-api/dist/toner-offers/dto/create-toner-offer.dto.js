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
exports.CreateTonerOfferDto = exports.OfferModelDto = exports.PURCHASE_TYPES = exports.OFFER_KINDS = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const supply_part_1 = require("../../common/supply-part");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';
exports.OFFER_KINDS = ['GENUINE', 'RECYCLED', 'COMPATIBLE'];
exports.PURCHASE_TYPES = [
    'SPOT',
    'ONLINE',
    'CONTRACT',
    'SUBSCRIPTION',
    'OTHER',
];
class OfferModelDto {
    maker;
    model;
}
exports.OfferModelDto = OfferModelDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", Object)
], OfferModelDto.prototype, "maker", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '機種の型番が空です' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], OfferModelDto.prototype, "model", void 0);
class CreateTonerOfferDto {
    code;
    name;
    brand;
    kind;
    part;
    color;
    yieldPages;
    packQuantity;
    seller;
    purchaseType;
    price;
    pagePrice;
    monthlyFee;
    shippingFee;
    minOrder;
    leadTime;
    warranty;
    takesBack;
    payment;
    quotedOn;
    validUntil;
    reference;
    url;
    contact;
    note;
    models;
}
exports.CreateTonerOfferDto = CreateTonerOfferDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '品番を入力してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateTonerOfferDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.OFFER_KINDS, { message: '区分を選んでください' }),
    __metadata("design:type", String)
], CreateTonerOfferDto.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(supply_part_1.SUPPLY_PARTS, { message: '種類を選んでください' }),
    __metadata("design:type", String)
], CreateTonerOfferDto.prototype, "part", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '印刷可能枚数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '印刷可能枚数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(10_000_000),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "yieldPages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '入数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '入数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateTonerOfferDto.prototype, "packQuantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '販売店・購入先を入力してください' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateTonerOfferDto.prototype, "seller", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.PURCHASE_TYPES, { message: '購入形態を選んでください' }),
    __metadata("design:type", String)
], CreateTonerOfferDto.prototype, "purchaseType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '価格は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '価格は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(99_999_999),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 3 }, { message: '1 枚あたりの料金は小数 3 桁までの数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '1 枚あたりの料金は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(10_000),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "pagePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '月額の基本料金は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '月額の基本料金は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(99_999_999),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "monthlyFee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '送料・手数料は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '送料・手数料は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(9_999_999),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "shippingFee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: '最小注文数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '最小注文数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(10_000),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "minOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "leadTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "warranty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '回収の有無は true / false で指定してください' }),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "takesBack", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "payment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `価格を確かめた日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "quotedOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `見積の有効期限は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "validUntil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    (0, class_validator_1.Matches)(/^https?:\/\/\S+$/i, {
        message: '商品ページは http:// か https:// で始まる URL を入力してください',
    }),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "contact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", Object)
], CreateTonerOfferDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(200, { message: '機種の指定が多すぎます' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfferModelDto),
    __metadata("design:type", Array)
], CreateTonerOfferDto.prototype, "models", void 0);
//# sourceMappingURL=create-toner-offer.dto.js.map