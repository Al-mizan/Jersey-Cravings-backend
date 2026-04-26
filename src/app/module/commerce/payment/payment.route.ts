import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
    "/initiate",
    checkAuth(Role.CUSTOMER),
    validateRequest(PaymentValidation.initiatePaymentZodSchema),
    PaymentController.initiatePayment,
);

router.get("/my", checkAuth(Role.CUSTOMER), PaymentController.getMyPayments);

router.get(
    "/my/order/:orderId",
    checkAuth(Role.CUSTOMER),
    PaymentController.getPaymentByOrderForCustomer,
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    PaymentController.getAllPaymentsForAdmin,
);

router.patch(
    "/:paymentId/refund",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(PaymentValidation.refundPaymentZodSchema),
    PaymentController.refundPaymentByAdmin,
);

router.patch(
    "/:paymentId/collect-cod",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(PaymentValidation.collectCodPaymentZodSchema),
    PaymentController.collectCodPaymentByAdmin,
);

// System webhook endpoint for final payment status updates.
router.post(
    "/webhook/finalize",
    validateRequest(PaymentValidation.webhookFinalizePaymentZodSchema),
    PaymentController.finalizePaymentFromWebhook,
);

export const PaymentRoutes = router;
