"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const companies_module_1 = require("./companies/companies.module");
const costs_module_1 = require("./costs/costs.module");
const maint_vendors_module_1 = require("./maint-vendors/maint-vendors.module");
const printer_assets_module_1 = require("./printer-assets/printer-assets.module");
const printers_module_1 = require("./printers/printers.module");
const prisma_module_1 = require("./prisma/prisma.module");
const repairs_module_1 = require("./repairs/repairs.module");
const toner_entries_module_1 = require("./toner-entries/toner-entries.module");
const toner_invoices_module_1 = require("./toner-invoices/toner-invoices.module");
const toner_orders_module_1 = require("./toner-orders/toner-orders.module");
const toners_module_1 = require("./toners/toners.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            companies_module_1.CompaniesModule,
            toner_entries_module_1.TonerEntriesModule,
            toner_invoices_module_1.TonerInvoicesModule,
            toner_orders_module_1.TonerOrdersModule,
            toners_module_1.TonersModule,
            printers_module_1.PrintersModule,
            printer_assets_module_1.PrinterAssetsModule,
            maint_vendors_module_1.MaintVendorsModule,
            repairs_module_1.RepairsModule,
            costs_module_1.CostsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map