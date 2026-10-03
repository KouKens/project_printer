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
exports.CreateTonerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const supply_part_1 = require("../../common/supply-part");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
class CreateTonerDto {
    id;
    name;
    color;
    part;
    recycled;
    genuineId;
    hidden;
    alertThreshold;
    yieldPages;
    printerAssetIds;
    price;
    effectiveFrom;
}
exports.CreateTonerDto = CreateTonerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'トナーIDを入力してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateTonerDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(supply_part_1.SUPPLY_PARTS, { message: '種類を選んでください' }),
    __metadata("design:type", String)
], CreateTonerDto.prototype, "part", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({
        message: 'リサイクル品かどうかは true / false で指定してください',
    }),
    __metadata("design:type", Boolean)
], CreateTonerDto.prototype, "recycled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "genuineId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({
        message: '他の画面に出すかどうかは true / false で指定してください',
    }),
    __metadata("design:type", Boolean)
], CreateTonerDto.prototype, "hidden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '警告する本数は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '警告する本数は 0 以上で入力してください' }),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "alertThreshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '印刷可能枚数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '印刷可能枚数は 1 以上で入力してください' }),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "yieldPages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)({ message: '同じプリンターが重複しています' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ each: true, message: 'プリンターの指定が不正です' }),
    __metadata("design:type", Array)
], CreateTonerDto.prototype, "printerAssetIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '価格は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '価格は 0 以上で入力してください' }),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, {
        message: '適用開始日は YYYY-MM-DD の形式で入力してください',
    }),
    __metadata("design:type", Object)
], CreateTonerDto.prototype, "effectiveFrom", void 0);
//# sourceMappingURL=create-toner.dto.js.map