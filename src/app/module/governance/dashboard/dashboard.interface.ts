export interface IDashboardStats {
    catalogStats?: {
        totalCategories: number;
        activeCategories: number;
        totalProducts: number;
        activeProducts: number;
        draftProducts: number;
        archivedProducts: number;
    };
    orderStats?: {
        totalOrders: number;
        pendingPayment: number;
        paid: number;
        processing: number;
        shipped: number;
        delivered: number;
    };
    customerStats?: {
        totalCustomers: number;
        activeCustomers: number;
        blockedCustomers: number;
        deletedCustomers: number;
    };
    auditStats?: {
        totalActions: number;
        recentActions: Array<{ action: string; count: number }>;
    };
}
