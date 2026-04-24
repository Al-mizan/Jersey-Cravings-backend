import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { CartController } from "./cart.controller";
import { CartValidation } from "./cart.validation";

const router = Router();

router.get("/my", checkAuth(Role.CUSTOMER), CartController.getMyCart);
router.post(
    "/my/items",
    checkAuth(Role.CUSTOMER),
    validateRequest(CartValidation.addToCartZodSchema),
    CartController.addToCart,
);
router.patch(
    "/my/items/:cartItemId",
    checkAuth(Role.CUSTOMER),
    validateRequest(CartValidation.updateCartItemZodSchema),
    CartController.updateCartItem,
);
router.delete(
    "/my/items/:cartItemId",
    checkAuth(Role.CUSTOMER),
    CartController.removeCartItem,
);
router.delete(
    "/my/clear",
    checkAuth(Role.CUSTOMER),
    CartController.clearMyCart,
);

router.get(
    "/customer/:userId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CartController.getCustomerCartForAdmin,
);

export const CartRoutes = router;
