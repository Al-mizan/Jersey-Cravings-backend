export interface ICreateAddressPayload {
    recipientName: string;
    phone: string;
    address: string;
    area: string;
    district: string;
    division: string;
    isDefault?: boolean;
}

export interface IUpdateAddressPayload {
    recipientName?: string;
    phone?: string;
    address?: string;
    area?: string;
    district?: string;
    division?: string;
    isDefault?: boolean;
}

export interface IAddressQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
