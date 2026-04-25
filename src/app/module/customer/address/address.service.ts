import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    IAddressQueryParams,
    ICreateAddressPayload,
    IUpdateAddressPayload,
} from "./address.interface";
import { logAudit } from "../../../shared/logAudit";


const getMyAddresses = async (
    user: IRequestUser,
    queryParams: IAddressQueryParams,
) => {
    const queryBuilder = new QueryBuilder(prisma.address, queryParams, {
        filterableFields: ["isDefault"],
    });

    const [data, total] = await Promise.all([
        queryBuilder
            .where({ userId: user.userId })
            .filter()
            .paginate()
            .sort()
            .exec(),
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

const createAddress = async (
    user: IRequestUser,
    payload: ICreateAddressPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const hasAnyAddress = await prisma.address.count({
        where: { userId: user.userId },
    });

    const result = await prisma.$transaction(async (tx) => {
        if (payload.isDefault || hasAnyAddress === 0) {
            await tx.address.updateMany({
                where: { userId: user.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return await tx.address.create({
            data: {
                userId: user.userId,
                recipientName: payload.recipientName,
                phone: payload.phone,
                address: payload.address,
                area: payload.area,
                district: payload.district,
                division: payload.division,
                isDefault: payload.isDefault || hasAnyAddress === 0,
            },
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "CREATE",
        entityType: "Address",
        entityId: result.id,
        beforeState: {},
        afterState: result,
        ipAddress,
        userAgent,
    });

    return result;
};

const updateAddress = async (
    addressId: string,
    user: IRequestUser,
    payload: IUpdateAddressPayload,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existingAddress = await prisma.address.findUnique({
        where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Address not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
        if (payload.isDefault === true) {
            await tx.address.updateMany({
                where: { userId: user.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return await tx.address.update({
            where: { id: addressId },
            data: payload,
        });
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "UPDATE",
        entityType: "Address",
        entityId: existingAddress.id,
        beforeState: existingAddress,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

const deleteAddress = async (
    addressId: string,
    user: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existingAddress = await prisma.address.findUnique({
        where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== user.userId) {
        throw new AppError(status.NOT_FOUND, "Address not found");
    }

    const deleted = await prisma.$transaction(async (tx) => {
        await tx.address.delete({ where: { id: addressId } });

        if (existingAddress.isDefault) {
            const fallback = await tx.address.findFirst({
                where: { userId: user.userId },
                orderBy: { createdAt: "asc" },
            });

            if (fallback) {
                await tx.address.update({
                    where: { id: fallback.id },
                    data: { isDefault: true },
                });
            }
        }

        return { success: true };
    });

    await logAudit({
        actorRole: user.role,
        actorUserId: user.userId,
        action: "DELETE",
        entityType: "Address",
        entityId: existingAddress.id,
        beforeState: existingAddress,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return deleted;
};

const getCustomerAddressesForAdmin = async (customerId: string) => {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });
    if (!customer) {
        throw new AppError(status.NOT_FOUND, "Customer not found");
    }

    return await prisma.address.findMany({
        where: { userId: customer.userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
};

export const AddressService = {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    getCustomerAddressesForAdmin,
};
