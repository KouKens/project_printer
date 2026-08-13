import { Module } from '@nestjs/common';
import { TonerEntriesController } from './toner-entries.controller';
import { TonerEntriesService } from './toner-entries.service';

@Module({
  controllers: [TonerEntriesController],
  providers: [TonerEntriesService],
})
export class TonerEntriesModule {}