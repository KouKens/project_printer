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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

/**
 * 機器とトナーを持っている拠点。**在庫と受け払いを分ける単位。**
 *
 * 画面のセレクタはここから作る。認証が無いので切り替えは誰でもできる
 */
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  /**
   * 拠点の一覧。**既定は有効な拠点だけ。**
   * `?includeDisabled=1` を付けたときだけ無効の分も返す（拠点登録の画面用）
   */
  @Get()
  findAll(@Query('includeDisabled') includeDisabled?: string) {
    return this.service.findAll(includeDisabled === '1');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCompanyDto) {
    return this.service.update(id, dto);
  }

  /** 使わなくなった拠点を無効にする。**普段はこちら。** 記録は残る */
  @Post(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.service.setDisabled(id, true);
  }

  /** 無効にした拠点を元に戻す */
  @Post(':id/enable')
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.service.setDisabled(id, false);
  }

  /**
   * 拠点を完全に消す。**登録し間違えた行の後始末用。**
   * 無効にしたものだけ、機器・在庫・履歴・注文が 1 つも無いときだけ通る
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
