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
exports.BulkCreatePrintersDto = exports.BulkPrinterEntryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class BulkPrinterEntryDto {
    ipAddress;
    location;
}
exports.BulkPrinterEntryDto = BulkPrinterEntryDto;
__decorate([
    (0, class_validator_1.IsIP)(4, { message: 'IP アドレスの形式が正しくありません' }),
    __metadata("design:type", String)
], BulkPrinterEntryDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], BulkPrinterEntryDto.prototype, "location", void 0);
class BulkCreatePrintersDto {
    printers;
    community;
    fillLocationFromLedger;
}
exports.BulkCreatePrintersDto = BulkCreatePrintersDto;
__decorate([
    (0, class_validator_1.ArrayNotEmpty)({ message: 'IP アドレスを 1 つ以上入力してください' }),
    (0, class_validator_1.ArrayMaxSize)(200, { message: '一度に登録できるのは 200 台までです' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkPrinterEntryDto),
    __metadata("design:type", Array)
], BulkCreatePrintersDto.prototype, "printers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'コミュニティ名を入力してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], BulkCreatePrintersDto.prototype, "community", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkCreatePrintersDto.prototype, "fillLocationFromLedger", void 0);
//# sourceMappingURL=bulk-create-printers.dto.js.map