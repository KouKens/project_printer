-- DropIndex
DROP INDEX "printer_assets_ip_address_key";

-- AlterTable
ALTER TABLE "printer_assets" ADD COLUMN     "maint_contract" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "printer_assets_ip_address_idx" ON "printer_assets"("ip_address");
