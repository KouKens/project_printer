import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SUPPLY_PARTS } from '../../common/supply-part';
import type { SupplyPartInput } from '../../common/supply-part';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';

export const OFFER_KINDS = ['GENUINE', 'RECYCLED', 'COMPATIBLE'] as const;
export const PURCHASE_TYPES = [
  'SPOT',
  'ONLINE',
  'CONTRACT',
  'SUBSCRIPTION',
  'OTHER',
] as const;

export type OfferKindInput = (typeof OFFER_KINDS)[number];
export type PurchaseTypeInput = (typeof PURCHASE_TYPES)[number];

/** 使える機種 1 つ。台帳の表記（メーカー・型番）のまま送る */
export class OfferModelDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  maker?: string | null;

  @IsString()
  @IsNotEmpty({ message: '機種の型番が空です' })
  @MaxLength(120)
  model!: string;
}

/**
 * 比較用トナー。登録と更新で同じ形を使う。
 *
 * 必須は品番と販売店の 2 つだけ。値段も枚数も分からないうちに
 * 「この店が扱っている」ことだけ先に入れておけるようにする。
 * **更新では送られてこなかった項目に触らない**（値を消すときは null を送る）
 */
export class CreateTonerOfferDto {
  @IsString()
  @IsNotEmpty({ message: '品番を入力してください' })
  @MaxLength(64)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string | null;

  @IsOptional()
  @IsIn(OFFER_KINDS, { message: '区分を選んでください' })
  kind?: OfferKindInput;

  /** 種類（トナー・ドラム・廃トナーボトル…）。送らなければトナー・インク */
  @IsOptional()
  @IsIn(SUPPLY_PARTS, { message: '種類を選んでください' })
  part?: SupplyPartInput;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string | null;

  @IsOptional()
  @IsInt({ message: '印刷可能枚数は整数で入力してください' })
  @Min(1, { message: '印刷可能枚数は 1 以上で入力してください' })
  @Max(10_000_000)
  yieldPages?: number | null;

  /** 1 つの値段で何本入っているか。送らなければ 1 本 */
  @IsOptional()
  @IsInt({ message: '入数は整数で入力してください' })
  @Min(1, { message: '入数は 1 以上で入力してください' })
  @Max(1000)
  packQuantity?: number;

  @IsString()
  @IsNotEmpty({ message: '販売店・購入先を入力してください' })
  @MaxLength(120)
  seller!: string;

  @IsOptional()
  @IsIn(PURCHASE_TYPES, { message: '購入形態を選んでください' })
  purchaseType?: PurchaseTypeInput;

  /** 税別（円）。入数ぶんの値段 */
  @IsOptional()
  @IsInt({ message: '価格は整数で入力してください' })
  @Min(0, { message: '価格は 0 以上で入力してください' })
  @Max(99_999_999)
  price?: number | null;

  /** 1 枚あたりの料金（カウンター料金など）。小数 3 桁まで */
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 3 },
    { message: '1 枚あたりの料金は小数 3 桁までの数で入力してください' },
  )
  @Min(0, { message: '1 枚あたりの料金は 0 以上で入力してください' })
  @Max(10_000)
  pagePrice?: number | null;

  @IsOptional()
  @IsInt({ message: '月額の基本料金は整数で入力してください' })
  @Min(0, { message: '月額の基本料金は 0 以上で入力してください' })
  @Max(99_999_999)
  monthlyFee?: number | null;

  @IsOptional()
  @IsInt({ message: '送料・手数料は整数で入力してください' })
  @Min(0, { message: '送料・手数料は 0 以上で入力してください' })
  @Max(9_999_999)
  shippingFee?: number | null;

  @IsOptional()
  @IsInt({ message: '最小注文数は整数で入力してください' })
  @Min(1, { message: '最小注文数は 1 以上で入力してください' })
  @Max(10_000)
  minOrder?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  leadTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  warranty?: string | null;

  /** 使用済みの引き取り。null は「確かめていない」 */
  @IsOptional()
  @IsBoolean({ message: '回収の有無は true / false で指定してください' })
  takesBack?: boolean | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  payment?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `価格を確かめた日は${DATE_MESSAGE}` })
  quotedOn?: string | null;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `見積の有効期限は${DATE_MESSAGE}` })
  validUntil?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string | null;

  /**
   * 商品ページ。**http(s) だけ受ける**（画面がそのままリンクにするので、
   * javascript: などで始まる値を入れさせない）
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^https?:\/\/\S+$/i, {
    message: '商品ページは http:// か https:// で始まる URL を入力してください',
  })
  url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contact?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;

  /**
   * 使える機種。渡した配列がそのまま全部になる（差分ではなく入れ替え）。
   * 更新で省略すると変更しない
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200, { message: '機種の指定が多すぎます' })
  @ValidateNested({ each: true })
  @Type(() => OfferModelDto)
  models?: OfferModelDto[];
}
