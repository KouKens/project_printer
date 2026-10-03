-- AlterTable
ALTER TABLE "toners" ADD COLUMN     "genuine_id" TEXT,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "toners_genuine_id_idx" ON "toners"("genuine_id");

-- AddForeignKey
ALTER TABLE "toners" ADD CONSTRAINT "toners_genuine_id_fkey" FOREIGN KEY ("genuine_id") REFERENCES "toners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
