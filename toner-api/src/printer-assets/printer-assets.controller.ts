import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePrinterAssetDto } from './dto/create-printer-asset.dto';
import { PrinterAssetsService } from './printer-assets.service';

/**
 * 端末台帳。手入力の内容をここで保存する。
 * 実機の今の状態（残量・累計枚数）は保存しない。あちらは POST /printers/probe。
 */
@Controller('printer-assets')
export class PrinterAssetsController {
  constructor(private readonly service: PrinterAssetsService) {}

  @Post()
  create(@Body() dto: CreatePrinterAssetDto) {
    return this.service.create(dto);
  }

  /**
   * 台帳の一覧。**既定は有効な台だけ、全拠点まとめて。**
   *
   * `?includeDisabled=1` を付けたときだけ無効にした台も返す（プリンター登録の画面用）。
   * `?companyId=` を付けるとその拠点の台だけ返す。付けなければ全拠点
   * （修理・プリンター状況は全拠点で見るので、既定は絞らない）
   *
   * **数字でない companyId は 400 で断る。** `Number()` で読むと NaN になり、
   * NaN は falsy なので絞り込みごと消えて全拠点が返る。絞ったつもりで
   * 他の拠点が混ざるより、読めなかったと言うほうがよい
   */
  @Get()
  findAll(
    @Query('includeDisabled') includeDisabled?: string,
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId?: number,
  ) {
    return this.service.findAll(includeDisabled === '1', companyId);
  }

  /**
   * 台帳に実機の情報と直近の印刷枚数を足した一覧。
   * ':id' より前に置かないと overview が ID として拾われる。
   */
  @Get('overview')
  findOverview() {
    return this.service.findOverview();
  }

  /**
   * 台帳を機種でまとめ、その機種で使うトナーを添えた一覧。
   * これも ':id' より前に置く。
   *
   * **拠点ごとに見る画面（トナー個数状況）用。** `companyId` は必須で、
   * 機種も在庫もその拠点の分だけを数える
   */
  @Get('by-model')
  findByModel(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.service.findByModel(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePrinterAssetDto,
  ) {
    return this.service.update(id, dto);
  }

  /**
   * その台帳の IP に問い合わせて実機の情報を取り直し、台帳の更新日も進める。
   * 一覧の「更新」ボタンから呼ぶ
   */
  @Post(':id/refresh')
  refresh(@Param('id', ParseIntPipe) id: number) {
    return this.service.refresh(id);
  }

  /** 中身は変えず、更新日だけ現在時刻に進める */
  @Post(':id/touch')
  touch(@Param('id', ParseIntPipe) id: number) {
    return this.service.touch(id);
  }

  /**
   * 使わなくなった台を無効にする。**普段はこちらを使う。**
   * 修理履歴を残したまま、一覧と選択肢から外せる
   */
  @Post(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.service.setDisabled(id, true);
  }

  /** 無効にした台を元に戻す */
  @Post(':id/enable')
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.service.setDisabled(id, false);
  }

  /**
   * 台帳から完全に消す。**登録し間違えた行の後始末用。**
   *
   * 無効にしたものだけ、修理履歴が無いときだけ通る。
   * 履歴があるときは件数を添えて 400 で返す（消すと道連れになるため）
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
