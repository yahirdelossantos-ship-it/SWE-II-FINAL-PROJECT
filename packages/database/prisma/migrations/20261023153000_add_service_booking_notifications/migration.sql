-- AlterTable
ALTER TABLE "ServiceBooking" ALTER COLUMN "country" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "ServiceBookingEmailAudience" AS ENUM ('CUSTOMER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ServiceBookingEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ServiceBookingNotificationRecipient" (
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBookingNotificationRecipient_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "ServiceBookingEmailDelivery" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "recipientEmployeeId" TEXT,
    "audience" "ServiceBookingEmailAudience" NOT NULL,
    "status" "ServiceBookingEmailStatus" NOT NULL DEFAULT 'PENDING',
    "recipientName" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBookingEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceBookingEmailDelivery_bookingId_status_idx" ON "ServiceBookingEmailDelivery"("bookingId", "status");

-- CreateIndex
CREATE INDEX "ServiceBookingEmailDelivery_bookingId_audience_idx" ON "ServiceBookingEmailDelivery"("bookingId", "audience");

-- CreateIndex
CREATE INDEX "ServiceBookingEmailDelivery_recipientEmployeeId_idx" ON "ServiceBookingEmailDelivery"("recipientEmployeeId");

-- AddForeignKey
ALTER TABLE "ServiceBookingNotificationRecipient" ADD CONSTRAINT "ServiceBookingNotificationRecipient_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBookingEmailDelivery" ADD CONSTRAINT "ServiceBookingEmailDelivery_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBookingEmailDelivery" ADD CONSTRAINT "ServiceBookingEmailDelivery_recipientEmployeeId_fkey" FOREIGN KEY ("recipientEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
