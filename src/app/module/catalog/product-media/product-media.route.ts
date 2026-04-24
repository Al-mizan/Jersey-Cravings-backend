import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { ProductMediaController } from "./product-media.controller";
import {
    createProductMediaZodSchema,
    reorderMediaZodSchema,
} from "./product-media.validation";
import { Role } from "../../../../generated/prisma/enums";

const router = Router({ mergeParams: true }); // /products/:productId/media

// Public: Read-only access
router.get("/", ProductMediaController.getMedia);
router.get("/:mediaId", ProductMediaController.getMediaById);

// Admin: Full CRUD
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createProductMediaZodSchema),
    ProductMediaController.createMedia,
);

router.patch(
    "/:mediaId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createProductMediaZodSchema.partial()),
    ProductMediaController.updateMedia,
);

// Reorder media
router.post(
    "/reorder",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(reorderMediaZodSchema),
    ProductMediaController.reorderMedia,
);

router.delete(
    "/:mediaId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductMediaController.deleteMedia,
);

export const ProductMediaRoutes = router;
