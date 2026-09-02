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

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /** 名前・色・リサイクル区分・対応機器の更新。価格はここでは変えない */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTonerDto) {
    return this.service.update(id, dto);
  }

  /** マスタから消す。履歴・注文・在庫が残っているものは消せない */
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
