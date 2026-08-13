/*
  Warnings:

  - You are about to drop the column `stock` on the `toners` table. All the data in the column will be lost.
  - Added the required column `action` to the `toner_entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "toner_action" AS ENUM ('REGISTER', 'RECEIVE');

-- AlterTable
ALTER TABLE "toner_entries" ADD COLUMN     "action" "toner_action" NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "toners" DROP COLUMN "stock";

-- CreateTable
CREATE TABLE "toner_stocks" (
    "toner_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toner_stocks_pkey" PRIMARY KEY ("toner_id")
);

-- CreateIndex
CREATE INDEX "toner_entries_toner_id_created_at_idx" ON "toner_entries"("toner_id", "created_at");

-- AddForeignKey
ALTER TABLE "toner_stocks" ADD CONSTRAINT "toner_stocks_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
