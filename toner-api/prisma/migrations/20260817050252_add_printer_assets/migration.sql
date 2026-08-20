-- CreateTable
CREATE TABLE "printer_assets" (
    "id" SERIAL NOT NULL,
    "department" TEXT,
    "no" TEXT,
    "ip_address" TEXT,
    "maker" TEXT,
    "serial_number" TEXT,
    "purchased_on" DATE,
    "contract_no" TEXT,
    "maint_start_on" DATE,
    "maint_end_on" DATE,
    "maint_deal_on" DATE,
    "maint_fee" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printer_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "printer_assets_ip_address_key" ON "printer_assets"("ip_address");

-- CreateIndex
CREATE INDEX "printer_assets_department_idx" ON "printer_assets"("department");
