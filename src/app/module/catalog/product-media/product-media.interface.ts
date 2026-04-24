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
