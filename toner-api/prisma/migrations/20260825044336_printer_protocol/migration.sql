-- CreateEnum
CREATE TYPE "printer_protocol" AS ENUM ('SNMP', 'SATO_ENQ');

-- AlterTable
ALTER TABLE "printers" ADD COLUMN     "protocol" "printer_protocol" NOT NULL DEFAULT 'SNMP';
