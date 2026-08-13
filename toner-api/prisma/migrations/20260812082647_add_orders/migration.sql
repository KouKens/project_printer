-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'RECEIVED', 'CANCELED');

-- AlterEnum
ALTER TYPE "toner_action" ADD VALUE 'DISPOSE';

-- AlterTable
ALTER TABLE "toner_stocks" ADD COLUMN     "disposed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "received" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "toner_orders" (
    "id" SERIAL NOT NULL,
    "toner_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "ordered_at" TIMESTAMP(3) NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toner_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toner_orders_status_ordered_at_idx" ON "toner_orders"("status", "ordered_at");

-- CreateIndex
CREATE INDEX "toner_orders_toner_id_ordered_at_idx" ON "toner_orders"("toner_id", "ordered_at");

-- AddForeignKey
ALTER TABLE "toner_orders" ADD CONSTRAINT "toner_orders_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
