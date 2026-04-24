export interface IReferralEventQueryParams {
    status?: "PENDING" | "REWARDED" | "REJECTED";
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface IOverrideReferralStatusPayload {
    referralEventId: string;
    status: "PENDING" | "REWARDED" | "REJECTED";
}
