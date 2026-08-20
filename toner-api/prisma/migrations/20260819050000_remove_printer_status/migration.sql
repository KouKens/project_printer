-- 機器状態の取得をやめたので、その列を落とす。
-- hrDeviceStatus / hrPrinterStatus / hrPrinterDetectedErrorState と、
-- RICOH の状態コードを入れていた prtAlertLocation。
ALTER TABLE "printers" DROP COLUMN "device_status";
ALTER TABLE "printers" DROP COLUMN "printer_status";
ALTER TABLE "printers" DROP COLUMN "error_state";
ALTER TABLE "printer_alerts" DROP COLUMN "location";
