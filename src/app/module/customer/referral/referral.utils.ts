import { randomBytes } from "node:crypto";
import { Prisma } from "../../../../generated/prisma/client";


const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_LENGTH = 8;
export const MAX_REFERRAL_CODE_RETRIES = 10;

export const generateReferralCode = (): string => {
    const bytes = randomBytes(REFERRAL_CODE_LENGTH);
    let suffix = "";
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
        suffix +=
            REFERRAL_CODE_ALPHABET[
                bytes[i] % REFERRAL_CODE_ALPHABET.length
            ];
    }
    return `JC-${suffix}`;
};

export const getUniqueTargets = (error: Prisma.PrismaClientKnownRequestError): string[] => {
    const target = error.meta?.target;
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === "string") return [target];
    return [];
};