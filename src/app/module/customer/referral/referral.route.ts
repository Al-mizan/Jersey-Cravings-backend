import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CustomerReferralController } from "./referral.controller";
import { CustomerReferralValidation } from "./referral.validation";

const router = Router();

router.get(
    "/my-code",
    checkAuth(Role.CUSTOMER),
    CustomerReferralController.getOrCreateMyReferralCode,
);
router.get(
    "/my-events",
    checkAuth(Role.CUSTOMER),
    CustomerReferralController.getMyReferralEvents,
);

router.get(
    "/events",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerReferralController.getAllReferralEventsForAdmin,
);
router.patch(
    "/events/status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CustomerReferralValidation.overrideReferralStatusZodSchema),
    CustomerReferralController.overrideReferralStatus,
);

export const CustomerReferralRoutes = router;
