import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { TonerActionInput } from './create-toner-entry.dto';

/** 一括処理の 1 行分。操作区分とユーザーIDは行では持たない */
export class BulkTonerEntryItemDto {
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

/**
 * 複数のトナーをまとめて受け付ける。
 * 1 回の操作は 1 つの区分に揃える（搬入と持ち出しを混ぜない）。
 */
export class BulkTonerEntryDto {
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

  /** 窓口で一度に扱う本数を超えない上限にしてある */
  @ArrayNotEmpty({ message: 'トナーを 1 件以上入力してください' })
  @ArrayMaxSize(100, { message: '一度に処理できるのは 100 件までです' })
  @ValidateNested({ each: true })
  @Type(() => BulkTonerEntryItemDto)
  items: BulkTonerEntryItemDto[];

  /**
   * 搬入日（YYYY-MM-DD）。搬入のときだけ使う。
   * まとめて受け付ける分はすべて同じ日付になる
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '搬入日は YYYY-MM-DD の形式で入力してください',
  })
  receivedOn?: string;
}
