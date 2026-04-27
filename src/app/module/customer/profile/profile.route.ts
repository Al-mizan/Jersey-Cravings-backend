import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CustomerProfileController } from "./profile.controller";
import { CustomerProfileValidation } from "./profile.validation";
import { multerUpload } from "../../../config/multer.config";
import { updateMyCustomerProfileMiddleware } from "./profile.middleware";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

const router = Router();

router.get(
    "/me",
    checkAuth(Role.CUSTOMER),
    CustomerProfileController.getMyProfile,
);

router.patch(
    "/me",
    checkAuth(Role.CUSTOMER),
    multerUpload.single(MEDIA_FIELD_CONFIG.PROFILE_PHOTO),
    updateMyCustomerProfileMiddleware,
    validateRequest(CustomerProfileValidation.updateMyProfileZodSchema),
    CustomerProfileController.updateMyProfile,
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerProfileController.getAllCustomers,
);

router.get(
    "/:customerId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerProfileController.getCustomerById,
);

router.patch(
    "/status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CustomerProfileValidation.changeCustomerStatusZodSchema),
    CustomerProfileController.changeCustomerStatus,
);

router.patch(
    "/:customerId/restore",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CustomerProfileController.restoreCustomer,
);

export const CustomerProfileRoutes = router;
