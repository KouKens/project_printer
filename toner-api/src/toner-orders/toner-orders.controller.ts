import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
import { TonerOrdersService } from './toner-orders.service';

@Controller('toner-orders')
export class TonerOrdersController {
  constructor(private readonly service: TonerOrdersService) {}

  @Post()
  create(@Body() dto: CreateTonerOrderDto) {
    return this.service.create(dto);
  }

  /** 注文履歴 */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** 未入荷の注文 */
  @Get('pending')
  findPending() {
    return this.service.findPending();
  }
}
