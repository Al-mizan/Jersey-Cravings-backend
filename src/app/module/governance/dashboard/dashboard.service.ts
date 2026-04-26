/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    OrderStatus,
    ProductStatus,
    UserStatus,
} from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { IDashboardStats } from "./dashboard.interface";

const getDashboardSummary = async (): Promise<IDashboardStats> => {
    const [categoryStats, productStats, orderStats, customerStats, auditStats] =
        await Promise.all([
            // Category stats
            prisma.category.aggregate({
                _count: true,
                where: { isDeleted: false },
            }),
            // Detailed category stats
            Promise.all([
                prisma.category.count({
                    where: { isDeleted: false, isActive: true },
                }),
                prisma.product.aggregate({
                    _count: true,
                    where: { isDeleted: false },
                }),
                prisma.product.groupBy({
                    by: ["status"],
                    where: { isDeleted: false },
                    _count: true,
                }),
            ]),
            // Order stats
            prisma.order.groupBy({
                by: ["status"],
                _count: true,
            }),
            // Customer stats
            prisma.customer.count({
                where: { isDeleted: false },
            }),
            // Audit stats
            prisma.auditLog.groupBy({
                by: ["action"],
                orderBy: { _count: { action: "desc" } },
                take: 10,
                _count: true,
            }),
        ]);

    // Parse results
    const totalCategories = categoryStats._count;
    const activeCategories = await prisma.category.count({
        where: { isDeleted: false, isActive: true },
    });

    const totalProducts = productStats[1]._count;
    const productsByStatus: Record<string, number> = {};
    productStats[2].forEach((group) => {
        productsByStatus[group.status] = group._count;
    });

    const ordersByStatus: Record<string, number> = {};
    orderStats.forEach((group) => {
        ordersByStatus[group.status] = group._count;
    });

    const totalCustomers = customerStats;

    const blockedCustomers = await prisma.user.count({
        where: {
            role: "CUSTOMER",
            status: UserStatus.BLOCKED,
            isDeleted: false,
        },
    });

    const deletedCustomers = await prisma.customer.count({
        where: { isDeleted: true },
    });

    const totalAuditActions = auditStats.reduce(
        (sum, stat) => sum + stat._count,
        0,
    );

    return {
        catalogStats: {
            totalCategories,
            activeCategories,
            totalProducts,
            activeProducts: productsByStatus[ProductStatus.ACTIVE] || 0,
            draftProducts: productsByStatus[ProductStatus.DRAFT] || 0,
            archivedProducts: productsByStatus[ProductStatus.ARCHIVED] || 0,
        },
        orderStats: {
            totalOrders: Object.values(ordersByStatus).reduce(
                (sum, count) => sum + count,
                0,
            ),
            pendingPayment: ordersByStatus[OrderStatus.PENDING_PAYMENT] || 0,
            paid: ordersByStatus[OrderStatus.PAID] || 0,
            processing: ordersByStatus[OrderStatus.PROCESSING] || 0,
            shipped: ordersByStatus[OrderStatus.SHIPPED] || 0,
            delivered: ordersByStatus[OrderStatus.DELIVERED] || 0,
        },
        customerStats: {
            totalCustomers,
            activeCustomers:
                totalCustomers - blockedCustomers - deletedCustomers,
            blockedCustomers,
            deletedCustomers,
        },
        auditStats: {
            totalActions: totalAuditActions,
            recentActions: auditStats.map((stat) => ({
                action: stat.action,
                count: stat._count,
            })),
        },
    };
};

const getCatalogStats = async () => {
    const categories = await prisma.category.aggregate({
        _count: true,
        where: { isDeleted: false },
    });

    const products = await prisma.product.groupBy({
        by: ["status"],
        where: { isDeleted: false },
        _count: true,
    });

    const variants = await prisma.productVariant.aggregate({
        _count: true,
        where: { isActive: true },
    });

    return {
        categories: categories._count,
        products: products.reduce((sum, p) => sum + p._count, 0),
        variants: variants._count,
        productsByStatus: products.map((p) => ({
            status: p.status,
            count: p._count,
        })),
    };
};

const getOrderStats = async () => {
    const orders = await prisma.order.groupBy({
        by: ["status"],
        _count: true,
    });

    const totalRevenue = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: { status: OrderStatus.DELIVERED },
    });

    return {
        ordersByStatus: orders.map((o) => ({
            status: o.status,
            count: o._count,
        })),
        totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
};

const getCustomerStats = async () => {
    const customers = await prisma.customer.count({
        where: { isDeleted: false },
    });

    const blockedUsers = await prisma.user.count({
        where: { role: "CUSTOMER", status: UserStatus.BLOCKED },
    });

    const recentSignups = await prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return {
        totalCustomers: customers,
        activeCustomers: customers - blockedUsers,
        blockedCustomers: blockedUsers,
        recentSignups,
    };
};

export const DashboardService = {
    getDashboardSummary,
    getCatalogStats,
    getOrderStats,
    getCustomerStats,
};
