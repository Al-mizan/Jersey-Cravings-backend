import express from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import { multerUpload } from "../../../config/multer.config";
import { reviewMiddleware } from "./review.middleware";
import { MEDIA_FIELD_CONFIG } from "../../../shared/multerFieldConfig";

const router = express.Router();

router.get("/", ReviewController.getAllReviews);

router.patch(
    "/:id/moderate",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(ReviewValidation.moderateReviewZodSchema),
    ReviewController.moderateReview,
);

router.post(
    "/",
    checkAuth(Role.CUSTOMER),
    multerUpload.fields([MEDIA_FIELD_CONFIG.REVIEW_PHOTOS]),
    reviewMiddleware,
    validateRequest(ReviewValidation.createReviewZodSchema),
    ReviewController.giveReview,
);

router.get("/my-reviews", checkAuth(Role.CUSTOMER), ReviewController.myReviews);

router.patch(
    "/:id",
    checkAuth(Role.CUSTOMER),
    multerUpload.fields([MEDIA_FIELD_CONFIG.REVIEW_PHOTOS]),
    reviewMiddleware,
    validateRequest(ReviewValidation.updateReviewZodSchema),
    ReviewController.updateReview,
);

router.delete("/:id", checkAuth(Role.CUSTOMER), ReviewController.deleteReview);

export const ReviewRoutes = router;
