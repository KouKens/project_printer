-- AlterTable
ALTER TABLE "printer_assets" ADD COLUMN     "maint_phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maint_vendor" TEXT;
