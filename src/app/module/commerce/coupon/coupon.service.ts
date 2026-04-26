import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICouponQueryParams,
    ICreateCouponPayload,
    IUpdateCouponPayload,
    IValidateCouponPayload,
} from "./coupon.interface";
import { logAudit } from "../../../shared/logAudit";
import { calculateDiscount } from "./coupon.utils";


const createCoupon = async (
    payload: ICreateCouponPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existing = await prisma.coupon.findUnique({
        where: { code: payload.code.toUpperCase() },
    });

    if (existing && !existing.isDeleted) {
        throw new AppError(status.CONFLICT, "Coupon code already exists");
    }

    const created = await prisma.coupon.create({
        data: {
            code: payload.code.toUpperCase(),
            discountType: payload.discountType,
            value: payload.value,
            maxDiscountAmount: payload.maxDiscountAmount,
            minOrderAmount: payload.minOrderAmount,
            usageLimit: payload.usageLimit,
            startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
            endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
            isActive: payload.isActive ?? true,
        },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "CREATE",
        entityType: "Coupon",
        entityId: created.id,
        beforeState: {},
        afterState: created,
        ipAddress,
        userAgent,
    });

    return created;
};

const getAllCoupons = async (queryParams: ICouponQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.coupon, queryParams, {
        searchableFields: ["code"],
        filterableFields: ["isActive", "isDeleted", "discountType"],
    });

    const [data, total] = await Promise.all([
        queryBuilder.search().filter().paginate().sort().exec(),
        queryBuilder.countTotal(),
    ]);

    return {
        data,
        meta: {
            page: queryBuilder.getPage(),
            limit: queryBuilder.getLimit(),
            total,
            totalPages: Math.ceil(total / queryBuilder.getLimit()),
        },
    };
};

const getPublicCoupons = async () => {
    const now = new Date();
    return await prisma.coupon.findMany({
        where: {
            isActive: true,
            isDeleted: false,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        orderBy: { createdAt: "desc" },
    });
};

const getCouponById = async (couponId: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

    if (!coupon) {
        throw new AppError(status.NOT_FOUND, "Coupon not found");
    }

    return coupon;
};

const updateCoupon = async (
    couponId: string,
    payload: IUpdateCouponPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

    if (!coupon) {
        throw new AppError(status.NOT_FOUND, "Coupon not found");
    }

    if (payload.code && payload.code !== coupon.code) {
        const exists = await prisma.coupon.findUnique({
            where: { code: payload.code.toUpperCase() },
        });
        if (exists && exists.id !== coupon.id) {
            throw new AppError(status.CONFLICT, "Coupon code already exists");
        }
    }

    const updated = await prisma.coupon.update({
        where: { id: couponId },
        data: {
            ...payload,
            code: payload.code ? payload.code.toUpperCase() : undefined,
            startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
            endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
        },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "UPDATE",
        entityType: "Coupon",
        entityId: coupon.id,
        beforeState: coupon,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

const softDeleteCoupon = async (
    couponId: string,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

    if (!coupon) {
        throw new AppError(status.NOT_FOUND, "Coupon not found");
    }

    if (coupon.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Coupon already deleted");
    }

    const deleted = await prisma.coupon.update({
        where: { id: couponId },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false,
        },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "SOFT_DELETE",
        entityType: "Coupon",
        entityId: coupon.id,
        beforeState: coupon,
        afterState: deleted,
        ipAddress,
        userAgent,
    });

    return deleted;
};

const restoreCoupon = async (
    couponId: string,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });

    if (!coupon) {
        throw new AppError(status.NOT_FOUND, "Coupon not found");
    }

    if (!coupon.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Coupon is not deleted");
    }

    const restored = await prisma.coupon.update({
        where: { id: couponId },
        data: {
            isDeleted: false,
            deletedAt: null,
            isActive: true,
        },
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "RESTORE",
        entityType: "Coupon",
        entityId: coupon.id,
        beforeState: coupon,
        afterState: restored,
        ipAddress,
        userAgent,
    });

    return restored;
};

const validateCoupon = async (payload: IValidateCouponPayload) => {
    const coupon = await prisma.coupon.findUnique({
        where: { code: payload.code.toUpperCase() },
    });

    if (!coupon || coupon.isDeleted || !coupon.isActive) {
        throw new AppError(status.NOT_FOUND, "Coupon is invalid or inactive");
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
        throw new AppError(status.BAD_REQUEST, "Coupon is not active yet");
    }
    if (coupon.endsAt && coupon.endsAt < now) {
        throw new AppError(status.BAD_REQUEST, "Coupon has expired");
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new AppError(status.BAD_REQUEST, "Coupon usage limit exceeded");
    }
    if (
        coupon.minOrderAmount !== null &&
        payload.orderAmount < coupon.minOrderAmount
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            "Order amount does not meet coupon minimum",
        );
    }

    const discountAmount = calculateDiscount(coupon, payload.orderAmount);

    return {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount,
        finalAmount: Math.max(0, payload.orderAmount - discountAmount),
    };
};

export const CouponService = {
    createCoupon,
    getAllCoupons,
    getPublicCoupons,
    getCouponById,
    updateCoupon,
    softDeleteCoupon,
    restoreCoupon,
    validateCoupon,
};
