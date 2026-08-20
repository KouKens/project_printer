/*
  Warnings:

  - Made the column `restored_on` on table `repair_records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "repair_records" ALTER COLUMN "assignee" DROP NOT NULL,
ALTER COLUMN "occurred_on" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "detail" DROP NOT NULL,
ALTER COLUMN "restored_on" SET NOT NULL;
