import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** 棚卸しの 1 行分。counted は棚で実際に数えた本数 */
export class StockTakeCountDto {
  @IsString()
  @IsNotEmpty({ message: 'トナーIDを指定してください' })
  @MaxLength(64)
  tonerId: string;

  @Type(() => Number)
  @IsInt({ message: '実数は整数で入力してください' })
  @Min(0, { message: '実数は 0 以上で入力してください' })
  @Max(9999, { message: '実数は 9999 以下で入力してください' })
  counted: number;
}

export class StockTakeDto {
  /**
   * 数えた人。棚卸しは職員証を読まずに回ることがあるので未入力を許す。
   * 空のときはサービス側で GUEST_USER（ゲスト）に置き換えて記録する。
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  userId?: string;

  /**
   * どの拠点の受け払いか。**必須。**
   * 在庫は「品番 × 拠点」なので、動かす先をここで決める
   */
  @Type(() => Number)
  @IsInt({ message: '拠点を選んでください' })
  @Min(1, { message: '拠点を選んでください' })
  companyId: number;

  /** 数えた行だけ送る。差が無い行が混ざっていても構わない（記録しない） */
  @ArrayNotEmpty({ message: '実数を 1 件以上入力してください' })
  @ArrayMaxSize(500, { message: '一度に送れるのは 500 件までです' })
  @ValidateNested({ each: true })
  @Type(() => StockTakeCountDto)
  counts: StockTakeCountDto[];
}
