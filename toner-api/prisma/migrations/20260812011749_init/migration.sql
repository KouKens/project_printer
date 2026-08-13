-- CreateTable
CREATE TABLE "toner_entries" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "toner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toner_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toner_entries_created_at_idx" ON "toner_entries"("created_at");
