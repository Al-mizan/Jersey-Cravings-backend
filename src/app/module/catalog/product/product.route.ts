import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { ProductController } from "./product.controller";
import { Role } from "../../../../generated/prisma/enums";
import {
    createProductZodSchema,
    updateProductZodSchema,
} from "./product.validation";

const router = Router();


// Admin: Full CRUD + state transitions (publish/archive) + soft delete/restore
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createProductZodSchema),
    ProductController.createProduct,
);

// Public: Read-only access (storefront can fetch active products)
router.get("/", ProductController.getAllProducts);

router.get("/:id", ProductController.getProductById);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateProductZodSchema),
    ProductController.updateProduct,
);

// Publish (DRAFT -> ACTIVE)
router.patch(
    "/:id/publish",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductController.publishProduct,
);

// Archive (ACTIVE/DRAFT -> ARCHIVED)
router.patch(
    "/:id/archive",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductController.archiveProduct,
);

// Soft delete
router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductController.softDeleteProduct,
);

// Restore
router.patch(
    "/:id/restore",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductController.restoreProduct,
);

export const ProductRoutes = router;
