-- 削除の代わりに「無効」を持たせる。
--
-- どちらの表も他から参照されており、行ごと消すと過去の記録が壊れる。
-- トナーは受付の履歴・注文・請求書の明細から、台帳は修理履歴とトナーの紐づけから
-- 指されている（台帳を消すと修理履歴が道連れになる）。
--
-- 既存の行はすべて有効（null）で入る。追加だけなので失うデータは無い。
-- AlterTable
ALTER TABLE "printer_assets" ADD COLUMN     "disabled_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "toners" ADD COLUMN     "disabled_at" TIMESTAMP(3);
