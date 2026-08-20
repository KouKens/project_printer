import { Module } from '@nestjs/common';
import { RepairsController } from './repairs.controller';
import { RepairsService } from './repairs.service';

@Module({
  controllers: [RepairsController],
  providers: [RepairsService],
})
export class RepairsModule {}
