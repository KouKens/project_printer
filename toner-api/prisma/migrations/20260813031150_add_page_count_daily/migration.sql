-- CreateTable
CREATE TABLE "page_count_daily" (
    "id" SERIAL NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "total" INTEGER NOT NULL,
    "pages" INTEGER,
    "span_days" INTEGER NOT NULL DEFAULT 1,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_count_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_count_daily_date_idx" ON "page_count_daily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "page_count_daily_printer_id_date_key" ON "page_count_daily"("printer_id", "date");

-- AddForeignKey
ALTER TABLE "page_count_daily" ADD CONSTRAINT "page_count_daily_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
