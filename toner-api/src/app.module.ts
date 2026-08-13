import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrintersModule } from './printers/printers.module';
import { PrismaModule } from './prisma/prisma.module';
import { TonerEntriesModule } from './toner-entries/toner-entries.module';
import { TonerOrdersModule } from './toner-orders/toner-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TonerEntriesModule,
    TonerOrdersModule,
    PrintersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
