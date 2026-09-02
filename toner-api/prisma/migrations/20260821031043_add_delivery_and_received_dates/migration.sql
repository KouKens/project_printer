-- AlterTable
ALTER TABLE "toner_entries" ADD COLUMN     "received_on" DATE;

-- AlterTable
ALTER TABLE "toner_orders" ADD COLUMN     "delivery_on" DATE;

-- CreateIndex
CREATE INDEX "toner_entries_received_on_idx" ON "toner_entries"("received_on");

-- CreateIndex
CREATE INDEX "toner_orders_delivery_on_idx" ON "toner_orders"("delivery_on");
