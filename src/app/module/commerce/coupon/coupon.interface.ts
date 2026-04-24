import { DiscountType } from "../../../../generated/prisma/enums";

export interface ICreateCouponPayload {
    code: string;
    discountType: DiscountType;
    value: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    usageLimit?: number;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}

export interface IUpdateCouponPayload {
    code?: string;
    discountType?: DiscountType;
    value?: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    usageLimit?: number;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
}

export interface IValidateCouponPayload {
    code: string;
    orderAmount: number;
}

export interface ICouponQueryParams {
    searchTerm?: string;
    isActive?: string;
    isDeleted?: string;
    discountType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
