-- AlterTable
ALTER TABLE "toners" ADD COLUMN     "color" TEXT,
ADD COLUMN     "recycled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "toner_printers" (
    "toner_id" TEXT NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toner_printers_pkey" PRIMARY KEY ("toner_id","printer_id")
);

-- CreateTable
CREATE TABLE "toner_prices" (
    "id" SERIAL NOT NULL,
    "toner_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toner_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toner_printers_printer_id_idx" ON "toner_printers"("printer_id");

-- CreateIndex
CREATE INDEX "toner_prices_toner_id_effective_from_idx" ON "toner_prices"("toner_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "toner_prices_toner_id_effective_from_key" ON "toner_prices"("toner_id", "effective_from");

-- AddForeignKey
ALTER TABLE "toner_printers" ADD CONSTRAINT "toner_printers_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toner_printers" ADD CONSTRAINT "toner_printers_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toner_prices" ADD CONSTRAINT "toner_prices_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
