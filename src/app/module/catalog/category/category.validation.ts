import z from 'zod';

export const createCategoryZodSchema = z.object({
    name: z
        .string('Category name is required')
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name must be at most 100 characters'),
    slug: z
        .string('Category slug is required')
        .min(2, 'Category slug must be at least 2 characters')
        .max(100, 'Category slug must be at most 100 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
});

export const updateCategoryZodSchema = z.object({
    name: z
        .string('Category name must be string')
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name must be at most 100 characters')
        .optional(),
    slug: z
        .string('Category slug must be string')
        .min(2, 'Category slug must be at least 2 characters')
        .max(100, 'Category slug must be at most 100 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
        .optional(),
    isActive: z.boolean('isActive must be boolean').optional(),
});

export const queryCategoryZodSchema = z.object({
    searchTerm: z.string().optional(),
    isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});
