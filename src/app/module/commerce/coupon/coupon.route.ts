import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CouponController } from "./coupon.controller";
import { CouponValidation } from "./coupon.validation";

const router = Router();

router.get("/public", CouponController.getPublicCoupons);
router.post(
    "/validate",
    checkAuth(Role.CUSTOMER),
    validateRequest(CouponValidation.validateCouponZodSchema),
    CouponController.validateCoupon,
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.getAllCoupons,
);
router.get(
    "/:couponId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.getCouponById,
);
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CouponValidation.createCouponZodSchema),
    CouponController.createCoupon,
);
router.patch(
    "/:couponId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CouponValidation.updateCouponZodSchema),
    CouponController.updateCoupon,
);
router.delete(
    "/:couponId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.softDeleteCoupon,
);
router.patch(
    "/:couponId/restore",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponController.restoreCoupon,
);

export const CouponRoutes = router;
