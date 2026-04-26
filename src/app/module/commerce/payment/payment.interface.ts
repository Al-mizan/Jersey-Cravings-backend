import {
    PaymentMethod,
    PaymentStatus,
} from "../../../../generated/prisma/enums";

export interface IInitiatePaymentPayload {
    orderId: string;
}

export interface IWebhookFinalizePaymentPayload {
    transactionId: string;
    stripeEventId?: string;
    status: Extract<
        PaymentStatus,
        "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED"
    >;
    paymentGatewayData?: Record<string, unknown>;
}

export interface IRefundPaymentPayload {
    reason?: string;
}

export interface ICollectCodPaymentPayload {
    note?: string;
}

export interface IPaymentQueryParams {
    status?: string;
    method?: PaymentMethod;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
