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

  /**
   * 注文履歴。`companyId` を付けるとその拠点の分だけ。
   * 数字でない値は 400 で断る（NaN は falsy で、絞り込みごと消えるため）
   */
  @Get()
  findAll(
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId?: number,
  ) {
    return this.service.findAll(companyId);
  }

  /** 未入荷の注文。`companyId` を付けるとその拠点の分だけ */
  @Get('pending')
  findPending(
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId?: number,
  ) {
    return this.service.findPending(companyId);
  }

  /**
   * 注文と搬入の突き合わせ。品番と日付でまとめ、本数の差を返す。
   * ':id' より前に置く必要はないが、pending と並べておく。
   *
   * **`companyId` は必須。** 省くと他の拠点の搬入が本数に混ざり、
   * 差が消えてしまう（在庫一覧と同じ扱い）
   */
  @Get('delivery-check')
  findDeliveryCheck(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number,
  ) {
    return this.service.findDeliveryCheck(companyId, days);
  }
}
