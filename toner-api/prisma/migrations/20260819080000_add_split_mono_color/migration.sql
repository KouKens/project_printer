-- 枚数の書き出しで 2 行（モノクロ・カラー）に分けるか。
-- 既定は合計 1 行。現行の集計表で 2 行になっている 33 台だけ true にする。
ALTER TABLE "printer_assets" ADD COLUMN "split_mono_color" BOOLEAN NOT NULL DEFAULT false;

UPDATE "printer_assets" SET "split_mono_color" = true WHERE "no" IN (
  '002','004','011','021','022','038','041','051','060','071','081','092',
  '102','111','122','131','140','151','152','160','185','212','221','304',
  '306','307','311','315','322','331','332','910','911'
);
