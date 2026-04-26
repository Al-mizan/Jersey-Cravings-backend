/*
  Warnings:

  - Made the column `phone` on table `pickup_locations` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'COD');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'STRIPE';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "collectedAt" TIMESTAMP(3),
ADD COLUMN     "collectedByAdminId" TEXT,
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'STRIPE';

-- AlterTable
ALTER TABLE "pickup_locations" ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE INDEX "orders_paymentMethod_idx" ON "orders"("paymentMethod");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_collectedByAdminId_idx" ON "payments"("collectedByAdminId");
