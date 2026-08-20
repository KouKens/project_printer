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
exports.CreateRepairDto = exports.REPAIR_STATUSES = exports.REPAIR_HANDLERS = exports.REPAIR_CATEGORIES = void 0;
const class_validator_1 = require("class-validator");
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';
exports.REPAIR_CATEGORIES = [
    'PART_REPLACEMENT',
    'SENSOR_DIRT',
    'PAPER_JAM',
    'PRINT_QUALITY',
    'SERVICE_CALL',
    'FEED_FAILURE',
    'FUSING_FAILURE',
    'NETWORK',
    'NOISE_SMELL',
    'NO_POWER',
    'OTHER',
];
exports.REPAIR_HANDLERS = ['IN_HOUSE', 'VENDOR'];
exports.REPAIR_STATUSES = [
    'INVESTIGATING',
    'QUOTING',
    'SETTLING',
    'SHIPPED',
    'RECEIVED',
    'DONE',
];
class CreateRepairDto {
    assignee;
    printerAssetId;
    occurredOn;
    category;
    handledBy;
    detail;
    restoredOn;
    status;
}
exports.CreateRepairDto = CreateRepairDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", Object)
], CreateRepairDto.prototype, "assignee", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'プリンターを選んでください' }),
    __metadata("design:type", Number)
], CreateRepairDto.prototype, "printerAssetId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `発生日は${DATE_MESSAGE}` }),
    __metadata("design:type", Object)
], CreateRepairDto.prototype, "occurredOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.REPAIR_CATEGORIES, { message: '修理分類を選んでください' }),
    __metadata("design:type", Object)
], CreateRepairDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.REPAIR_HANDLERS, { message: '対応区分を選んでください' }),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "handledBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", Object)
], CreateRepairDto.prototype, "detail", void 0);
__decorate([
    (0, class_validator_1.Matches)(DATE_ONLY, { message: `復旧日を${DATE_MESSAGE}` }),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "restoredOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.REPAIR_STATUSES, { message: '状態を選んでください' }),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "status", void 0);
//# sourceMappingURL=create-repair.dto.js.map