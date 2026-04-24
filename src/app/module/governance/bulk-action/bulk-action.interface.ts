export interface IBulkPublishPayload {
    productIds: string[];
}

export interface IBulkArchivePayload {
    productIds: string[];
}

export interface IBulkCategoryTogglePayload {
    categoryIds: string[];
    isActive: boolean;
}

export interface IBulkCouponTogglePayload {
    couponIds: string[];
    isActive: boolean;
}

export interface IBulkActionResult {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
}
