"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterAssetsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const printers_module_1 = require("../printers/printers.module");
const printer_assets_controller_1 = require("./printer-assets.controller");
const printer_assets_service_1 = require("./printer-assets.service");
let PrinterAssetsModule = class PrinterAssetsModule {
};
exports.PrinterAssetsModule = PrinterAssetsModule;
exports.PrinterAssetsModule = PrinterAssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, printers_module_1.PrintersModule],
        controllers: [printer_assets_controller_1.PrinterAssetsController],
        providers: [printer_assets_service_1.PrinterAssetsService],
    })
], PrinterAssetsModule);
//# sourceMappingURL=printer-assets.module.js.map