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
import { CreateTonerInvoiceDto } from './dto/create-toner-invoice.dto';
import { TonerInvoicesService } from './toner-invoices.service';

/**
 * 業者から届く請求書。入力と、搬入との突き合わせを扱う。
 * 在庫は動かさない（請求書は「請求された内容」の記録で、物の出入りではない）
 */
@Controller('toner-invoices')
export class TonerInvoicesController {
  constructor(private readonly service: TonerInvoicesService) {}

  @Post()
  create(@Body() dto: CreateTonerInvoiceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** 請求書と、対象期間の搬入との突き合わせ */
  @Get(':id/check')
  check(@Param('id', ParseIntPipe) id: number) {
    return this.service.check(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTonerInvoiceDto,
  ) {
    return this.service.update(id, dto);
  }

  /** 突き合わせを確かめた記録を残す */
  @Post(':id/checked')
  markChecked(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { checkedBy?: string },
  ) {
    return this.service.markChecked(id, body?.checkedBy);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
