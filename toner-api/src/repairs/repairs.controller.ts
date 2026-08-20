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
import { CreateRepairDto } from './dto/create-repair.dto';
import { RepairsService } from './repairs.service';

@Controller('repairs')
export class RepairsController {
  constructor(private readonly service: RepairsService) {}

  @Post()
  create(@Body() dto: CreateRepairDto) {
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

  /**
   * 全項目を受け取って置き換える。
   * 画面のフォームは常に全項目を送るので、部分更新は用意しない
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRepairDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
