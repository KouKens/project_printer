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
exports.ProbePrinterDto = void 0;
const class_validator_1 = require("class-validator");
class ProbePrinterDto {
    ipAddress;
    community;
    version;
}
exports.ProbePrinterDto = ProbePrinterDto;
__decorate([
    (0, class_validator_1.IsIP)(4, { message: 'IP アドレスの形式が正しくありません' }),
    __metadata("design:type", String)
], ProbePrinterDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'コミュニティ名を入力してください' }),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], ProbePrinterDto.prototype, "community", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['1', '2c'], {
        message: 'SNMP バージョンは 1 か 2c を指定してください',
    }),
    __metadata("design:type", String)
], ProbePrinterDto.prototype, "version", void 0);
//# sourceMappingURL=probe-printer.dto.js.map