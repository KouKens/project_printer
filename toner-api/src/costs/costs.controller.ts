import { Controller, Get, Query } from '@nestjs/common';
import { CostsService } from './costs.service';

/**
 * 運用コスト。カタログ値からの見積りと、実際に使ったぶんを同じ期間で返す。
 * 期間を省略すると、印刷枚数の記録がある全期間で計算する。
 */
@Controller('costs')
export class CostsController {
  constructor(private readonly service: CostsService) {}

  @Get()
  find(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('years') years?: string,
  ) {
    return this.service.find({
      from: from || undefined,
      to: to || undefined,
      years: years ? Number(years) : undefined,
    });
  }
}
