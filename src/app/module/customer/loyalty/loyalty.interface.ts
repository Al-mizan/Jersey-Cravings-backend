export interface IPointTransactionQueryParams {
    type?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IUpdateLoyaltySettingPayload {
    earnRateBps?: number;
    minPurchasedQtyToRedeem?: number;
    isActive?: boolean;
}
