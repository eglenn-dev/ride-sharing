/*
  Warnings:

  - A unique constraint covering the columns `[templateId,departureTime]` on the table `ride` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RIDE_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'MESSAGE_RECEIVED';

-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_template" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "type" "RideType" NOT NULL DEFAULT 'SHARED',
    "seats" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "daysOfWeek" INTEGER[],
    "departureHour" INTEGER NOT NULL,
    "departureMin" INTEGER NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3),
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ride_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_thread" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_subjectId_idx" ON "review"("subjectId");

-- CreateIndex
CREATE INDEX "review_authorId_idx" ON "review"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "review_rideId_authorId_subjectId_key" ON "review"("rideId", "authorId", "subjectId");

-- CreateIndex
CREATE INDEX "ride_template_driverId_idx" ON "ride_template"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "message_thread_bookingId_key" ON "message_thread"("bookingId");

-- CreateIndex
CREATE INDEX "message_threadId_createdAt_idx" ON "message"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ride_templateId_departureTime_key" ON "ride"("templateId", "departureTime");

-- AddForeignKey
ALTER TABLE "ride" ADD CONSTRAINT "ride_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ride_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_template" ADD CONSTRAINT "ride_template_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_thread" ADD CONSTRAINT "message_thread_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
