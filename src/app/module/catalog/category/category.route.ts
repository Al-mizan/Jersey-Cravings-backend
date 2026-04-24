import { Router } from 'express';
import { checkAuth } from '../../../middleware/checkAuth';
import { validateRequest } from '../../../middleware/validateRequest';
import { CategoryController } from './category.controller';
import { createCategoryZodSchema, updateCategoryZodSchema } from './category.validation';
import { Role } from '../../../../generated/prisma/enums';

const router = Router();

// Public: Read-only access (storefront can fetch active categories)
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin: Full CRUD + soft delete/restore
router.post(
    '/',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createCategoryZodSchema),
    CategoryController.createCategory,
);

router.patch(
    '/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateCategoryZodSchema),
    CategoryController.updateCategory,
);

router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.softDeleteCategory);

router.patch('/:id/restore', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.restoreCategory);

export const CategoryRoutes = router;
