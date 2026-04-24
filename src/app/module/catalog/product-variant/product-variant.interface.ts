export interface ICreateProductVariantPayload {
    sku: string;
    size: "S" | "M" | "L" | "XL" | "XXL";
    fit: "PLAYER" | "FAN";
    sleeveType: "SHORT" | "LONG";
    priceAmount: number; // in paisa
    compareAtAmount?: number;
    costAmount?: number;
    stockQty: number;
}

export interface IUpdateProductVariantPayload {
    size?: "S" | "M" | "L" | "XL" | "XXL";
    fit?: "PLAYER" | "FAN";
    sleeveType?: "SHORT" | "LONG";
    priceAmount?: number;
    compareAtAmount?: number;
    costAmount?: number;
    stockQty?: number;
    isActive?: boolean;
}

export interface IProductVariantQueryParams {
    productId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
