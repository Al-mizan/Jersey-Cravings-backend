import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { ProductVariantController } from "./product-variant.controller";
import {
    createProductVariantZodSchema,
    updateProductVariantZodSchema,
} from "./product-variant.validation";
import { Role } from "../../../../generated/prisma/enums";


const router = Router({ mergeParams: true }); // /products/:productId/variants

// Admin: Full CRUD
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createProductVariantZodSchema),
    ProductVariantController.createVariant,
);

// Public: Read-only access
router.get("/", ProductVariantController.getVariants);

router.get("/:variantId", ProductVariantController.getVariantById);

router.patch(
    "/:variantId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateProductVariantZodSchema),
    ProductVariantController.updateVariant,
);

router.delete(
    "/:variantId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductVariantController.deleteVariant,
);

export const ProductVariantRoutes = router;
