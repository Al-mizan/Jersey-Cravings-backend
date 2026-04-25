export interface IUpdateAdminPayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
}

export interface ICreateAdminPayload {
    password: string;
    admin: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
    };
    role: "ADMIN" | "SUPER_ADMIN";
}

export interface IChangeUserStatusPayload {
    userId: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
}

export interface IChangeUserRolePayload {
    userId: string;
    role: "ADMIN" | "SUPER_ADMIN";
}

export interface IAdminQueryParams {
    searchTerm?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
