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
exports.StockTakeDto = exports.StockTakeCountDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class StockTakeCountDto {
    tonerId;
    counted;
}
exports.StockTakeCountDto = StockTakeCountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'トナーIDを指定してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], StockTakeCountDto.prototype, "tonerId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '実数は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '実数は 0 以上で入力してください' }),
    (0, class_validator_1.Max)(9999, { message: '実数は 9999 以下で入力してください' }),
    __metadata("design:type", Number)
], StockTakeCountDto.prototype, "counted", void 0);
class StockTakeDto {
    userId;
    companyId;
    counts;
}
exports.StockTakeDto = StockTakeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], StockTakeDto.prototype, "userId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '会社を選んでください' }),
    (0, class_validator_1.Min)(1, { message: '会社を選んでください' }),
    __metadata("design:type", Number)
], StockTakeDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.ArrayNotEmpty)({ message: '実数を 1 件以上入力してください' }),
    (0, class_validator_1.ArrayMaxSize)(500, { message: '一度に送れるのは 500 件までです' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StockTakeCountDto),
    __metadata("design:type", Array)
], StockTakeDto.prototype, "counts", void 0);
//# sourceMappingURL=stock-take.dto.js.map