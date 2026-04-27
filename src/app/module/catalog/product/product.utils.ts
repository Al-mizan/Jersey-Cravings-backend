import { ProductStatus } from "../../../../generated/prisma/enums";

export const isValidStatusTransition = (
    oldStatus: ProductStatus,
    newStatus: ProductStatus,
) => {
    const allowedTransitions: Record<ProductStatus, ProductStatus[]> = {
        [ProductStatus.DRAFT]: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
        [ProductStatus.ACTIVE]: [ProductStatus.ARCHIVED],
        [ProductStatus.ARCHIVED]: [ProductStatus.ACTIVE],
    };

    return allowedTransitions[oldStatus].includes(newStatus);
};
