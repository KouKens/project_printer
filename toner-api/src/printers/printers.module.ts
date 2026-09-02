import { Module } from '@nestjs/common';
import { PageCountsService } from './page-counts.service';
import { PrintersController } from './printers.controller';
import { PrintersService } from './printers.service';
import { SatoStatusService } from './sato-status.service';
import { SnmpService } from './snmp.service';

@Module({
  controllers: [PrintersController],
  providers: [
    PrintersService,
    SnmpService,
    PageCountsService,
    SatoStatusService,
  ],
  // 端末情報の「更新」から実機を取り直すために使う
  exports: [PrintersService],
})
export class PrintersModule {}
