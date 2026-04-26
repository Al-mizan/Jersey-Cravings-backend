import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { FulfillmentController } from "./fulfillment.controller";
import { FulfillmentValidation } from "./fulfillment.validation";

const router = Router();

router.get("/active", FulfillmentController.getActivePickupLocations);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    FulfillmentController.getPickupLocations,
);

router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(FulfillmentValidation.createPickupLocationZodSchema),
    FulfillmentController.createPickupLocation,
);

router.patch(
    "/:locationId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(FulfillmentValidation.updatePickupLocationZodSchema),
    FulfillmentController.updatePickupLocation,
);

router.delete(
    "/:locationId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    FulfillmentController.deletePickupLocation,
);

export const FulfillmentRoutes = router;
