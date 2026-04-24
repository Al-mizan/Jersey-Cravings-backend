import { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { DashboardController } from "./dashboard.controller";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

// Admin dashboard summary (KPI overview)
router.get(
    "/summary",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DashboardController.getDashboardSummary,
);

// Catalog statistics
router.get(
    "/catalog",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DashboardController.getCatalogStats,
);

// Order statistics
router.get(
    "/orders",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DashboardController.getOrderStats,
);

// Customer statistics
router.get(
    "/customers",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DashboardController.getCustomerStats,
);

export const DashboardRoutes = router;
