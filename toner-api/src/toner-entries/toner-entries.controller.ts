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
import { BulkTonerEntryDto } from './dto/bulk-toner-entry.dto';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { StockTakeDto } from './dto/stock-take.dto';
import { TonerEntriesService } from './toner-entries.service';

@Controller('toner-entries')
export class TonerEntriesController {
  constructor(private readonly service: TonerEntriesService) {}

  /** 登録・搬入の共通受け口。action で分岐する */
  @Post()
  create(@Body() dto: CreateTonerEntryDto) {
    return this.service.create(dto);
  }

  /** 同じ区分の複数行をまとめて処理する。1 行でも通らなければ全体を取り消す */
  @Post('bulk')
  createMany(@Body() dto: BulkTonerEntryDto) {
    return this.service.bulk(dto);
  }

  @Get()
  findRecent() {
    return this.service.findRecent();
  }

  /**
   * 受付の履歴。トナー入出状況の画面で使う。既定は直近 60 日。
   * from / to（YYYY-MM-DD・両端を含む）を渡すとその期間（受付日時で絞る）。
   * `companyId` を付けるとその拠点の分だけ返す（付けなければ全拠点）。
   * 数字でない値は 400 で断る（NaN は falsy で、絞り込みごと消えるため）
   */
  @Get('history')
  findHistory(
    @Query('days', new DefaultValuePipe(60), ParseIntPipe) days: number,
    @Query('action') action?: string,
    @Query('tonerId') tonerId?: string,
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.findHistory({
      days,
      from,
      to,
      action,
      tonerId,
      companyId,
    });
  }

  /**
   * 在庫の一覧。**拠点ごと。** 棚卸しと受付の候補がここから作られるので、
   * `companyId` は必須にする（省くと他の拠点の数を混ぜてしまう）
   */
  @Get('stock')
  findStock(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.service.findStock(companyId);
  }

  /** 受付の記録を取り消す。在庫は操作の逆を当てて戻す */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  /** 棚卸し。数えた本数に在庫を合わせ、差のあった行だけ履歴に残す */
  @Post('stock-take')
  stockTake(@Body() dto: StockTakeDto) {
    return this.service.stockTake(dto);
  }
}
