import {
    FulfillmentMethod,
    GiftCardCategory,
    OrderStatus,
} from "../../../../generated/prisma/enums";

export interface ICreateOrderPayload {
    fulfillmentMethod?: FulfillmentMethod;
    pickupLocationId?: string;
    shippingAddressId?: string;
    billingAddressSnapshot?: Record<string, unknown>;
    notes?: string;
    couponCode?: string;
    redeemPoints?: number;
    referralCode?: string;
    giftAddon?: {
        category: GiftCardCategory;
        customMessage?: string;
    };
}

export interface IUpdateOrderStatusPayload {
    status: OrderStatus;
}

export interface IOrderQueryParams {
    searchTerm?: string;
    status?: string;
    paymentStatus?: string;
    fulfillmentMethod?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
