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

  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * 台帳に実機の情報と直近の印刷枚数を足した一覧。
   * ':id' より前に置かないと overview が ID として拾われる。
   */
  @Get('overview')
  findOverview() {
    return this.service.findOverview();
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

  /** 中身は変えず、更新日だけ現在時刻に進める */
  @Post(':id/touch')
  touch(@Param('id', ParseIntPipe) id: number) {
    return this.service.touch(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
