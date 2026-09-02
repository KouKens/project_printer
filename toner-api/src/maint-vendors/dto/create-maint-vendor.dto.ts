import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * 保守業者の入力。
 * 台帳から選ぶときの見出しになるので、会社名だけは必須にする。
 */
export class CreateMaintVendorDto {
  @IsString()
  @IsNotEmpty({ message: '会社名を入力してください' })
  @MaxLength(120)
  name!: string;

  /**
   * 連絡先。「0942-00-0000（代表）」のように文字も入る。
   * 渡した配列がそのまま連絡先のすべてになる（差分ではなく入れ替え）
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: '電話番号は 3 件まで登録できます' })
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  phones?: string[];

  /**
   * この業者を既定にするメーカー名。台帳の「メーカー」と突き合わせる。
   * 台帳に業者の指定が無い機器は、ここが一致する業者に頼んでいるものとして扱う
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'メーカーの指定が多すぎます' })
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  makers?: string[];

  /** 担当者名や訪問の条件など、番号だけでは足りない情報 */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
