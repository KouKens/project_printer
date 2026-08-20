import {
  IsIn,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { SnmpVersionInput } from './create-printer.dto';

/**
 * 保存を伴わない問い合わせの入力。
 * 端末情報の手入力画面から、実機の今の状態を見るためだけに使う。
 */
export class ProbePrinterDto {
  @IsIP(4, { message: 'IP アドレスの形式が正しくありません' })
  ipAddress: string;

  /** 省略時は public */
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'コミュニティ名を入力してください' })
  @MaxLength(64)
  community?: string;

  /** 最初に試すバージョン。省略時は 1。無反応ならもう一方も試す */
  @IsOptional()
  @IsIn(['1', '2c'], {
    message: 'SNMP バージョンは 1 か 2c を指定してください',
  })
  version?: SnmpVersionInput;
}
