-- CreateTable
CREATE TABLE "cloudinary_cleanup_tasks" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "context" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "cloudinary_cleanup_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cleanup_task_status" ON "cloudinary_cleanup_tasks"("status");

-- CreateIndex
CREATE INDEX "idx_cleanup_task_scheduled_at" ON "cloudinary_cleanup_tasks"("scheduledAt");

-- CreateIndex
CREATE INDEX "idx_cleanup_task_status_scheduled" ON "cloudinary_cleanup_tasks"("status", "scheduledAt");
