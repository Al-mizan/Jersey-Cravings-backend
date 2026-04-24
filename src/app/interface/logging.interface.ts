import { Role } from "../../generated/prisma/enums";

export interface IAuditLog {
    actorUserId: string;
    actorRole: Role;
    action: string;
    entityType: string;
    entityId: string;
    beforeState: Record<string, unknown>;
    afterState: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}