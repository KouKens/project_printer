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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonerEntriesController = void 0;
const common_1 = require("@nestjs/common");
const bulk_toner_entry_dto_1 = require("./dto/bulk-toner-entry.dto");
const create_toner_entry_dto_1 = require("./dto/create-toner-entry.dto");
const stock_take_dto_1 = require("./dto/stock-take.dto");
const toner_entries_service_1 = require("./toner-entries.service");
let TonerEntriesController = class TonerEntriesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    createMany(dto) {
        return this.service.bulk(dto);
    }
    findRecent() {
        return this.service.findRecent();
    }
    findHistory(days, action, tonerId, companyId) {
        return this.service.findHistory({
            days,
            action,
            tonerId,
            companyId: companyId ? Number(companyId) : undefined,
        });
    }
    findStock(companyId) {
        return this.service.findStock(companyId);
    }
    remove(id) {
        return this.service.remove(id);
    }
    stockTake(dto) {
        return this.service.stockTake(dto);
    }
};
exports.TonerEntriesController = TonerEntriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toner_entry_dto_1.CreateTonerEntryDto]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_toner_entry_dto_1.BulkTonerEntryDto]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "createMany", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "findRecent", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('days', new common_1.DefaultValuePipe(60), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('tonerId')),
    __param(3, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "findHistory", null);
__decorate([
    (0, common_1.Get)('stock'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "findStock", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('stock-take'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_take_dto_1.StockTakeDto]),
    __metadata("design:returntype", void 0)
], TonerEntriesController.prototype, "stockTake", null);
exports.TonerEntriesController = TonerEntriesController = __decorate([
    (0, common_1.Controller)('toner-entries'),
    __metadata("design:paramtypes", [toner_entries_service_1.TonerEntriesService])
], TonerEntriesController);
//# sourceMappingURL=toner-entries.controller.js.map