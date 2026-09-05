import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
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

  /**
   * どの拠点の受け払いか。**必須。**
   * 在庫は「品番 × 拠点」なので、動かす先をここで決める
   */
  @Type(() => Number)
  @IsInt({ message: '拠点を選んでください' })
  @Min(1, { message: '拠点を選んでください' })
  companyId: number;

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

  /**
   * 搬入日（YYYY-MM-DD）。搬入のときだけ使う。
   * 省略したときは受け付けた日を入れる
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '搬入日は YYYY-MM-DD の形式で入力してください',
  })
  receivedOn?: string;
}
