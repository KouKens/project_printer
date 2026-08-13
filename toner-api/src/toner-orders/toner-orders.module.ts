import { Module } from '@nestjs/common';
import { TonerOrdersController } from './toner-orders.controller';
import { TonerOrdersService } from './toner-orders.service';

@Module({
  controllers: [TonerOrdersController],
  providers: [TonerOrdersService],
})
export class TonerOrdersModule {}
