export interface ICreateReviewPayload {
    productId: string;
    rating: number;
    comment?: string;
    medias?: {
        publicId: string;
        secureUrl: string;
        resourceType: string;
    }[];
}

export interface IUpdateReviewPayload {
    rating?: number;
    comment?: string;
    isApproved?: boolean;
}

export interface IReviewQueryParams {
    productId?: string;
    isApproved?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
