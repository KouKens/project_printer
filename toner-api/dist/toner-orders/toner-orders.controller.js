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
exports.TonerOrdersController = void 0;
const common_1 = require("@nestjs/common");
const bulk_toner_order_dto_1 = require("./dto/bulk-toner-order.dto");
const create_toner_order_dto_1 = require("./dto/create-toner-order.dto");
const receive_toner_orders_dto_1 = require("./dto/receive-toner-orders.dto");
const toner_orders_service_1 = require("./toner-orders.service");
let TonerOrdersController = class TonerOrdersController {
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
    remove(id) {
        return this.service.remove(id);
    }
    receive(dto) {
        return this.service.receive(dto.ids);
    }
    unreceive(id) {
        return this.service.unreceive(id);
    }
    findAll(companyId) {
        return this.service.findAll(companyId);
    }
    findPending(companyId) {
        return this.service.findPending(companyId);
    }
    findDeliveryCheck(companyId, days, from, to) {
        return this.service.findDeliveryCheck(companyId, days, from, to);
    }
};
exports.TonerOrdersController = TonerOrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_toner_order_dto_1.CreateTonerOrderDto]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_toner_order_dto_1.BulkTonerOrderDto]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "createMany", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('receive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_toner_orders_dto_1.ReceiveTonerOrdersDto]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "receive", null);
__decorate([
    (0, common_1.Post)(':id/unreceive'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "unreceive", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)('companyId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('delivery-check'),
    __param(0, (0, common_1.Query)('companyId', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('days', new common_1.DefaultValuePipe(180), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", void 0)
], TonerOrdersController.prototype, "findDeliveryCheck", null);
exports.TonerOrdersController = TonerOrdersController = __decorate([
    (0, common_1.Controller)('toner-orders'),
    __metadata("design:paramtypes", [toner_orders_service_1.TonerOrdersService])
], TonerOrdersController);
//# sourceMappingURL=toner-orders.controller.js.map