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
exports.PrintersController = void 0;
const common_1 = require("@nestjs/common");
const bulk_create_printers_dto_1 = require("./dto/bulk-create-printers.dto");
const create_printer_dto_1 = require("./dto/create-printer.dto");
const probe_printer_dto_1 = require("./dto/probe-printer.dto");
const page_counts_service_1 = require("./page-counts.service");
const printers_service_1 = require("./printers.service");
const sato_status_service_1 = require("./sato-status.service");
let PrintersController = class PrintersController {
    service;
    pageCounts;
    sato;
    constructor(service, pageCounts, sato) {
        this.service = service;
        this.pageCounts = pageCounts;
        this.sato = sato;
    }
    async satoStatus(dto) {
        try {
            return await this.service.readSato(dto.ipAddress.trim());
        }
        catch (error) {
            if (error instanceof sato_status_service_1.SatoUnreachableError) {
                throw new common_1.ServiceUnavailableException(error.message);
            }
            throw error;
        }
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    probe(dto) {
        return this.service.probe(dto);
    }
    dumpCounters(id) {
        return this.service.dumpCounters(id);
    }
    createMany(dto) {
        return this.service.createMany(dto);
    }
    pollAll() {
        return this.service.pollAll();
    }
    capture() {
        return this.pageCounts.captureAll();
    }
    findAllDaily(days, from, to) {
        return this.pageCounts.findAllDaily(days, from, to);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    poll(id) {
        return this.service.poll(id);
    }
    findDaily(id, days, from, to) {
        return this.pageCounts.findDaily(id, days, from, to);
    }
    captureOne(id) {
        return this.pageCounts.captureOne(id);
    }
};
exports.PrintersController = PrintersController;
__decorate([
    (0, common_1.Post)('sato-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [probe_printer_dto_1.ProbePrinterDto]),
    __metadata("design:returntype", Promise)
], PrintersController.prototype, "satoStatus", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_printer_dto_1.CreatePrinterDto]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('probe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [probe_printer_dto_1.ProbePrinterDto]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "probe", null);
__decorate([
    (0, common_1.Get)(':id/counters'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "dumpCounters", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_create_printers_dto_1.BulkCreatePrintersDto]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "createMany", null);
__decorate([
    (0, common_1.Post)('poll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "pollAll", null);
__decorate([
    (0, common_1.Post)('page-counts/capture'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "capture", null);
__decorate([
    (0, common_1.Get)('page-counts'),
    __param(0, (0, common_1.Query)('days', new common_1.DefaultValuePipe(30), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "findAllDaily", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/poll'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "poll", null);
__decorate([
    (0, common_1.Get)(':id/page-counts'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('days', new common_1.DefaultValuePipe(30), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "findDaily", null);
__decorate([
    (0, common_1.Post)(':id/page-counts/capture'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PrintersController.prototype, "captureOne", null);
exports.PrintersController = PrintersController = __decorate([
    (0, common_1.Controller)('printers'),
    __metadata("design:paramtypes", [printers_service_1.PrintersService,
        page_counts_service_1.PageCountsService,
        sato_status_service_1.SatoStatusService])
], PrintersController);
//# sourceMappingURL=printers.controller.js.map