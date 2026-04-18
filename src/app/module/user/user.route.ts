import { Router } from "express";
import { createAdminZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";


const router = Router();


router.post("/create-admin",
    validateRequest(createAdminZodSchema), 
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    UserController.createAdmin);

export const UserRoutes: Router = router;