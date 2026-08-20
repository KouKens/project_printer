-- AlterTable
ALTER TABLE "printers" ADD COLUMN     "console_text" TEXT;

-- AlterTable
ALTER TABLE "supply_readings" ADD COLUMN     "supply_class" INTEGER,
ADD COLUMN     "supply_type" INTEGER;

-- CreateTable
CREATE TABLE "printer_alerts" (
    "id" SERIAL NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "alert_index" INTEGER NOT NULL,
    "severity" INTEGER,
    "alert_group" INTEGER,
    "code" INTEGER,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printer_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "printer_alerts_printer_id_alert_index_key" ON "printer_alerts"("printer_id", "alert_index");

-- AddForeignKey
ALTER TABLE "printer_alerts" ADD CONSTRAINT "printer_alerts_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
