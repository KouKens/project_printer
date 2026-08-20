import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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

  @IsOptional()
  @IsBoolean({
    message: 'リサイクル品かどうかは true / false で指定してください',
  })
  recycled?: boolean;

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
