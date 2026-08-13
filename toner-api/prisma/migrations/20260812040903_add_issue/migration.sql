-- AlterEnum
ALTER TYPE "toner_action" ADD VALUE 'ISSUE';

-- AlterTable
ALTER TABLE "toner_entries" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0;
