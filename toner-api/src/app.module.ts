import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrinterAssetsModule } from './printer-assets/printer-assets.module';
import { PrintersModule } from './printers/printers.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepairsModule } from './repairs/repairs.module';
import { TonerEntriesModule } from './toner-entries/toner-entries.module';
import { TonerOrdersModule } from './toner-orders/toner-orders.module';
import { TonersModule } from './toners/toners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TonerEntriesModule,
    TonerOrdersModule,
    TonersModule,
    PrintersModule,
    PrinterAssetsModule,
    RepairsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
