import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 拠点の入力。
 * セレクタの見出しになるので、拠点名だけは必須にする。
 */
export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: '拠点名を入力してください' })
  @MaxLength(120)
  name!: string;

  /** 並び順。よく使う拠点を上に出すために持つ。同値なら名前順 */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '並び順は整数で入力してください' })
  @Min(0, { message: '並び順は 0 以上で入力してください' })
  sortOrder?: number;

  /** 略称や管理上の覚え書き */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
