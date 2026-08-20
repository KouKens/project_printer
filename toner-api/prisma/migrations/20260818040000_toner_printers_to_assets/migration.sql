-- トナーの紐づけ先を実機マスタ（printers）から端末台帳（printer_assets）へ移す。
-- SNMP に応答しない機器（FAX・USB 接続機など）は printers に行が無く、
-- 台帳 62 件のうち 19 件が紐づけ不能だったため。
--
-- 既存の行は IP アドレスで台帳に読み替える。
-- 台帳は同じ IP を複数行持つことがある（No.041 と No.051）ので、一致する台帳すべてに広げる。
-- IP が台帳側に無い行は移せないので落ちる。

-- DropForeignKey
ALTER TABLE "toner_printers" DROP CONSTRAINT "toner_printers_printer_id_fkey";

-- DropIndex
DROP INDEX "toner_printers_printer_id_idx";

-- DropPrimaryKey
ALTER TABLE "toner_printers" DROP CONSTRAINT "toner_printers_pkey";

-- 読み替えた内容を退避する（列を差し替える前に作る）
CREATE TEMP TABLE "toner_printers_moved" AS
SELECT tp."toner_id", a."id" AS "printer_asset_id", MIN(tp."created_at") AS "created_at"
FROM "toner_printers" tp
JOIN "printers" p ON p."id" = tp."printer_id"
JOIN "printer_assets" a ON a."ip_address" = p."ip_address"
GROUP BY tp."toner_id", a."id";

DELETE FROM "toner_printers";

-- AlterTable（空にしてから列を差し替えるので NOT NULL のまま足せる）
ALTER TABLE "toner_printers"
  DROP COLUMN "printer_id",
  ADD COLUMN "printer_asset_id" INTEGER NOT NULL;

INSERT INTO "toner_printers" ("toner_id", "printer_asset_id", "created_at")
SELECT "toner_id", "printer_asset_id", "created_at" FROM "toner_printers_moved";

DROP TABLE "toner_printers_moved";

-- AddPrimaryKey
ALTER TABLE "toner_printers"
  ADD CONSTRAINT "toner_printers_pkey" PRIMARY KEY ("toner_id", "printer_asset_id");

-- CreateIndex
CREATE INDEX "toner_printers_printer_asset_id_idx" ON "toner_printers"("printer_asset_id");

-- AddForeignKey
ALTER TABLE "toner_printers" ADD CONSTRAINT "toner_printers_printer_asset_id_fkey" FOREIGN KEY ("printer_asset_id") REFERENCES "printer_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
