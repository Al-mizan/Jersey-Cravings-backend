export interface ICreateCategoryPayload {
    name: string;
    slug: string;
}

export interface IUpdateCategoryPayload {
    name?: string;
    slug?: string;
    isActive?: boolean;
}

export interface ICategoryQueryParams {
    searchTerm?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}