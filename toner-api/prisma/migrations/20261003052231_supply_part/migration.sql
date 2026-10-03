-- CreateEnum
CREATE TYPE "SupplyPart" AS ENUM ('TONER', 'DRUM', 'WASTE', 'MAINTENANCE', 'OTHER');

-- AlterTable
ALTER TABLE "toner_offers" ADD COLUMN     "part" "SupplyPart" NOT NULL DEFAULT 'TONER';

-- AlterTable
ALTER TABLE "toners" ADD COLUMN     "part" "SupplyPart" NOT NULL DEFAULT 'TONER';

-- 入れる前からある品番に、商品名と品番の言葉で初期値を入れる。
-- **画面の `guessPart`（printer_manager/src/lib/offer.ts）と同じ言葉・同じ順で判定する。**
-- 「メンテナンス」だけでは決めない（「インクカートリッジ ITH-BK（滅菌機メンテナンス用）」がインクのため）。
-- メンテナンスキット（MK-3381 など。ドラム・現像の交換部品の組）はメンテナンスボックスではないので「その他」
UPDATE "toners" SET "part" = CASE
  WHEN ("id" || ' ' || coalesce("name", '')) ~* '(ドラム|drum)' THEN 'DRUM'
  WHEN ("id" || ' ' || coalesce("name", '')) ~* '(廃トナー|回収ボトル|回収トナー|回収容器|waste)' THEN 'WASTE'
  WHEN ("id" || ' ' || coalesce("name", '')) ~* '(メンテナンスボックス|maintenance ?box)' THEN 'MAINTENANCE'
  WHEN ("id" || ' ' || coalesce("name", '')) ~* '(ベルト|定着|ローラー|メンテナンスキット|fuser|maintenance ?kit)' THEN 'OTHER'
  ELSE 'TONER'
END::"SupplyPart";

UPDATE "toner_offers" SET "part" = CASE
  WHEN ("code" || ' ' || coalesce("name", '')) ~* '(ドラム|drum)' THEN 'DRUM'
  WHEN ("code" || ' ' || coalesce("name", '')) ~* '(廃トナー|回収ボトル|回収トナー|回収容器|waste)' THEN 'WASTE'
  WHEN ("code" || ' ' || coalesce("name", '')) ~* '(メンテナンスボックス|maintenance ?box)' THEN 'MAINTENANCE'
  WHEN ("code" || ' ' || coalesce("name", '')) ~* '(ベルト|定着|ローラー|メンテナンスキット|fuser|maintenance ?kit)' THEN 'OTHER'
  ELSE 'TONER'
END::"SupplyPart";
