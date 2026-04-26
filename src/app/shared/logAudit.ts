import { Prisma } from "../../generated/prisma/client";
import { IAuditLog } from "../interface/logging.interface";
import { prisma } from "../lib/prisma";

export const logAudit = async (
    {
        actorRole,
        actorUserId,
        action,
        entityType,
        entityId,
        beforeState,
        afterState,
        ipAddress,
        userAgent,
    }: IAuditLog,
    tx?: Prisma.TransactionClient,
) => {
    const dbClient = tx ?? prisma;

    await dbClient.auditLog.create({
        data: {
            actorUserId,
            actorRole,
            action,
            entityType,
            entityId,
            beforeState: beforeState as Prisma.InputJsonValue,
            afterState: afterState as Prisma.InputJsonValue,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
        },
    });
};
