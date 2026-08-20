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
exports.TonersController = void 0;
const common_1 = require("@nestjs/common");
const create_toner_price_dto_1 = require("./dto/create-toner-price.dto");
const create_toner_dto_1 = require("./dto/create-toner.dto");
const update_toner_dto_1 = require("./dto/update-toner.dto");
const toners_service_1 = require("./toners.service");
let TonersController = class TonersController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    findPrices(id) {
        return this.service.findPrices(id);
    }
    addPrice(id, dto) {
        return this.service.addPrice(id, dto);
    }
    priceAt(id, date) {
        return this.service
            .priceAt(id, date)
            .then((price) => ({ id, date, price }));
    }
};
exports.TonersController = TonersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toner_dto_1.CreateTonerDto]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_toner_dto_1.UpdateTonerDto]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/prices'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "findPrices", null);
__decorate([
    (0, common_1.Post)(':id/prices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_toner_price_dto_1.CreateTonerPriceDto]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "addPrice", null);
__decorate([
    (0, common_1.Get)(':id/price-at'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TonersController.prototype, "priceAt", null);
exports.TonersController = TonersController = __decorate([
    (0, common_1.Controller)('toners'),
    __metadata("design:paramtypes", [toners_service_1.TonersService])
], TonersController);
//# sourceMappingURL=toners.controller.js.map