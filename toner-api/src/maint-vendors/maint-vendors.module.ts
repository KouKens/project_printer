import { Module } from '@nestjs/common';
import { MaintVendorsController } from './maint-vendors.controller';
import { MaintVendorsService } from './maint-vendors.service';

@Module({
  controllers: [MaintVendorsController],
  providers: [MaintVendorsService],
})
export class MaintVendorsModule {}
