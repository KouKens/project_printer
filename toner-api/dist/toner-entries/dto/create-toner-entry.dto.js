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
exports.CreateTonerEntryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateTonerEntryDto {
    action;
    userId;
    tonerId;
    name;
    quantity;
}
exports.CreateTonerEntryDto = CreateTonerEntryDto;
__decorate([
    (0, class_validator_1.IsIn)(['REGISTER', 'RECEIVE', 'ISSUE', 'DISPOSE'], {
        message: '操作区分が不正です',
    }),
    __metadata("design:type", String)
], CreateTonerEntryDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'ユーザーIDを読み取ってください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateTonerEntryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'トナーIDを読み取ってください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateTonerEntryDto.prototype, "tonerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateTonerEntryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '本数は整数で入力してください' }),
    (0, class_validator_1.Min)(1, { message: '本数は 1 以上で入力してください' }),
    (0, class_validator_1.Max)(999, { message: '本数は 999 以下で入力してください' }),
    __metadata("design:type", Number)
], CreateTonerEntryDto.prototype, "quantity", void 0);
//# sourceMappingURL=create-toner-entry.dto.js.map