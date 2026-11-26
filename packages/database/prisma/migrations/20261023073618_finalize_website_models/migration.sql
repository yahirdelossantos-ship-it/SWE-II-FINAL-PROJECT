/*
  Warnings:

  - You are about to drop the column `countryCode` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `dueTo` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `returnDate` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `roundTrip` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `Tour` table. All the data in the column will be lost.
  - The `status` column on the `TourRegistration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BookingSettlement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currency` to the `BookingAddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameSnapshot` to the `BookingAddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitAmount` to the `BookingAddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseAmount` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAt` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ServiceBooking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingConversionLeg" AS ENUM ('OUTBOUND', 'RETURN');

-- CreateEnum
CREATE TYPE "TourRegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "public"."BookingAddOn" DROP CONSTRAINT "BookingAddOn_addOnId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingSettlement" DROP CONSTRAINT "BookingSettlement_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingSettlement" DROP CONSTRAINT "BookingSettlement_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingSettlement" DROP CONSTRAINT "BookingSettlement_serviceId_fkey";

-- DropIndex
DROP INDEX "public"."ServiceBooking_createdAt_status_idx";

-- DropIndex
DROP INDEX "public"."ServiceBooking_userId_idx";

-- AlterTable
ALTER TABLE "BookingAddOn" ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "nameSnapshot" TEXT NOT NULL,
ADD COLUMN     "unitAmount" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "addOnId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ServiceBooking" DROP COLUMN "countryCode",
DROP COLUMN "dueTo",
DROP COLUMN "returnDate",
DROP COLUMN "roundTrip",
ADD COLUMN     "addOnAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "baseAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "isRoundTrip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "returnAt" TIMESTAMP(3),
ADD COLUMN     "returnFlightCode" TEXT,
ADD COLUMN     "totalAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "questions",
ADD COLUMN     "faqs" JSONB,
ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "TourRegistration" ADD COLUMN     "partySize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requestedFor" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "TourRegistrationStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."BookingSettlement";

-- DropEnum
DROP TYPE "public"."TourStatus";

-- CreateTable
CREATE TABLE "BookingConversion" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "leg" "BookingConversionLeg" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingConversion_serviceId_key" ON "BookingConversion"("serviceId");

-- CreateIndex
CREATE INDEX "BookingConversion_createdById_createdAt_idx" ON "BookingConversion"("createdById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingConversion_bookingId_leg_key" ON "BookingConversion"("bookingId", "leg");

-- CreateIndex
CREATE INDEX "ServiceBooking_userId_createdAt_idx" ON "ServiceBooking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceBooking_status_pickupAt_idx" ON "ServiceBooking"("status", "pickupAt");

-- CreateIndex
CREATE INDEX "ServiceBooking_email_idx" ON "ServiceBooking"("email");

-- CreateIndex
CREATE INDEX "TourRegistration_status_createdAt_idx" ON "TourRegistration"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingConversion" ADD CONSTRAINT "BookingConversion_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingConversion" ADD CONSTRAINT "BookingConversion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingConversion" ADD CONSTRAINT "BookingConversion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddOn" ADD CONSTRAINT "BookingAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOnProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
