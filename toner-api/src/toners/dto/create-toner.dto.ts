import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class CreateTonerDto {
  /** 品番・バーコード。マスタの主キー */
  @IsString()
  @IsNotEmpty({ message: 'トナーIDを入力してください' })
  @MaxLength(64)
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string | null;

  /** 「ブラック」「4色パック」など。色の無い消耗品は未入力 */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string | null;

  @IsOptional()
  @IsBoolean({
    message: 'リサイクル品かどうかは true / false で指定してください',
  })
  recycled?: boolean;

  /**
   * 在庫がこの本数以下になったら一覧で警告する。
   * 未入力（null）なら警告しない
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '警告する本数は整数で入力してください' })
  @Min(0, { message: '警告する本数は 0 以上で入力してください' })
  alertThreshold?: number | null;

  /**
   * 1 本で刷れる枚数（カタログの印刷可能枚数）。
   * 1 枚あたりのトナー代を出すのに使う。公表値が無ければ未入力
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '印刷可能枚数は整数で入力してください' })
  @Min(1, { message: '印刷可能枚数は 1 以上で入力してください' })
  yieldPages?: number | null;

  /** 対応する機器。端末台帳（printer_assets）の主キーで受ける */
  @IsOptional()
  @IsArray()
  @ArrayUnique({ message: '同じプリンターが重複しています' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'プリンターの指定が不正です' })
  printerAssetIds?: number[];

  /** 初回の税別価格。未入力なら価格の無いマスタとして登録する */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '価格は整数で入力してください' })
  @Min(0, { message: '価格は 0 以上で入力してください' })
  price?: number | null;

  /** 初回価格の適用開始日。未指定なら今日 */
  @IsOptional()
  @Matches(DATE_ONLY, {
    message: '適用開始日は YYYY-MM-DD の形式で入力してください',
  })
  effectiveFrom?: string | null;
}
