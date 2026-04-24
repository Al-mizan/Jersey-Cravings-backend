import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { GiftAddonController } from "./gift-addon.controller";
import { GiftAddonValidation } from "./gift-addon.validation";

const router = Router();

router.get(
    "/my/:orderId",
    checkAuth(Role.CUSTOMER),
    GiftAddonController.getMyOrderGiftAddon,
);
router.put(
    "/my/:orderId",
    checkAuth(Role.CUSTOMER),
    validateRequest(GiftAddonValidation.upsertOrderGiftAddonZodSchema),
    GiftAddonController.upsertOrderGiftAddon,
);
router.delete(
    "/my/:orderId",
    checkAuth(Role.CUSTOMER),
    GiftAddonController.removeOrderGiftAddon,
);

router.get(
    "/order/:orderId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    GiftAddonController.getGiftAddonByOrderForAdmin,
);

export const GiftAddonRoutes = router;
