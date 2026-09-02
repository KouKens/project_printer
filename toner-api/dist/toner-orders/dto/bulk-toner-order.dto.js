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
exports.BulkTonerOrderDto = exports.BulkTonerOrderItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class BulkTonerOrderItemDto {
    tonerId;
    quantity;
}
exports.BulkTonerOrderItemDto = BulkTonerOrderItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'トナーIDを入力してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], BulkTonerOrderItemDto.prototype, "tonerId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '本数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '本数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(999, { message: '本数は 999 以下で入力してください' }),
    __metadata("design:type", Number)
], BulkTonerOrderItemDto.prototype, "quantity", void 0);
class BulkTonerOrderDto {
    orderedAt;
    userId;
    deliveryOn;
    items;
}
exports.BulkTonerOrderDto = BulkTonerOrderDto;
__decorate([
    (0, class_validator_1.IsISO8601)({}, { message: '注文日時を入力してください' }),
    __metadata("design:type", String)
], BulkTonerOrderDto.prototype, "orderedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], BulkTonerOrderDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: '次回搬入日は YYYY-MM-DD の形式で入力してください',
    }),
    __metadata("design:type", String)
], BulkTonerOrderDto.prototype, "deliveryOn", void 0);
__decorate([
    (0, class_validator_1.ArrayNotEmpty)({ message: 'トナーを 1 件以上入力してください' }),
    (0, class_validator_1.ArrayMaxSize)(100, { message: '一度に注文できるのは 100 件までです' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkTonerOrderItemDto),
    __metadata("design:type", Array)
], BulkTonerOrderDto.prototype, "items", void 0);
//# sourceMappingURL=bulk-toner-order.dto.js.map