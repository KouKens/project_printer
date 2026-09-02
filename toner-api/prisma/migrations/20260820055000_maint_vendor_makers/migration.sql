-- AlterTable
ALTER TABLE "maint_vendors" ADD COLUMN     "makers" TEXT[] DEFAULT ARRAY[]::TEXT[];

