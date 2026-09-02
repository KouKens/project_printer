-- AlterTable
ALTER TABLE "printer_assets" DROP COLUMN "maint_phones",
DROP COLUMN "maint_vendor",
ADD COLUMN     "maint_vendor_id" INTEGER;

-- CreateTable
CREATE TABLE "maint_vendors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maint_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maint_vendors_name_key" ON "maint_vendors"("name");

-- CreateIndex
CREATE INDEX "printer_assets_maint_vendor_id_idx" ON "printer_assets"("maint_vendor_id");

-- AddForeignKey
ALTER TABLE "printer_assets" ADD CONSTRAINT "printer_assets_maint_vendor_id_fkey" FOREIGN KEY ("maint_vendor_id") REFERENCES "maint_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

