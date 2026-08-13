import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTonerEntryDto } from './dto/create-toner-entry.dto';
import { TonerEntriesService } from './toner-entries.service';

@Controller('toner-entries')
export class TonerEntriesController {
  constructor(private readonly service: TonerEntriesService) {}

  /** 登録・搬入の共通受け口。action で分岐する */
  @Post()
  create(@Body() dto: CreateTonerEntryDto) {
    return this.service.create(dto);
  }

  @Get()
  findRecent() {
    return this.service.findRecent();
  }

  @Get('stock')
  findStock() {
    return this.service.findStock();
  }
}
