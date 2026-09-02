import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** 請求書の明細 1 行。単価は請求書の数字をそのまま入れる（税別） */
export class CreateTonerInvoiceLineDto {
  @IsString()
  @IsNotEmpty({ message: 'トナーを選んでください' })
  @MaxLength(64)
  tonerId: string;

  @Type(() => Number)
  @IsInt({ message: '本数は整数で入力してください' })
  @Min(1, { message: '本数は 1 以上で入力してください' })
  @Max(9999, { message: '本数は 9999 以下で入力してください' })
  quantity: number;

  /**
   * 税別の単価（円）。円未満を扱わないので整数。
   * マスタに価格が無い品番は未入力のまま登録できる（あとで価格を登録して見直す）
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '単価は整数で入力してください' })
  @Min(0, { message: '単価は 0 以上で入力してください' })
  @Max(10_000_000, { message: '単価が大きすぎます' })
  unitPrice?: number | null;
}

export class CreateTonerInvoiceDto {
  @Matches(DATE_ONLY, {
    message: '請求日は YYYY-MM-DD の形式で入力してください',
  })
  issuedOn: string;

  /** 突き合わせる搬入の期間。画面が請求日から既定値を作って送る */
  @Matches(DATE_ONLY, {
    message: '対象期間の開始日は YYYY-MM-DD の形式で入力してください',
  })
  periodFrom: string;

  @Matches(DATE_ONLY, {
    message: '対象期間の終了日は YYYY-MM-DD の形式で入力してください',
  })
  periodTo: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  invoiceNo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  note?: string | null;

  /** 明細。件数の上限は受付・注文のまとめ処理と揃える */
  @ArrayNotEmpty({ message: '明細を 1 件以上入力してください' })
  @ArrayMaxSize(100, { message: '一度に登録できる明細は 100 件までです' })
  @ValidateNested({ each: true })
  @Type(() => CreateTonerInvoiceLineDto)
  lines: CreateTonerInvoiceLineDto[];
}
