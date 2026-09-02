-- 機能ごとの累計を「機能 × 色」の 6 列に置き換える。
--
-- 落とす total_print / total_copy / total_scan（と対応する日次 3 列）は、
-- RICOH の拡張 MIB から誤った ID を読んでいた。
-- 1806 は `Total Prints: <A3,DLT: Total`（A3 未満の総枚数）、
-- 701 は `No. of Printed Sides in Duplex`（両面印字の面数）で、
-- プリンター・コピーの枚数ではない。残しても使えないので消す。
--
-- 追加した 12 列は次回の取得から入る。過去の記録は null のまま
-- （累計 total / total_mono / total_color は正しいので、そちらはそのまま残る）。
-- AlterTable
ALTER TABLE "page_count_daily" DROP COLUMN "copy_pages",
DROP COLUMN "print_pages",
DROP COLUMN "scan_pages",
DROP COLUMN "total_copy",
DROP COLUMN "total_print",
DROP COLUMN "total_scan",
ADD COLUMN     "copy_color_pages" INTEGER,
ADD COLUMN     "copy_mono_pages" INTEGER,
ADD COLUMN     "print_color_pages" INTEGER,
ADD COLUMN     "print_mono_pages" INTEGER,
ADD COLUMN     "scan_color_pages" INTEGER,
ADD COLUMN     "scan_mono_pages" INTEGER,
ADD COLUMN     "total_copy_color" INTEGER,
ADD COLUMN     "total_copy_mono" INTEGER,
ADD COLUMN     "total_print_color" INTEGER,
ADD COLUMN     "total_print_mono" INTEGER,
ADD COLUMN     "total_scan_color" INTEGER,
ADD COLUMN     "total_scan_mono" INTEGER;
