"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintersModule = void 0;
const common_1 = require("@nestjs/common");
const page_counts_service_1 = require("./page-counts.service");
const printers_controller_1 = require("./printers.controller");
const printers_service_1 = require("./printers.service");
const snmp_service_1 = require("./snmp.service");
let PrintersModule = class PrintersModule {
};
exports.PrintersModule = PrintersModule;
exports.PrintersModule = PrintersModule = __decorate([
    (0, common_1.Module)({
        controllers: [printers_controller_1.PrintersController],
        providers: [printers_service_1.PrintersService, snmp_service_1.SnmpService, page_counts_service_1.PageCountsService],
    })
], PrintersModule);
//# sourceMappingURL=printers.module.js.map