import { IqueryParams } from "../../../interface/query.interface";
import { ProductStatus } from "../../../../generated/prisma/enums";

export interface ICreateProductPayload {
    title: string;
    slug: string;
    description?: string;
    teamName: string;
    tournamentTag: string;
    jerseyType: "HOME" | "AWAY" | "THIRD" | "GK" | "SPECIAL";
    categoryId: string;
}

export interface IUpdateProductPayload {
    title?: string;
    slug?: string;
    description?: string;
    teamName?: string;
    tournamentTag?: string;
    jerseyType?: "HOME" | "AWAY" | "THIRD" | "GK" | "SPECIAL";
    categoryId?: string;
}

export interface IUpdateProductStatusPayload {
    status: ProductStatus;
}

export interface IProductQueryParams extends IqueryParams {
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    categoryId?: string;
    isDeleted?: boolean;
}
