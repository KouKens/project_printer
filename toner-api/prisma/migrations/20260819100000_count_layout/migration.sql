-- 集計表の行構成を「合計 1 行 / モノクロ→カラー / カラー→モノクロ」で持つ。
-- 上下どちらがモノクロかは表ごとに違うため、真偽値では表せない。
CREATE TYPE "count_layout" AS ENUM ('TOTAL', 'MONO_COLOR', 'COLOR_MONO');

ALTER TABLE "printer_assets"
  ADD COLUMN "count_layout" "count_layout" NOT NULL DEFAULT 'TOTAL';

-- 2 行の機器はまずモノクロ→カラーにする
UPDATE "printer_assets" SET "count_layout" = 'MONO_COLOR'
  WHERE "split_mono_color" = true;

-- 集計表でカラーが上に入っている 3 台だけ順序を反転する
UPDATE "printer_assets" SET "count_layout" = 'COLOR_MONO'
  WHERE "no" IN ('002', '021', '022');

ALTER TABLE "printer_assets" DROP COLUMN "split_mono_color";
