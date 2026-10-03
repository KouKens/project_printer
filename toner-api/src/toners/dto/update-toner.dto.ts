import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SUPPLY_PARTS } from '../../common/supply-part';
import type { SupplyPartInput } from '../../common/supply-part';

/**
 * マスタの更新。主キー（品番）は変えられない。
 * 価格は履歴なので、ここではなく POST /toners/:id/prices で足す。
 */
export class UpdateTonerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string | null;

  /** 種類。省略すると変更しない */
  @IsOptional()
  @IsIn(SUPPLY_PARTS, { message: '種類を選んでください' })
  part?: SupplyPartInput;

  @IsOptional()
  @IsBoolean({
    message: 'リサイクル品かどうかは true / false で指定してください',
  })
  recycled?: boolean;

  /**
   * 比較の基準にする純正品の品番。リサイクル品だけが持てる。
   * 省略すると変更しない。null を送れば組から外す
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  genuineId?: string | null;

  /**
   * 他の画面に出さない。省略すると変更しない。
   * 一覧のチェックはこれだけを送る（他の列に触らない）
   */
  @IsOptional()
  @IsBoolean({
    message: '他の画面に出すかどうかは true / false で指定してください',
  })
  hidden?: boolean;

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
   * 省略すると変更しない。null を送れば消せる
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '印刷可能枚数は整数で入力してください' })
  @Min(1, { message: '印刷可能枚数は 1 以上で入力してください' })
  yieldPages?: number | null;

  /**
   * 端末台帳の主キー。渡したものが対応機器のすべてになる。
   * 省略すると変更しない
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique({ message: '同じプリンターが重複しています' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'プリンターの指定が不正です' })
  printerAssetIds?: number[];
}
