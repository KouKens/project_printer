-- AlterTable
ALTER TABLE "page_count_daily" ADD COLUMN     "copy_pages" INTEGER,
ADD COLUMN     "print_pages" INTEGER,
ADD COLUMN     "scan_pages" INTEGER,
ADD COLUMN     "total_copy" INTEGER,
ADD COLUMN     "total_print" INTEGER,
ADD COLUMN     "total_scan" INTEGER;
