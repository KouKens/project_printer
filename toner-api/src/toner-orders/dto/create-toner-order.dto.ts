import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTonerOrderDto {
  /** ISO 8601 形式。フロントは datetime-local の値を toISOString() して送る */
  @IsISO8601({}, { message: '注文日時を入力してください' })
  orderedAt: string;

  @IsString()
  @IsNotEmpty({ message: 'トナーIDを入力してください' })
  @MaxLength(64)
  tonerId: string;

  @Type(() => Number)
  @IsInt({ message: '本数は整数で入力してください' })
  @Min(1, { message: '本数は 1 以上で入力してください' })
  @Max(999, { message: '本数は 999 以下で入力してください' })
  quantity: number;
}
