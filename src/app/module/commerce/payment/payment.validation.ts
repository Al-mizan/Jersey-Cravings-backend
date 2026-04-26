import z from "zod";
import { PaymentStatus } from "../../../../generated/prisma/enums";

const initiatePaymentZodSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
});

const webhookFinalizePaymentZodSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    stripeEventId: z.string().optional(),
    status: z.enum([
        PaymentStatus.SUCCEEDED,
        PaymentStatus.FAILED,
        PaymentStatus.CANCELED,
        PaymentStatus.REFUNDED,
    ]),
    paymentGatewayData: z.record(z.string(), z.unknown()).optional(),
});

const refundPaymentZodSchema = z.object({
    reason: z.string().max(500).optional(),
});

const collectCodPaymentZodSchema = z.object({
    note: z.string().max(500).optional(),
});

export const PaymentValidation = {
    initiatePaymentZodSchema,
    webhookFinalizePaymentZodSchema,
    refundPaymentZodSchema,
    collectCodPaymentZodSchema,
};
