-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "needsManualReview" BOOLEAN NOT NULL DEFAULT false;
