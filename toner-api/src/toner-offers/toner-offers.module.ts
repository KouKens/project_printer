import { Module } from '@nestjs/common';
import { TonerOffersController } from './toner-offers.controller';
import { TonerOffersService } from './toner-offers.service';

@Module({
  controllers: [TonerOffersController],
  providers: [TonerOffersService],
})
export class TonerOffersModule {}
