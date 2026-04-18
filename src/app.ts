/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import { envVars } from "./app/config/env";
import { auth } from "./app/lib/auth";
import { toNodeHandler } from "better-auth/node";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";
import qs from "qs";
import { catchAsync } from "./app/shared/catchAsync";
// import { PaymentController } from "./app/module/payment/payment.controller";
// import cron from "node-cron";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

// app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// cron.schedule('*/25 * * * *', async () => {
//     try {
//         console.log('Running cron job to cancel unpaid appointments...');
//         await AppointmentService.cancelUnpaidAppointments();
//     } catch (error: any) {
//         console.error('Error occurred while canceling unpaid appointments: ', error.message);
//     }
// });

app.use("/api/v1", IndexRoutes);

// Basic route
catchAsync(app.get("/", async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: "Jersey Cravings's API is working",
    })
}));

app.use(globalErrorHandler);
app.use(notFound);

export default app;
