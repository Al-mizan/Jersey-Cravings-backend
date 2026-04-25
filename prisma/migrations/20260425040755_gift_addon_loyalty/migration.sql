/*
  Warnings:

  - You are about to alter the column `value` on the `coupons` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "PickupLocationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EARN_PURCHASE', 'REDEEM_ORDER', 'REFERRAL_BONUS', 'ADJUSTMENT', 'EXPIRY', 'REVERSAL');

-- CreateEnum
CREATE TYPE "ReferralRewardStatus" AS ENUM ('PENDING', 'REWARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GiftCardCategory" AS ENUM ('FRIEND', 'PARTNER', 'FAMILY');

-- AlterTable
ALTER TABLE "coupons" ALTER COLUMN "value" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "lifetimePointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lifetimePointsRedeemed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPurchasedQty" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "fulfillmentMethod" "FulfillmentMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "giftAddonAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pickupHandledById" TEXT,
ADD COLUMN     "pickupLocationId" TEXT,
ADD COLUMN     "pickupNote" TEXT,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "shippingAddressSnapshot" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "pickup_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT,
    "phone" TEXT,
    "openingHours" TEXT,
    "status" "PickupLocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_gift_addons" (
    "id" TEXT NOT NULL,
    "category" "GiftCardCategory" NOT NULL,
    "cardChargeAmount" INTEGER NOT NULL DEFAULT 30,
    "customMessage" TEXT,
    "customMessageCharge" INTEGER NOT NULL DEFAULT 0,
    "totalChargeAmount" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "order_gift_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "earnRateBps" INTEGER NOT NULL DEFAULT 200,
    "minPurchasedQtyToRedeem" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "note" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerCustomerId" TEXT NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_events" (
    "id" TEXT NOT NULL,
    "orderAmount" INTEGER NOT NULL,
    "rewardRateBps" INTEGER NOT NULL DEFAULT 200,
    "rewardPoints" INTEGER NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'PENDING',
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "referredCustomerId" TEXT,
    "referredOrderId" TEXT NOT NULL,

    CONSTRAINT "referral_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pickup_locations_slug_key" ON "pickup_locations"("slug");

-- CreateIndex
CREATE INDEX "pickup_locations_status_idx" ON "pickup_locations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "order_gift_addons_orderId_key" ON "order_gift_addons"("orderId");

-- CreateIndex
CREATE INDEX "order_gift_addons_category_idx" ON "order_gift_addons"("category");

-- CreateIndex
CREATE INDEX "loyalty_settings_isActive_idx" ON "loyalty_settings"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_settings_name_key" ON "loyalty_settings"("name");

-- CreateIndex
CREATE INDEX "point_transactions_customerId_createdAt_idx" ON "point_transactions"("customerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "point_transactions_orderId_idx" ON "point_transactions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_ownerCustomerId_key" ON "referral_codes"("ownerCustomerId");

-- CreateIndex
CREATE INDEX "referral_codes_ownerCustomerId_idx" ON "referral_codes"("ownerCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_events_referredOrderId_key" ON "referral_events"("referredOrderId");

-- CreateIndex
CREATE INDEX "referral_events_referralCodeId_idx" ON "referral_events"("referralCodeId");

-- CreateIndex
CREATE INDEX "referral_events_referredCustomerId_idx" ON "referral_events"("referredCustomerId");

-- CreateIndex
CREATE INDEX "referral_events_status_idx" ON "referral_events"("status");

-- CreateIndex
CREATE INDEX "orders_fulfillmentMethod_idx" ON "orders"("fulfillmentMethod");

-- CreateIndex
CREATE INDEX "orders_pickupLocationId_idx" ON "orders"("pickupLocationId");

-- AddForeignKey
ALTER TABLE "order_gift_addons" ADD CONSTRAINT "order_gift_addons_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "pickup_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickupHandledById_fkey" FOREIGN KEY ("pickupHandledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_ownerCustomerId_fkey" FOREIGN KEY ("ownerCustomerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "referral_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referredCustomerId_fkey" FOREIGN KEY ("referredCustomerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referredOrderId_fkey" FOREIGN KEY ("referredOrderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
