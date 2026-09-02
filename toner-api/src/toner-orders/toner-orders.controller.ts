import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BulkTonerOrderDto } from './dto/bulk-toner-order.dto';
import { CreateTonerOrderDto } from './dto/create-toner-order.dto';
import { TonerOrdersService } from './toner-orders.service';

@Controller('toner-orders')
export class TonerOrdersController {
  constructor(private readonly service: TonerOrdersService) {}

  @Post()
  create(@Body() dto: CreateTonerOrderDto) {
    return this.service.create(dto);
  }

  /** 同じ注文日時・次回搬入日で複数の品番をまとめて注文する */
  @Post('bulk')
  createMany(@Body() dto: BulkTonerOrderDto) {
    return this.service.bulk(dto);
  }

  /** 注文を取り消す */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
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

  /**
   * 注文と搬入の突き合わせ。品番と日付でまとめ、本数の差を返す。
   * ':id' より前に置く必要はないが、pending と並べておく
   */
  @Get('delivery-check')
  findDeliveryCheck(
    @Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number,
  ) {
    return this.service.findDeliveryCheck(days);
  }
}
