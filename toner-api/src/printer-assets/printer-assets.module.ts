import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrinterAssetsController } from './printer-assets.controller';
import { PrinterAssetsService } from './printer-assets.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrinterAssetsController],
  providers: [PrinterAssetsService],
})
export class PrinterAssetsModule {}
