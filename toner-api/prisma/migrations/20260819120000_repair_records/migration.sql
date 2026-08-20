-- 修理履歴
CREATE TYPE "repair_category" AS ENUM (
  'PART_REPLACEMENT', 'SENSOR_DIRT', 'PAPER_JAM', 'PRINT_QUALITY',
  'SERVICE_CALL', 'FEED_FAILURE', 'FUSING_FAILURE', 'NETWORK',
  'NOISE_SMELL', 'NO_POWER', 'OTHER'
);

CREATE TYPE "repair_status" AS ENUM (
  'INVESTIGATING', 'QUOTING', 'SETTLING', 'SHIPPED', 'RECEIVED', 'DONE'
);

CREATE TABLE "repair_records" (
  "id" SERIAL NOT NULL,
  "assignee" TEXT NOT NULL,
  "printer_asset_id" INTEGER NOT NULL,
  "occurred_on" DATE NOT NULL,
  "category" "repair_category" NOT NULL,
  "detail" TEXT NOT NULL,
  "restored_on" DATE,
  "status" "repair_status" NOT NULL DEFAULT 'INVESTIGATING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "repair_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "repair_records_occurred_on_idx" ON "repair_records"("occurred_on");
CREATE INDEX "repair_records_printer_asset_id_occurred_on_idx" ON "repair_records"("printer_asset_id", "occurred_on");

ALTER TABLE "repair_records" ADD CONSTRAINT "repair_records_printer_asset_id_fkey"
  FOREIGN KEY ("printer_asset_id") REFERENCES "printer_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
