import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTonerOrderDto {
  /** ISO 8601 形式。フロントは datetime-local の値を toISOString() して送る */
  @IsISO8601({}, { message: '注文日時を入力してください' })
  orderedAt: string;

  /** 注文した人。未入力のときはフロントが「ゲスト」を入れて送る */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  userId?: string;

  /**
   * どの拠点の注文か。**必須。**
   * 搬入して在庫になる先と揃えるために持つ
   */
  @Type(() => Number)
  @IsInt({ message: '拠点を選んでください' })
  @Min(1, { message: '拠点を選んでください' })
  companyId: number;

  @IsString()
  @IsNotEmpty({ message: 'トナーIDを入力してください' })
  @MaxLength(64)
  tonerId: string;

  @Type(() => Number)
  @IsInt({ message: '本数は整数で入力してください' })
  @Min(1, { message: '本数は 1 以上で入力してください' })
  @Max(999, { message: '本数は 999 以下で入力してください' })
  quantity: number;

  /** 次回搬入日（YYYY-MM-DD）。任意。搬入の実績と突き合わせる鍵になる */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '次回搬入日は YYYY-MM-DD の形式で入力してください',
  })
  deliveryOn?: string;
}
