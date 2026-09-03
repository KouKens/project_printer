import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BulkCreatePrintersDto } from './dto/bulk-create-printers.dto';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { ProbePrinterDto } from './dto/probe-printer.dto';
import { PageCountsService } from './page-counts.service';
import { PrintersService } from './printers.service';
import { SatoStatusService, SatoUnreachableError } from './sato-status.service';

@Controller('printers')
export class PrintersController {
  constructor(
    private readonly service: PrintersService,
    private readonly pageCounts: PageCountsService,
    private readonly sato: SatoStatusService,
  ) {}

  /**
   * SATO ラベルプリンターのステータスを ENQ で 1 台読む。**押したときだけ動く。**
   *
   * 定期実行にも一括ポーリングにも入れていない。相手は印刷用のポートで、
   * 稼働中の機器へこちらから送る操作になるため、人が必要と判断したときだけにする。
   *
   * 結果は実機マスタに残す。protocol を SATO_ENQ として保存するので、
   * 毎日の SNMP 巡回はこの行を拾わず、「応答なし」で上書きされることもない。
   * ':id' より前に置く
   */
  @Post('sato-status')
  async satoStatus(@Body() dto: ProbePrinterDto) {
    try {
      return await this.service.readSato(dto.ipAddress.trim());
    } catch (error) {
      // 応答が無いのは平常運転。SNMP の取得と同じ 503 で返す
      if (error instanceof SatoUnreachableError) {
        throw new ServiceUnavailableException(error.message);
      }
      throw error;
    }
  }

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

  /**
   * メーカー拡張 MIB のカウンタ表をそのまま返す。**調べるための口。**
   * どの ID がコピー・プリンター・ファクスかを実機で確かめるために使う
   */
  @Get(':id/counters')
  dumpCounters(@Param('id', ParseIntPipe) id: number) {
    return this.service.dumpCounters(id);
  }

  /**
   * 消耗品・警告の表をそのまま返す。**調べるための口。**
   *
   * 一覧に定着やドラムが出ない機器で、その行が無いのか、
   * 応答が落ちて表が途中で切れたのかを列ごとの行数で確かめるために使う
   */
  @Get(':id/supplies')
  dumpSupplies(@Param('id', ParseIntPipe) id: number) {
    return this.service.dumpSupplies(id);
  }

  /** 複数の IP をまとめて登録する。応答がない機器は登録されず、理由が返る */
  @Post('bulk')
  createMany(@Body() dto: BulkCreatePrintersDto) {
    return this.service.createMany(dto);
  }

  /**
   * 登録済みの全機器の残量・警告を今すぐ取り直す。
   * 通常は毎日 12 時の定期実行に任せる。常時起動でない環境ではこれを叩く。
   * ':id/poll' とは別。':id' より前に置く
   */
  @Post('poll')
  pollAll() {
    return this.service.pollAll();
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
