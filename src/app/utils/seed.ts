import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { logger } from "../lib/logger";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN,
            },
        });

        if (isSuperAdminExist) {
            logger.info(
                "Super admin already exists. Skipping seeding super admin.",
            );
            return;
        }

        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.SUPER_ADMIN.EMAIL,
                password: envVars.SUPER_ADMIN.PASSWORD,
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            },
        });

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: superAdminUser.user.id,
                },
                data: {
                    emailVerified: true,
                },
            });

            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: "Super Admin",
                    email: envVars.SUPER_ADMIN.EMAIL,
                },
            });
        });

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: envVars.SUPER_ADMIN.EMAIL,
            },
            include: {
                user: true,
            },
        });

        logger.info("Super admin created", { superAdmin });
    } catch (error) {
        logger.error("Error seeding super admin", { error });
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN.EMAIL,
            },
        });
    }
};
