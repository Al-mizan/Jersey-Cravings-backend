import { DiscountType } from "../../../../generated/prisma/enums";

export const calculateDiscount = (
    coupon: {
        discountType: DiscountType;
        value: number;
        maxDiscountAmount: number | null;
    },
    orderAmount: number,
) => {
    if (coupon.discountType === DiscountType.FLAT) {
        return Math.min(orderAmount, coupon.value);
    }

    const raw = Math.floor((orderAmount * coupon.value) / 100);
    if (!coupon.maxDiscountAmount) {
        return raw;
    }
    return Math.min(raw, coupon.maxDiscountAmount);
};
