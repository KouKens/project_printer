import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { CostsModule } from './costs/costs.module';
import { MaintVendorsModule } from './maint-vendors/maint-vendors.module';
import { PrinterAssetsModule } from './printer-assets/printer-assets.module';
import { PrintersModule } from './printers/printers.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepairsModule } from './repairs/repairs.module';
import { TonerEntriesModule } from './toner-entries/toner-entries.module';
import { TonerInvoicesModule } from './toner-invoices/toner-invoices.module';
import { TonerOrdersModule } from './toner-orders/toner-orders.module';
import { TonersModule } from './toners/toners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CompaniesModule,
    TonerEntriesModule,
    TonerInvoicesModule,
    TonerOrdersModule,
    TonersModule,
    PrintersModule,
    PrinterAssetsModule,
    MaintVendorsModule,
    RepairsModule,
    CostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
