import status from "http-status";
import { PickupLocationStatus } from "../../../../generated/prisma/enums";
import AppError from "../../../errorHelpers/AppError";
import { IRequestUser } from "../../../interface/requestUser.interface";
import { prisma } from "../../../lib/prisma";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import {
    ICreatePickupLocationPayload,
    IFulfillmentQueryParams,
    IUpdatePickupLocationPayload,
} from "./fulfillment.interface";
import { logAudit } from "../../../shared/logAudit";


const getActivePickupLocations = async () => {
    return await prisma.pickupLocation.findMany({
        where: { status: PickupLocationStatus.ACTIVE },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
};

const getPickupLocations = async (queryParams: IFulfillmentQueryParams) => {
    const queryBuilder = new QueryBuilder(prisma.pickupLocation, queryParams, {
        searchableFields: ["name", "slug", "city", "district"],
        filterableFields: ["status", "isDefault"],
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

const createPickupLocation = async (
    payload: ICreatePickupLocationPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existing = await prisma.pickupLocation.findUnique({
        where: { slug: payload.slug },
    });
    if (existing) {
        throw new AppError(
            status.CONFLICT,
            "Pickup location slug already exists",
        );
    }

    const created = await prisma.$transaction(async (tx) => {
        if (payload.isDefault) {
            await tx.pickupLocation.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        return await tx.pickupLocation.create({
            data: {
                ...payload,
                status: payload.status || PickupLocationStatus.ACTIVE,
                isDefault: payload.isDefault || false,
            },
        });
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "CREATE",
        entityType: "PickupLocation",
        entityId: created.id,
        beforeState: {},
        afterState: created,
        ipAddress,
        userAgent,
    });

    return created;
};

const updatePickupLocation = async (
    locationId: string,
    payload: IUpdatePickupLocationPayload,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existing = await prisma.pickupLocation.findUnique({
        where: { id: locationId },
    });
    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Pickup location not found");
    }

    if (payload.slug && payload.slug !== existing.slug) {
        const slugExists = await prisma.pickupLocation.findUnique({
            where: { slug: payload.slug },
        });
        if (slugExists && slugExists.id !== locationId) {
            throw new AppError(
                status.CONFLICT,
                "Pickup location slug already exists",
            );
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        if (payload.isDefault === true) {
            await tx.pickupLocation.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        return await tx.pickupLocation.update({
            where: { id: locationId },
            data: payload,
        });
    });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "UPDATE",
        entityType: "PickupLocation",
        entityId: existing.id,
        beforeState: existing,
        afterState: updated,
        ipAddress,
        userAgent,
    });

    return updated;
};

const deletePickupLocation = async (
    locationId: string,
    actor: IRequestUser,
    ipAddress?: string,
    userAgent?: string,
) => {
    const existing = await prisma.pickupLocation.findUnique({
        where: { id: locationId },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Pickup location not found");
    }

    const usedInOrders = await prisma.order.count({
        where: { pickupLocationId: locationId },
    });

    if (usedInOrders > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Pickup location is already referenced by orders",
        );
    }

    await prisma.pickupLocation.delete({ where: { id: locationId } });

    await logAudit({
        actorRole: actor.role,
        actorUserId: actor.userId,
        action: "DELETE",
        entityType: "PickupLocation",
        entityId: existing.id,
        beforeState: existing,
        afterState: {},
        ipAddress,
        userAgent,
    });

    return { success: true };
};

export const FulfillmentService = {
    getActivePickupLocations,
    getPickupLocations,
    createPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
};
