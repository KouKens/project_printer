import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** 価格改定。既存の行は消さず、適用開始日を持つ行を足す */
export class CreateTonerPriceDto {
  @Type(() => Number)
  @IsInt({ message: '価格は整数で入力してください' })
  @Min(0, { message: '価格は 0 以上で入力してください' })
  price: number;

  /** 未指定なら今日から適用 */
  @IsOptional()
  @Matches(DATE_ONLY, {
    message: '適用開始日は YYYY-MM-DD の形式で入力してください',
  })
  effectiveFrom?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string | null;
}
