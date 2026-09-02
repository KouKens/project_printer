import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CostsController } from './costs.controller';
import { CostsService } from './costs.service';

@Module({
  imports: [PrismaModule],
  controllers: [CostsController],
  providers: [CostsService],
})
export class CostsModule {}
