import {
  IsIP,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** 画面の <input type="date"> と同じ形。時刻は持たない */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';

/**
 * 端末台帳の入力。
 * 空欄は null で送る。@IsOptional() は null と undefined を素通しするので、
 * 更新時に null を送れば値を消せる。
 */
export class CreatePrinterAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  no?: string | null;

  @IsOptional()
  @IsIP(4, { message: 'IP アドレスの形式が正しくありません' })
  ipAddress?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  maker?: string | null;

  /** 型番 */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  serialNumber?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `購入日は${DATE_MESSAGE}` })
  purchasedOn?: string | null;

  /** 購入金額（円）。保守金額と同じく整数で受ける */
  @IsOptional()
  @IsInt({ message: '購入金額は整数で入力してください' })
  @Min(0, { message: '購入金額は 0 以上で入力してください' })
  @Max(999_999_999)
  purchasePrice?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contractNo?: string | null;

  /** 枚数の集計表でこの機器が占める行 */
  @IsOptional()
  @IsIn(['TOTAL', 'MONO_COLOR', 'COLOR_MONO'], {
    message:
      '集計表の行は TOTAL / MONO_COLOR / COLOR_MONO のいずれかで指定してください',
  })
  countLayout?: 'TOTAL' | 'MONO_COLOR' | 'COLOR_MONO';

  /**
   * 保守を頼んでいる業者。会社名と連絡先は業者マスタが持つので、
   * 台帳は ID だけを指す。未設定なら null
   */
  @IsOptional()
  @IsInt({ message: '保守業者の指定が不正です' })
  maintVendorId?: number | null;

  /**
   * 保守契約の有無の手入力。
   * 保守終了日が入っていない機器のために残してある欄で、
   * 終了日があるときは画面がこちらを使わず日付から判定する。
   * 元台帳から取り込んだ値と同じ「有」「×」だけを受ける
   */
  @IsOptional()
  @IsIn(['有', '×'], {
    message: '保守は「有」「×」のいずれかで指定してください',
  })
  maintContract?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `保守開始日は${DATE_MESSAGE}` })
  maintStartOn?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `保守終了日は${DATE_MESSAGE}` })
  maintEndOn?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `保守取引日は${DATE_MESSAGE}` })
  maintDealOn?: string | null;

  @IsOptional()
  @IsInt({ message: '保守金額は整数で入力してください' })
  @Min(0, { message: '保守金額は 0 以上で入力してください' })
  @Max(999_999_999)
  maintFee?: number | null;

  /** 備考。「初期」「リース」など日付・金額の欄に入っていた値の受け皿 */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
