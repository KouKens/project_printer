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
import { CreateMaintVendorDto } from './dto/create-maint-vendor.dto';
import { MaintVendorsService } from './maint-vendors.service';

/**
 * 保守業者。会社名と連絡先を 1 か所で持ち、端末台帳から参照する。
 * 台帳側に会社名と番号を書き写さないのは、番号が変わったときの直し漏れを防ぐため。
 */
@Controller('maint-vendors')
export class MaintVendorsController {
  constructor(private readonly service: MaintVendorsService) {}

  @Post()
  create(@Body() dto: CreateMaintVendorDto) {
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

  /** 全項目を受け取って置き換える。画面は常に全項目を送る */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMaintVendorDto,
  ) {
    return this.service.update(id, dto);
  }

  /** 参照している台帳は消えず、保守業者が未設定に戻る */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
