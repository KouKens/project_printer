-- CreateTable
CREATE TABLE "toner_invoices" (
    "id" SERIAL NOT NULL,
    "issued_on" DATE NOT NULL,
    "period_from" DATE NOT NULL,
    "period_to" DATE NOT NULL,
    "invoice_no" TEXT,
    "note" TEXT,
    "checked_at" TIMESTAMP(3),
    "checked_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toner_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toner_invoice_lines" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "toner_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER,

    CONSTRAINT "toner_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toner_invoices_period_to_idx" ON "toner_invoices"("period_to");

-- CreateIndex
CREATE INDEX "toner_invoice_lines_invoice_id_idx" ON "toner_invoice_lines"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "toner_invoice_lines_invoice_id_toner_id_key" ON "toner_invoice_lines"("invoice_id", "toner_id");

-- AddForeignKey
ALTER TABLE "toner_invoice_lines" ADD CONSTRAINT "toner_invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "toner_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toner_invoice_lines" ADD CONSTRAINT "toner_invoice_lines_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
