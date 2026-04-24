import { PickupLocationStatus } from "../../../../generated/prisma/enums";

export interface ICreatePickupLocationPayload {
    name: string;
    slug: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode?: string;
    phone?: string;
    openingHours?: string;
    status?: PickupLocationStatus;
    isDefault?: boolean;
}

export interface IUpdatePickupLocationPayload {
    name?: string;
    slug?: string;
    addressLine?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
    openingHours?: string;
    status?: PickupLocationStatus;
    isDefault?: boolean;
}

export interface IFulfillmentQueryParams {
    searchTerm?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
