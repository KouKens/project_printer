import { Module } from '@nestjs/common';
import { PageCountsService } from './page-counts.service';
import { PrintersController } from './printers.controller';
import { PrintersService } from './printers.service';
import { SnmpService } from './snmp.service';

@Module({
  controllers: [PrintersController],
  providers: [PrintersService, SnmpService, PageCountsService],
})
export class PrintersModule {}
