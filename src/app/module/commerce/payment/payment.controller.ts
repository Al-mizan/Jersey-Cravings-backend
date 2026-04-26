import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.initiatePayment(
        req.user as IRequestUser,
        req.body,
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getMyPayments(
        req.user as IRequestUser,
        req.query,
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getPaymentByOrderForCustomer = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentService.getPaymentByOrderForCustomer(
            req.user as IRequestUser,
            req.params.orderId as string,
        );
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Payment retrieved successfully",
            data: result,
        });
    },
);

const getAllPaymentsForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentService.getAllPaymentsForAdmin(req.query);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Payments retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);

const refundPaymentByAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.refundPaymentByAdmin(
        req.params.paymentId as string,
        req.body,
        req.user as IRequestUser,
        req.ip,
        req.get("user-agent"),
    );
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payment refunded successfully",
        data: result,
    });
});

const collectCodPaymentByAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentService.collectCodPaymentByAdmin(
            req.params.paymentId as string,
            req.body,
            req.user as IRequestUser,
            req.ip,
            req.get("user-agent"),
        );
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "COD payment collected successfully",
            data: result,
        });
    },
);

const finalizePaymentFromWebhook = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentService.finalizePaymentFromWebhook(
            req.body,
        );
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Payment webhook processed successfully",
            data: result,
        });
    },
);

const handleStripeWebhookEvent = catchAsync(
    async (req: Request, res: Response) => {
        const signature = req.headers["stripe-signature"] as string;
        const result = await PaymentService.handleStripeWebhookEvent(
            signature,
            req.body,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Stripe webhook event processed successfully",
            data: result,
        });
    },
);

export const PaymentController = {
    initiatePayment,
    getMyPayments,
    getPaymentByOrderForCustomer,
    getAllPaymentsForAdmin,
    refundPaymentByAdmin,
    collectCodPaymentByAdmin,
    finalizePaymentFromWebhook,
    handleStripeWebhookEvent,
};
