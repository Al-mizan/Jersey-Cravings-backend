import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CustomerLoyaltyController } from "./loyalty.controller";
import { CustomerLoyaltyValidation } from "./loyalty.validation";

const router = Router();

router.get(
    "/me",
    checkAuth(Role.CUSTOMER),
    CustomerLoyaltyController.getMyLoyaltySummary,
);

router.get(
    "/me/transactions",
    checkAuth(Role.CUSTOMER),
    CustomerLoyaltyController.getMyPointTransactions,
);

router.get(
    "/settings",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerLoyaltyController.getActiveLoyaltySetting,
);

router.patch(
    "/settings",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(CustomerLoyaltyValidation.updateLoyaltySettingZodSchema),
    CustomerLoyaltyController.updateLoyaltySetting,
);

router.get(
    "/customer/:customerId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerLoyaltyController.getCustomerLoyaltyByAdmin,
);

export const CustomerLoyaltyRoutes = router;
