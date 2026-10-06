import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

/**
 * 注文を手動で入荷済みにするときの入力。
 * トナー入出状況の 1 行（拠点 ＋ 品番 ＋ 日付）に未入荷の注文が複数あれば、まとめて送る
 */
export class ReceiveTonerOrdersDto {
  @IsArray({ message: '注文を選んでください' })
  @ArrayNotEmpty({ message: '注文を選んでください' })
  @ArrayMaxSize(200)
  @IsInt({ each: true, message: '注文の指定が不正です' })
  ids!: number[];
}
