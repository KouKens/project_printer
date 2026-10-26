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
import { ReceiveTonerOrdersDto } from './dto/receive-toner-orders.dto';
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
   * 注文を手動で入荷済みにする（トナー入出状況で一致しなかった行用）。
   * 一致した行は搬入を受け付けた時点で自動で入荷済みになる
   */
  @Post('receive')
  receive(@Body() dto: ReceiveTonerOrdersDto) {
    return this.service.receive(dto.ids);
  }

  /** 手動で入荷済みにした注文を未入荷に戻す。自動のものは戻せない */
  @Post(':id/unreceive')
  unreceive(@Param('id', ParseIntPipe) id: number) {
    return this.service.unreceive(id);
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
   * 注文と搬入の突き合わせ。拠点・品番・日付でまとめ、本数の差を返す。
   * ':id' より前に置く必要はないが、pending と並べておく。
   *
   * `companyId` を付けるとその拠点の分だけ。省けば全拠点（トナー入出状況）。
   * 拠点が鍵に入っているので、省いても他の拠点の搬入が本数に混ざらない。
   * from / to（YYYY-MM-DD・両端を含む）を渡すとその期間、無ければ直近 days 日。
   * どちらも突き合わせの日付（次回搬入日・搬入日）で絞る
   */
  @Get('delivery-check')
  findDeliveryCheck(
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId: number | undefined,
    @Query('days', new DefaultValuePipe(180), ParseIntPipe) days: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findDeliveryCheck(companyId, days, from, to);
  }
}
