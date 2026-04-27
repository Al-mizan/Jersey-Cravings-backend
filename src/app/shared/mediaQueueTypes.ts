import { PrismaClient } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

export type TPrismaTransactionClient = Parameters<
    Parameters<typeof prisma.$transaction>[0]
>[0];

export type TPrismaOrTxClient = PrismaClient | TPrismaTransactionClient;
