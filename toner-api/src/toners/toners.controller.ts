import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTonerPriceDto } from './dto/create-toner-price.dto';
import { CreateTonerDto } from './dto/create-toner.dto';
import { UpdateTonerDto } from './dto/update-toner.dto';
import { TonersService } from './toners.service';

@Controller('toners')
export class TonersController {
  constructor(private readonly service: TonersService) {}

  /** マスタ登録。対応機器と初回価格も一緒に受ける */
  @Post()
  create(@Body() dto: CreateTonerDto) {
    return this.service.create(dto);
  }

  /**
   * マスタの一覧。**既定は有効で、他の画面に出す品番だけ。**
   * `?includeDisabled=1` を付けたときだけ全部を返す（トナー登録の画面用）
   */
  @Get()
  findAll(@Query('includeDisabled') includeDisabled?: string) {
    return this.service.findAll(includeDisabled === '1');
  }

  /*
   * 固定の道は `:id` より前に置く。後ろに置くと品番として読まれる
   */

  /** 他の画面に出さない品番（無効も含む）。トナー入出状況が記録を絞るのに使う */
  @Get('hidden')
  findHiddenIds() {
    return this.service.findHiddenIds();
  }

  /** 価格比較の画面用。全品番を、価格の履歴と使える機種を添えて返す */
  @Get('price-compare')
  findPriceCompare() {
    return this.service.findPriceCompare();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * 名前・色・リサイクル区分・純正品・他の画面に出すか・対応機器の更新。
   * 価格はここでは変えない
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTonerDto) {
    return this.service.update(id, dto);
  }

  /**
   * 使わなくなった品番を無効にする。**普段はこちらを使う。**
   * 受付の履歴・注文・請求書から指されていても、記録を残したまま外せる
   */
  @Post(':id/disable')
  disable(@Param('id') id: string) {
    return this.service.setDisabled(id, true);
  }

  /** 無効にした品番を元に戻す */
  @Post(':id/enable')
  enable(@Param('id') id: string) {
    return this.service.setDisabled(id, false);
  }

  /**
   * 品番を完全に消す。**登録し間違えたものの後始末用。**
   *
   * 無効にしたものだけ、参照が 1 つも無いときだけ通る。
   * 何かから指されているときは、何が残っているかを添えて 400 で返す
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /** 価格の履歴。新しい順 */
  @Get(':id/prices')
  findPrices(@Param('id') id: string) {
    return this.service.findPrices(id);
  }

  /** 価格改定。過去の行は残したまま新しい行を足す */
  @Post(':id/prices')
  addPrice(@Param('id') id: string, @Body() dto: CreateTonerPriceDto) {
    return this.service.addPrice(id, dto);
  }

  /** 指定日に有効だった税別価格。統計から使う */
  @Get(':id/price-at')
  priceAt(@Param('id') id: string, @Query('date') date: string) {
    return this.service
      .priceAt(id, date)
      .then((price) => ({ id, date, price }));
  }
}
