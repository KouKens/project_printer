import { Module } from '@nestjs/common';
import { TonersController } from './toners.controller';
import { TonersService } from './toners.service';

@Module({
  controllers: [TonersController],
  providers: [TonersService],
  exports: [TonersService],
})
export class TonersModule {}
