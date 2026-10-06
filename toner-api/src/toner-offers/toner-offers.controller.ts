import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTonerOfferDto } from './dto/create-toner-offer.dto';
import { TonerOffersService } from './toner-offers.service';

/**
 * 比較用トナー（販売店 × 買い方ごと。画面は「比較用トナー登録」）。
 * **トナー価格比較だけが読む。** 受付・注文・在庫などはトナー登録（/toners）を使う
 */
@Controller('toner-offers')
export class TonerOffersController {
  constructor(private readonly service: TonerOffersService) {}

  /** 一覧と、登録の画面が使う選択肢（有効な台帳の機種・トナー登録の色） */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTonerOfferDto) {
    return this.service.create(dto);
  }

  /** 送られてこなかった項目は変えない。値を消すときは null を送る */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTonerOfferDto,
  ) {
    return this.service.update(id, dto);
  }

  /** 他から参照されないので、無効を挟まずに消せる */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
