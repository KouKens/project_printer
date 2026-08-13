-- AlterTable
ALTER TABLE "toner_entries" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "toners" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "toner_entries" ADD CONSTRAINT "toner_entries_toner_id_fkey" FOREIGN KEY ("toner_id") REFERENCES "toners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
