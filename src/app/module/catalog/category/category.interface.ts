import { Role } from "../../../../generated/prisma/enums";

export interface ICreateCategoryPayload {
    name: string;
    slug: string;
}

export interface IUpdateCategoryPayload {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

export interface ICategoryQueryParams {
    searchTerm?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

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