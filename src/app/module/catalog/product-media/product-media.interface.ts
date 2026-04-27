export interface ICreateProductMediaPayload {
    publicId: string;
    secureUrl: string;
    resourceType: "image" | "video";
    altText?: string;
}

export interface IProductMediaQueryParams {
    productId: string;
    page?: number;
    limit?: number;
}


export interface IUpdateProductMediaPayload {
    publicId?: string;
    secureUrl?: string;
    resourceType?: "image" | "video";
    altText?: string;
}

export interface IReorderMediaPayload {
    productId: string;
    mediaOrder: string[]; // Array of media IDs in the new order
}