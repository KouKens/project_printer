-- CreateEnum
CREATE TYPE "receive_mode" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "toner_orders" ADD COLUMN     "receive_mode" "receive_mode",
ADD COLUMN     "received_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "toner_orders_company_id_toner_id_delivery_on_idx" ON "toner_orders"("company_id", "toner_id", "delivery_on");

-- これまでの注文のうち、搬入の記録と本数が一致しているものを入荷済み（自動）にする。
-- 入荷済みにする処理がこれまで無かったので、届いた注文もすべて PENDING のまま残っている。
-- 判定はアプリの reconcileOrders と同じ: 拠点 ＋ 品番 ＋ 日付（注文の次回搬入日 =
-- 搬入の搬入日）ごとに、取り消していない注文の本数の合計と搬入の本数の合計が等しいこと。
-- 次回搬入日の無い注文は突き合わせられないので触らない（トナー入出状況で手動にする）
UPDATE "toner_orders" AS o
SET "status" = 'RECEIVED',
    "receive_mode" = 'AUTO',
    "received_at" = CURRENT_TIMESTAMP,
    "updated_at" = CURRENT_TIMESTAMP
FROM (
  SELECT t."company_id", t."toner_id", t."delivery_on"
  FROM "toner_orders" AS t
  WHERE t."status" <> 'CANCELED'
    AND t."delivery_on" IS NOT NULL
  GROUP BY t."company_id", t."toner_id", t."delivery_on"
  HAVING SUM(t."quantity") > 0
     AND SUM(t."quantity") = (
       SELECT COALESCE(SUM(e."quantity"), 0)
       FROM "toner_entries" AS e
       WHERE e."action" = 'RECEIVE'
         AND e."company_id" = t."company_id"
         AND e."toner_id" = t."toner_id"
         AND e."received_on" = t."delivery_on"
     )
) AS matched
WHERE o."status" = 'PENDING'
  AND o."company_id" = matched."company_id"
  AND o."toner_id" = matched."toner_id"
  AND o."delivery_on" = matched."delivery_on";
