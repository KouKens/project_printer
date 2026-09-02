import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TonerInvoicesController } from './toner-invoices.controller';
import { TonerInvoicesService } from './toner-invoices.service';

@Module({
  imports: [PrismaModule],
  controllers: [TonerInvoicesController],
  providers: [TonerInvoicesService],
})
export class TonerInvoicesModule {}
