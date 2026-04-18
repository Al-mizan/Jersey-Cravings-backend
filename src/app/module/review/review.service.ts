// import status from "http-status";
// import { OrderStatus, Role } from "../../../generated/prisma/enums";
// import AppError from "../../errorHelpers/AppError";
// import { prisma } from "../../lib/prisma";
// import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";
// import { IRequestUser } from "../../interface/requestUser.interface";

const giveReview = async (
    // user: IRequestUser,
    // payload: ICreateReviewPayload,
) => {
    // const customerData = await prisma.customer.findUniqueOrThrow({
    //     where: {
    //         email: user.email,
    //     },
    // });

    // const appointmentData = await prisma.appointment.findUniqueOrThrow({
    //     where: {
    //         id: payload.appointmentId,
    //     },
    // });

    // if (appointmentData.paymentStatus !== OrderStatus.PAID) {
    //     throw new AppError(
    //         status.BAD_REQUEST,
    //         "You can only review after payment is done",
    //     );
    // }

    // if (appointmentData.customerId !== customerData.id) {
    //     throw new AppError(
    //         status.BAD_REQUEST,
    //         "You can only review for your own appointments",
    //     );
    // }

    // const isReviewed = await prisma.review.findFirst({
    //     where: {
    //         appointmentId: payload.appointmentId,
    //     },
    // });

    // if (isReviewed) {
    //     throw new AppError(
    //         status.BAD_REQUEST,
    //         "You have already reviewed for this appointment. You can update your review instead.",
    //     );
    // }

    // const result = await prisma.$transaction(async (tx) => {
    //     const review = await tx.review.create({
    //         data: {
    //             ...payload,
    //             customerId: appointmentData.customerId,
    //             doctorId: appointmentData.doctorId,
    //         },
    //     });

    //     const averageRating = await tx.review.aggregate({
    //         where: {
    //             doctorId: appointmentData.doctorId,
    //         },
    //         _avg: {
    //             rating: true,
    //         },
    //     });

    //     await tx.doctor.update({
    //         where: {
    //             id: appointmentData.doctorId,
    //         },
    //         data: {
    //             averageRating: averageRating._avg.rating as number,
    //         },
    //     });

    //     return review;
    // });

    // return result;
};

const getAllReviews = async () => {
    // const reviews = await prisma.review.findMany({
    //     include: {
    //         doctor: true,
    //         customer: true,
    //         appointment: true,
    //     },
    // });

    // return reviews;
};

const myReviews = async (
    // user: IRequestUser
) => {
    // const isUserExist = await prisma.user.findUnique({
    //     where: {
    //         email: user?.email,
    //     },
    // });
    // if (!isUserExist) {
    //     throw new AppError(
    //         status.BAD_REQUEST,
    //         "Only customers can view their reviews",
    //     );
    // }

    // if (isUserExist.role === Role.DOCTOR) {
    //     const doctorData = await prisma.doctor.findUniqueOrThrow({
    //         where: {
    //             email: user?.email,
    //         },
    //     });
    //     return await prisma.review.findMany({
    //         where: {
    //             doctorId: doctorData.id,
    //         },
    //         include: {
    //             customer: true,
    //             appointment: true,
    //         },
    //     });
    // }

    // if (isUserExist.role === Role.CUSTOMER) {
    //     const customerData = await prisma.customer.findUniqueOrThrow({
    //         where: {
    //             email: user?.email,
    //         },
    //     });
    //     return await prisma.review.findMany({
    //         where: {
    //             customerId: customerData.id,
    //         },
    //         include: {
    //             doctor: true,
    //             appointment: true,
    //         },
    //     });
    // }
};

const updateReview = async (
    // user: IRequestUser,
    // reviewId: string,
    // payload: IUpdateReviewPayload,
) => {
    // const customerData = await prisma.customer.findUniqueOrThrow({
    //     where: {
    //         email: user?.email,
    //     },
    // });
    // const reviewData = await prisma.review.findUniqueOrThrow({
    //     where: {
    //         id: reviewId,
    //     },
    // });
    // if (!(customerData.id === reviewData.customerId)) {
    //     throw new AppError(status.BAD_REQUEST, "This is not your review!");
    // }
    // const result = await prisma.$transaction(async (tx) => {
    //     const updatedReview = await tx.review.update({
    //         where: {
    //             id: reviewId,
    //         },
    //         data: {
    //             ...payload,
    //         },
    //     });

    //     const averageRating = await tx.review.aggregate({
    //         where: {
    //             doctorId: reviewData.doctorId,
    //         },
    //         _avg: {
    //             rating: true,
    //         },
    //     });

    //     await tx.doctor.update({
    //         where: {
    //             id: updatedReview.doctorId,
    //         },
    //         data: {
    //             averageRating: averageRating._avg.rating as number,
    //         },
    //     });

    //     return updatedReview;
    // });

    // return result;
};

const deleteReview = async (
    // user: IRequestUser, reviewId: string
) => {
    // const customerData = await prisma.customer.findUniqueOrThrow({
    //     where: {
    //         email: user?.email,
    //     },
    // });
    // const reviewData = await prisma.review.findUniqueOrThrow({
    //     where: {
    //         id: reviewId,
    //     },
    // });
    // if (!(customerData.id === reviewData.customerId)) {
    //     throw new AppError(status.BAD_REQUEST, "This is not your review!");
    // }

    // const result = await prisma.$transaction(async (tx) => {
    //     const deletedReview = await tx.review.delete({
    //         where: {
    //             id: reviewId,
    //         },
    //     });

    //     const averageRating = await tx.review.aggregate({
    //         where: {
    //             doctorId: deletedReview.doctorId,
    //         },
    //         _avg: {
    //             rating: true,
    //         },
    //     });

    //     await tx.doctor.update({
    //         where: {
    //             id: deletedReview.doctorId,
    //         },
    //         data: {
    //             averageRating: averageRating._avg.rating as number,
    //         },
    //     });
    //     return deletedReview;
    // });

    // return result;
};

export const ReviewService = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview,
};
