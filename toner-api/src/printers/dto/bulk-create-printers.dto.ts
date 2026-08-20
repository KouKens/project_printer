import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsBoolean,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** 一括登録の 1 行分 */
export class BulkPrinterEntryDto {
  @IsIP(4, { message: 'IP アドレスの形式が正しくありません' })
  ipAddress: string;

  /** 行ごとに設置場所を指定できる。省略時は台帳から補う */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;
}

export class BulkCreatePrintersDto {
  /**
   * 1 台ずつ SNMP に問い合わせるので、多すぎると 1 回の要求が長くなる。
   * 現場の台数（60 弱）に対して十分な上限にしてある。
   */
  @ArrayNotEmpty({ message: 'IP アドレスを 1 つ以上入力してください' })
  @ArrayMaxSize(200, { message: '一度に登録できるのは 200 台までです' })
  @ValidateNested({ each: true })
  @Type(() => BulkPrinterEntryDto)
  printers: BulkPrinterEntryDto[];

  /** 全行に共通のコミュニティ名。省略時は public */
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'コミュニティ名を入力してください' })
  @MaxLength(64)
  community?: string;

  /**
   * 設置場所を端末台帳の部署から補うか。既定は補う。
   * 突き合わせは IP ではなく**シリアル**で行う。
   * 同じ IP に複数の機器がぶら下がっている台帳があり、IP で引くと取り違えるため。
   */
  @IsOptional()
  @IsBoolean()
  fillLocationFromLedger?: boolean;
}
