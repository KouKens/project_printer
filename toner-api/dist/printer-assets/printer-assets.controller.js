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
exports.PrinterAssetsController = void 0;
const common_1 = require("@nestjs/common");
const create_printer_asset_dto_1 = require("./dto/create-printer-asset.dto");
const printer_assets_service_1 = require("./printer-assets.service");
let PrinterAssetsController = class PrinterAssetsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll(includeDisabled) {
        return this.service.findAll(includeDisabled === '1');
    }
    findOverview() {
        return this.service.findOverview();
    }
    findByModel() {
        return this.service.findByModel();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    refresh(id) {
        return this.service.refresh(id);
    }
    touch(id) {
        return this.service.touch(id);
    }
    disable(id) {
        return this.service.setDisabled(id, true);
    }
    enable(id) {
        return this.service.setDisabled(id, false);
    }
};
exports.PrinterAssetsController = PrinterAssetsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_printer_asset_dto_1.CreatePrinterAssetDto]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includeDisabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "findOverview", null);
__decorate([
    (0, common_1.Get)('by-model'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "findByModel", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_printer_asset_dto_1.CreatePrinterAssetDto]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/refresh'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)(':id/touch'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "touch", null);
__decorate([
    (0, common_1.Post)(':id/disable'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "disable", null);
__decorate([
    (0, common_1.Post)(':id/enable'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrinterAssetsController.prototype, "enable", null);
exports.PrinterAssetsController = PrinterAssetsController = __decorate([
    (0, common_1.Controller)('printer-assets'),
    __metadata("design:paramtypes", [printer_assets_service_1.PrinterAssetsService])
], PrinterAssetsController);
//# sourceMappingURL=printer-assets.controller.js.map