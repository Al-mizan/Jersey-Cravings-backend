import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { ActivityController } from "./activity.controller";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

// Get current user's activity
router.get(
    "/my-activity",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ActivityController.getUserActivity,
);

// Get activity timeline (last N days)
router.get(
    "/timeline",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ActivityController.getActivityTimeline,
);

// Get specific entity activity
router.get(
    "/:entityType/:entityId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ActivityController.getEntityActivity,
);

export const ActivityRoutes = router;
