import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { AuditLogController } from "./audit-log.controller";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

// Get all audit logs (ADMIN and SUPER_ADMIN only, read-only)
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AuditLogController.getAuditLogs,
);

// Get audit log by ID
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AuditLogController.getAuditLogById,
);

// Get audit logs for specific entity
router.get(
    "/:entityType/:entityId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AuditLogController.getEntityAuditLogs,
);

export const AuditLogRoutes = router;
