-- 会社を持たせる。機器とトナーの在庫・受け払いを会社ごとに分ける。
--
-- **既存の行は失わない。** 会社を 1 つ作り、いまある機器・在庫・履歴・注文を
-- すべてその会社に寄せてから NOT NULL にする。運用中の本番でも
-- そのまま流せるように、列の追加 → backfill → 制約の順で書いてある。
--
-- 請求書（toner_invoices）は会社を持たない。請求書入力・請求書状況は
-- 全社まとめて見る画面なので、絞り込む単位が要らない。
--
-- 在庫（toner_stocks）だけは主キーが変わる。品番だけで 1 行だったものを
-- 「品番 × 会社」にするため。品番マスタ（toners）は全社共通のままなので、
-- 会社ごとの数を持てるのはこの表だけになる。

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "disabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- 既存データの引き取り先。名前は運用側で直せるよう当たり障りのないものにする。
-- 既に会社が入っている DB では作らない（migrate を撒き直したときの二重作成を防ぐ）
INSERT INTO "companies" ("name", "sort_order", "note", "updated_at")
SELECT '既定の会社', 0, '会社を分ける前からあった機器・在庫・履歴の引き取り先', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "companies");

-- AlterTable: まず null 可で足し、既定の会社で埋めてから NOT NULL にする
ALTER TABLE "printer_assets" ADD COLUMN "company_id" INTEGER;
ALTER TABLE "toner_entries"  ADD COLUMN "company_id" INTEGER;
ALTER TABLE "toner_orders"   ADD COLUMN "company_id" INTEGER;
ALTER TABLE "toner_stocks"   ADD COLUMN "company_id" INTEGER;

UPDATE "printer_assets" SET "company_id" = (SELECT MIN("id") FROM "companies") WHERE "company_id" IS NULL;
UPDATE "toner_entries"  SET "company_id" = (SELECT MIN("id") FROM "companies") WHERE "company_id" IS NULL;
UPDATE "toner_orders"   SET "company_id" = (SELECT MIN("id") FROM "companies") WHERE "company_id" IS NULL;
UPDATE "toner_stocks"   SET "company_id" = (SELECT MIN("id") FROM "companies") WHERE "company_id" IS NULL;

ALTER TABLE "printer_assets" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "toner_entries"  ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "toner_orders"   ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "toner_stocks"   ALTER COLUMN "company_id" SET NOT NULL;

-- 在庫の主キーを「品番 × 会社」にする
ALTER TABLE "toner_stocks" DROP CONSTRAINT "toner_stocks_pkey";
ALTER TABLE "toner_stocks" ADD CONSTRAINT "toner_stocks_pkey" PRIMARY KEY ("toner_id", "company_id");

-- CreateIndex
CREATE INDEX "printer_assets_company_id_idx" ON "printer_assets"("company_id");
CREATE INDEX "toner_entries_company_id_idx" ON "toner_entries"("company_id");
CREATE INDEX "toner_orders_company_id_idx" ON "toner_orders"("company_id");
CREATE INDEX "toner_stocks_company_id_idx" ON "toner_stocks"("company_id");

-- AddForeignKey: 会社を消せないよう RESTRICT。機器も在庫も履歴もぶら下がっている
ALTER TABLE "printer_assets" ADD CONSTRAINT "printer_assets_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "toner_entries" ADD CONSTRAINT "toner_entries_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "toner_orders" ADD CONSTRAINT "toner_orders_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "toner_stocks" ADD CONSTRAINT "toner_stocks_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
