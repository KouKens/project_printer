-- AlterTable
ALTER TABLE "printer_alerts" ADD COLUMN     "location" INTEGER;

-- AlterTable
ALTER TABLE "printers" ADD COLUMN     "device_status" INTEGER,
ADD COLUMN     "error_state" INTEGER,
ADD COLUMN     "printer_status" INTEGER;
