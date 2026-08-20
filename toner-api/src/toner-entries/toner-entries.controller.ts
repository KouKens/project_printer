import { Body, Controller, Get, Post } from '@nestjs/common';
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

  @Get('stock')
  findStock() {
    return this.service.findStock();
  }

  /** 棚卸し。数えた本数に在庫を合わせ、差のあった行だけ履歴に残す */
  @Post('stock-take')
  stockTake(@Body() dto: StockTakeDto) {
    return this.service.stockTake(dto);
  }
}
