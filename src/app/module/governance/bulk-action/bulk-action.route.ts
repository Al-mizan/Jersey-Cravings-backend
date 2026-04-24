import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { BulkActionController } from "./bulk-action.controller";
import {
    bulkPublishZodSchema,
    bulkArchiveZodSchema,
    bulkCategoryToggleZodSchema,
    bulkCouponToggleZodSchema,
} from "./bulk-action.validation";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

// Bulk publish products
router.post(
    "/products/publish",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(bulkPublishZodSchema),
    BulkActionController.bulkPublishProducts,
);

// Bulk archive products
router.post(
    "/products/archive",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(bulkArchiveZodSchema),
    BulkActionController.bulkArchiveProducts,
);

// Bulk toggle categories
router.post(
    "/categories/toggle",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(bulkCategoryToggleZodSchema),
    BulkActionController.bulkToggleCategories,
);

// Bulk toggle coupons
router.post(
    "/coupons/toggle",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(bulkCouponToggleZodSchema),
    BulkActionController.bulkToggleCoupons,
);

export const BulkActionRoutes = router;
