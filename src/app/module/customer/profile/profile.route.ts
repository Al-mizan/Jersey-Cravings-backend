import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CustomerProfileController } from "./profile.controller";
import { CustomerProfileValidation } from "./profile.validation";

const router = Router();

router.get(
    "/me",
    checkAuth(Role.CUSTOMER),
    CustomerProfileController.getMyProfile,
);

// todo: when updating profile, if one update profile photo, then use multer to handle file upload and delete old photo from storage (if exists) to save storage space and use cloudinary. 
router.patch(
    "/me",
    checkAuth(Role.CUSTOMER),
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
