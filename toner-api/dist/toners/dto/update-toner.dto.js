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
exports.UpdateTonerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateTonerDto {
    name;
    color;
    recycled;
    alertThreshold;
    yieldPages;
    printerAssetIds;
}
exports.UpdateTonerDto = UpdateTonerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", Object)
], UpdateTonerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", Object)
], UpdateTonerDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({
        message: 'リサイクル品かどうかは true / false で指定してください',
    }),
    __metadata("design:type", Boolean)
], UpdateTonerDto.prototype, "recycled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '警告する本数は整数で入力してください' }),
    (0, class_validator_1.Min)(0, { message: '警告する本数は 0 以上で入力してください' }),
    __metadata("design:type", Object)
], UpdateTonerDto.prototype, "alertThreshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '印刷可能枚数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '印刷可能枚数は 1 以上で入力してください' }),
    __metadata("design:type", Object)
], UpdateTonerDto.prototype, "yieldPages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)({ message: '同じプリンターが重複しています' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ each: true, message: 'プリンターの指定が不正です' }),
    __metadata("design:type", Array)
], UpdateTonerDto.prototype, "printerAssetIds", void 0);
//# sourceMappingURL=update-toner.dto.js.map