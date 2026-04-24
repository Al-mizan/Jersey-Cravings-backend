import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { CategoryRoutes } from "../module/catalog/category/category.route";
import { ProductRoutes } from "../module/catalog/product/product.route";
import { ProductVariantRoutes } from "../module/catalog/product-variant/product-variant.route";
import { ProductMediaRoutes } from "../module/catalog/product-media/product-media.route";
import { AdminRoutes } from "../module/governance/admin/admin.route";
import { AuditLogRoutes } from "../module/governance/audit-log/audit-log.route";
import { ActivityRoutes } from "../module/governance/activity/activity.route";
import { BulkActionRoutes } from "../module/governance/bulk-action/bulk-action.route";
import { DashboardRoutes } from "../module/governance/dashboard/dashboard.route";
import { CustomerProfileRoutes } from "../module/customer/profile/profile.route";
import { AddressRoutes } from "../module/customer/address/address.route";
import { CustomerLoyaltyRoutes } from "../module/customer/loyalty/loyalty.route";
import { CustomerReferralRoutes } from "../module/customer/referral/referral.route";
import { ReviewRoutes } from "../module/customer/review/review.route";
import { CartRoutes } from "../module/commerce/cart/cart.route";
import { CouponRoutes } from "../module/commerce/coupon/coupon.route";
import { FulfillmentRoutes } from "../module/commerce/fulfillment/fulfillment.route";
import { GiftAddonRoutes } from "../module/commerce/gift-addon/gift-addon.route";
import { OrderRoutes } from "../module/commerce/order/order.route";
import { PaymentRoutes } from "../module/commerce/payment/payment.route";

const router = Router();

// Identity routes
router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);

// Catalog routes
router.use("/categories", CategoryRoutes);
router.use("/products", ProductRoutes);
router.use("/products", ProductVariantRoutes);
router.use("/products", ProductMediaRoutes);

// Governance routes (admin)
router.use("/admins", AdminRoutes);
router.use("/audit-logs", AuditLogRoutes);
router.use("/activity", ActivityRoutes);
router.use("/bulk-actions", BulkActionRoutes);
router.use("/dashboard", DashboardRoutes);

// Customer routes
router.use("/customers/profile", CustomerProfileRoutes);
router.use("/customers/addresses", AddressRoutes);
router.use("/customers/loyalty", CustomerLoyaltyRoutes);
router.use("/customers/referrals", CustomerReferralRoutes);
router.use("/customers/reviews", ReviewRoutes);

// Commerce routes
router.use("/carts", CartRoutes);
router.use("/coupons", CouponRoutes);
router.use("/fulfillment", FulfillmentRoutes);
router.use("/gift-addons", GiftAddonRoutes);
router.use("/orders", OrderRoutes);
router.use("/payments", PaymentRoutes);

export const IndexRoutes = router;
