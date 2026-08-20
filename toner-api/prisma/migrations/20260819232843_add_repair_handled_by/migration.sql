-- CreateEnum
CREATE TYPE "repair_handler" AS ENUM ('IN_HOUSE', 'VENDOR');

-- AlterTable
ALTER TABLE "repair_records" ADD COLUMN     "handled_by" "repair_handler" NOT NULL DEFAULT 'IN_HOUSE';
