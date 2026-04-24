import express from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

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
    validateRequest(ReviewValidation.createReviewZodSchema),
    ReviewController.giveReview,
);

router.get("/my-reviews", checkAuth(Role.CUSTOMER), ReviewController.myReviews);

router.patch(
    "/:id",
    checkAuth(Role.CUSTOMER),
    validateRequest(ReviewValidation.updateReviewZodSchema),
    ReviewController.updateReview,
);

router.delete("/:id", checkAuth(Role.CUSTOMER), ReviewController.deleteReview);

export const ReviewRoutes = router;
