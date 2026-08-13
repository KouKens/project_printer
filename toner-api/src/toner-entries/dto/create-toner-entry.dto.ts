import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export type TonerActionInput = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE';

export class CreateTonerEntryDto {
  @IsIn(['REGISTER', 'RECEIVE', 'ISSUE', 'DISPOSE'], {
    message: '操作区分が不正です',
  })
  action: TonerActionInput;

  @IsString()
  @IsNotEmpty({ message: 'ユーザーIDを読み取ってください' })
  @MaxLength(64)
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'トナーIDを読み取ってください' })
  @MaxLength(64)
  tonerId: string;

  /** 登録時のみ使用。空欄可 */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  /** 搬入・持ち出し・廃棄で使用。省略時は 1 本 */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '本数は整数で入力してください' })
  @Min(1, { message: '本数は 1 以上で入力してください' })
  @Max(999, { message: '本数は 999 以下で入力してください' })
  quantity?: number;
}
