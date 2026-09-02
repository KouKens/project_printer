import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrintersModule } from '../printers/printers.module';
import { PrinterAssetsController } from './printer-assets.controller';
import { PrinterAssetsService } from './printer-assets.service';

@Module({
  imports: [PrismaModule, PrintersModule],
  controllers: [PrinterAssetsController],
  providers: [PrinterAssetsService],
})
export class PrinterAssetsModule {}
