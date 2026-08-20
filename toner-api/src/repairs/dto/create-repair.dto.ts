import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'YYYY-MM-DD の形式で入力してください';

export const REPAIR_CATEGORIES = [
  'PART_REPLACEMENT',
  'SENSOR_DIRT',
  'PAPER_JAM',
  'PRINT_QUALITY',
  'SERVICE_CALL',
  'FEED_FAILURE',
  'FUSING_FAILURE',
  'NETWORK',
  'NOISE_SMELL',
  'NO_POWER',
  'OTHER',
] as const;

/** 対応区分。自分で直したか、業者を呼んだか */
export const REPAIR_HANDLERS = ['IN_HOUSE', 'VENDOR'] as const;

export const REPAIR_STATUSES = [
  'INVESTIGATING',
  'QUOTING',
  'SETTLING',
  'SHIPPED',
  'RECEIVED',
  'DONE',
] as const;

export type RepairCategoryInput = (typeof REPAIR_CATEGORIES)[number];
export type RepairHandlerInput = (typeof REPAIR_HANDLERS)[number];
export type RepairStatusInput = (typeof REPAIR_STATUSES)[number];

/**
 * 必須はプリンター名・対応区分・復旧日の 3 つだけ。
 * 残りは分かる範囲で埋める欄なので、未入力で通す。
 * 未入力は null で送る（@IsOptional は null / undefined のとき検証を飛ばす）
 */
export class CreateRepairDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  assignee?: string | null;

  @IsInt({ message: 'プリンターを選んでください' })
  printerAssetId!: number;

  @IsOptional()
  @Matches(DATE_ONLY, { message: `発生日は${DATE_MESSAGE}` })
  occurredOn?: string | null;

  @IsOptional()
  @IsIn(REPAIR_CATEGORIES, { message: '修理分類を選んでください' })
  category?: RepairCategoryInput | null;

  @IsIn(REPAIR_HANDLERS, { message: '対応区分を選んでください' })
  handledBy!: RepairHandlerInput;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  detail?: string | null;

  /** 必須。未入力でも形式違いでも同じ欄を直してもらうので、文言をまとめる */
  @Matches(DATE_ONLY, { message: `復旧日を${DATE_MESSAGE}` })
  restoredOn!: string;

  /** 選び直さなければ調査中から始まる。画面の選択欄は常に値を持つ */
  @IsOptional()
  @IsIn(REPAIR_STATUSES, { message: '状態を選んでください' })
  status?: RepairStatusInput;
}
