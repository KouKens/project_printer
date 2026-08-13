import {
  IsIn,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** 入力・表示ではコマンドラインと同じ表記を使う（snmpget -v 1 / -v 2c） */
export type SnmpVersionInput = '1' | '2c';

export class CreatePrinterDto {
  @IsIP(4, { message: 'IP アドレスの形式が正しくありません' })
  ipAddress: string;

  /** 省略時は public */
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'コミュニティ名を入力してください' })
  @MaxLength(64)
  community?: string;

  /**
   * 最初に試すバージョン。省略時は 1。
   * 無反応ならもう一方でも試すので、通常は指定しなくてよい。
   */
  @IsOptional()
  @IsIn(['1', '2c'], {
    message: 'SNMP バージョンは 1 か 2c を指定してください',
  })
  version?: SnmpVersionInput;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;
}
