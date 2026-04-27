import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import { Role } from "../../../../generated/prisma/enums";
import {
    createAdminZodSchema,
    updateAdminZodSchema,
    changeUserStatusZodSchema,
    changeUserRoleZodSchema,
} from "./admin.validation";
import { multerUpload } from "../../../config/multer.config";
import { updateMyAdminProfileMiddleware } from "./admin.middleware";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

const router = Router();

router.post(
    "/",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(createAdminZodSchema),
    AdminController.createAdmin,
);

// Get all admins
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAllAdmins,
);

// Get admin by ID
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AdminController.getAdminById,
);

// Update admin (own profile or SUPER_ADMIN can update any)
router.patch(
    "/:id",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    multerUpload.single(MEDIA_FIELD_CONFIG.ADMIN_PROFILE_PHOTO),
    updateMyAdminProfileMiddleware,
    validateRequest(updateAdminZodSchema),
    AdminController.updateAdmin,
);

// Delete admin (SUPER_ADMIN only)
router.delete("/:id", checkAuth(Role.SUPER_ADMIN), AdminController.deleteAdmin);

// Change user status (SUPER_ADMIN and ADMIN)
router.patch(
    "/user/status",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    validateRequest(changeUserStatusZodSchema),
    AdminController.changeUserStatus,
);

// Change user role (SUPER_ADMIN only)
router.patch(
    "/user/role",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(changeUserRoleZodSchema),
    AdminController.changeUserRole,
);

export const AdminRoutes = router;
