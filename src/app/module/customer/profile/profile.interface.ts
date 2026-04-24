export interface IUpdateMyProfilePayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
}

export interface ICustomerQueryParams {
    searchTerm?: string;
    isDeleted?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IChangeCustomerStatusPayload {
    customerId: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
}
