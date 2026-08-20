import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BulkCreatePrintersDto } from './dto/bulk-create-printers.dto';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { ProbePrinterDto } from './dto/probe-printer.dto';
import { PageCountsService } from './page-counts.service';
import { PrintersService } from './printers.service';

@Controller('printers')
export class PrintersController {
  constructor(
    private readonly service: PrintersService,
    private readonly pageCounts: PageCountsService,
  ) {}

  /** IP アドレスを受け取り、SNMP で取れた機器情報を保存する */
  @Post()
  create(@Body() dto: CreatePrinterDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * IP アドレスの実機に問い合わせ、結果を返すだけ。DB には保存しない。
   * 端末情報の手入力画面から使う。':id' より前に置く。
   */
  @Post('probe')
  probe(@Body() dto: ProbePrinterDto) {
    return this.service.probe(dto);
  }

  /** 複数の IP をまとめて登録する。応答がない機器は登録されず、理由が返る */
  @Post('bulk')
  createMany(@Body() dto: BulkCreatePrintersDto) {
    return this.service.createMany(dto);
  }

  /**
   * 日次の印刷枚数を今すぐ記録する。
   * 常時起動でない環境では、タスクスケジューラからこれを叩く。
   * ':id' より前に置かないと page-counts が ID として拾われる。
   */
  @Post('page-counts/capture')
  capture() {
    return this.pageCounts.captureAll();
  }

  /**
   * 全機器の日次印刷枚数。':id' より前に置かないと page-counts が ID として拾われる。
   * from / to（YYYY-MM-DD）を渡すとその期間、無ければ直近 days 日。
   */
  @Get('page-counts')
  findAllDaily(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.pageCounts.findAllDaily(days, from, to);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** 登録済みの機器に問い合わせ直す */
  @Post(':id/poll')
  poll(@Param('id', ParseIntPipe) id: number) {
    return this.service.poll(id);
  }

  /** 1 台の日次の印刷枚数。既定は直近 30 日。from / to の扱いは上と同じ */
  @Get(':id/page-counts')
  findDaily(
    @Param('id', ParseIntPipe) id: number,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.pageCounts.findDaily(id, days, from, to);
  }

  /** 1 台だけ今すぐ記録する */
  @Post(':id/page-counts/capture')
  captureOne(@Param('id', ParseIntPipe) id: number) {
    return this.pageCounts.captureOne(id);
  }
}
