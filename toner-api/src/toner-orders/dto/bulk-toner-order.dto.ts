import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** まとめ注文の 1 行分。注文日時と次回搬入日は行では持たない */
export class BulkTonerOrderItemDto {
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

/**
 * 複数の品番をまとめて注文する。
 * 1 回の注文は同じ注文日時・同じ次回搬入日に揃える（同じ発注の明細だから）。
 */
export class BulkTonerOrderDto {
  /** ISO 8601 形式。フロントは datetime-local の値を toISOString() して送る */
  @IsISO8601({}, { message: '注文日時を入力してください' })
  orderedAt: string;

  /** 注文した人。まとめた全件に同じ名前が入る。未入力なら「ゲスト」 */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  userId?: string;

  /** 次回搬入日（YYYY-MM-DD）。任意。まとめた全件に同じ日付が入る */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '次回搬入日は YYYY-MM-DD の形式で入力してください',
  })
  deliveryOn?: string;

  /** 一度に扱う件数の上限は受付のまとめ処理と揃える */
  @ArrayNotEmpty({ message: 'トナーを 1 件以上入力してください' })
  @ArrayMaxSize(100, { message: '一度に注文できるのは 100 件までです' })
  @ValidateNested({ each: true })
  @Type(() => BulkTonerOrderItemDto)
  items: BulkTonerOrderItemDto[];
}
