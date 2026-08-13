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
import { CreatePrinterDto } from './dto/create-printer.dto';
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
   * 日次の印刷枚数を今すぐ記録する。
   * 常時起動でない環境では、タスクスケジューラからこれを叩く。
   * ':id' より前に置かないと page-counts が ID として拾われる。
   */
  @Post('page-counts/capture')
  capture() {
    return this.pageCounts.captureAll();
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

  /** 1 台の日次の印刷枚数。既定は直近 30 日 */
  @Get(':id/page-counts')
  findDaily(
    @Param('id', ParseIntPipe) id: number,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.pageCounts.findDaily(id, days);
  }

  /** 1 台だけ今すぐ記録する */
  @Post(':id/page-counts/capture')
  captureOne(@Param('id', ParseIntPipe) id: number) {
    return this.pageCounts.captureOne(id);
  }
}
