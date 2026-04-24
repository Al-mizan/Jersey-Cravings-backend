import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { OrderController } from "./order.controller";
import { OrderValidation } from "./order.validation";

const router = Router();

router.post(
    "/my",
    checkAuth(Role.CUSTOMER),
    validateRequest(OrderValidation.createOrderZodSchema),
    OrderController.createOrder,
);

router.get("/my", checkAuth(Role.CUSTOMER), OrderController.getMyOrders);

router.get(
    "/my/:orderId",
    checkAuth(Role.CUSTOMER),
    OrderController.getMyOrderById,
);

router.patch(
    "/my/:orderId/cancel",
    checkAuth(Role.CUSTOMER),
    OrderController.cancelMyOrder,
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    OrderController.getAllOrdersForAdmin,
);

router.get(
    "/:orderId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    OrderController.getOrderByIdForAdmin,
);

router.patch(
    "/:orderId/status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(OrderValidation.updateOrderStatusZodSchema),
    OrderController.updateOrderStatusByAdmin,
);


export const OrderRoutes = router;
