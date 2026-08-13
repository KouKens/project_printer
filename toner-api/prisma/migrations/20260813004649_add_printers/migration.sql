-- CreateEnum
CREATE TYPE "snmp_version" AS ENUM ('1', '2c');

-- CreateTable
CREATE TABLE "printers" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "community" TEXT NOT NULL DEFAULT 'public',
    "version" "snmp_version" NOT NULL DEFAULT '1',
    "host_name" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "mac_address" TEXT,
    "location" TEXT,
    "page_count" INTEGER,
    "reachable" BOOLEAN NOT NULL DEFAULT false,
    "last_error" TEXT,
    "last_polled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_readings" (
    "id" SERIAL NOT NULL,
    "printer_id" INTEGER NOT NULL,
    "supply_index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "colorant" TEXT,
    "level" INTEGER NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "percent" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "printers_ip_address_key" ON "printers"("ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "supply_readings_printer_id_supply_index_key" ON "supply_readings"("printer_id", "supply_index");

-- AddForeignKey
ALTER TABLE "supply_readings" ADD CONSTRAINT "supply_readings_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
