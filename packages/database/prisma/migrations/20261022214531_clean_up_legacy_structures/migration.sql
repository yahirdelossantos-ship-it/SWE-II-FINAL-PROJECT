/*
  Warnings:

  - The values [CANCEL_REQUESTED,COMPLETED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currency` on the `AddOnProduct` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `AddOnProduct` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `AddOnProduct` table. All the data in the column will be lost.
  - You are about to drop the column `addOnProductId` on the `BookingAddOn` table. All the data in the column will be lost.
  - You are about to drop the column `bookingLegId` on the `BookingAddOn` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `BookingAddOn` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `BookingAddOn` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BookingAddOn` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `WebsiteUser` table. All the data in the column will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingLeg` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRegistration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Refund` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransferProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId,addOnId]` on the table `BookingAddOn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addOnId` to the `BookingAddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `BookingAddOn` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "ServiceBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pickupName" TEXT NOT NULL,
    "dropoffName" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "dueTo" TIMESTAMP(3) NOT NULL,
    "pax" INTEGER NOT NULL,
    "luggage" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "flightCode" TEXT,
    "note" TEXT,
    "roundTrip" TEXT,
    "returnDate" TIMESTAMP(3),
    "vehicleId" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "dropoffId" TEXT NOT NULL,
    "userId" TEXT,
    "rateId" TEXT,
    "status" "BookingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TourType" AS ENUM ('EXCURSION', 'CLUB', 'TOUR', 'ADVENTURE');

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_transferProductId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingAddOn" DROP CONSTRAINT "BookingAddOn_addOnProductId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingAddOn" DROP CONSTRAINT "BookingAddOn_bookingLegId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_dropoffPlaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_generatedServiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_pickupPlaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingLeg" DROP CONSTRAINT "BookingLeg_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventRegistration" DROP CONSTRAINT "EventRegistration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransferProduct" DROP CONSTRAINT "TransferProduct_defaultPickupPlaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransferProduct" DROP CONSTRAINT "TransferProduct_destinationZoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransferProduct" DROP CONSTRAINT "TransferProduct_vehicleId_fkey";

-- AlterTable
ALTER TABLE "AddOnProduct" DROP COLUMN "currency",
DROP COLUMN "price",
DROP COLUMN "sortOrder",
ADD COLUMN     "priceDop" DECIMAL(12,2),
ADD COLUMN     "priceEur" DECIMAL(12,2),
ADD COLUMN     "priceUsd" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookingAddOn" DROP COLUMN "addOnProductId",
DROP COLUMN "bookingLegId",
DROP COLUMN "currency",
DROP COLUMN "unitPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "addOnId" TEXT NOT NULL,
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WebsiteUser" DROP COLUMN "theme";

-- DropTable
DROP TABLE "public"."Booking";

-- DropTable
DROP TABLE "public"."BookingLeg";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."EventRegistration";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."Refund";

-- DropTable
DROP TABLE "public"."TransferProduct";

-- DropEnum
DROP TYPE "public"."BookingLegKind";

-- DropEnum
DROP TYPE "public"."BookingLegStatus";

-- DropEnum
DROP TYPE "public"."EventRegistrationStatus";

-- DropEnum
DROP TYPE "public"."EventType";

-- DropEnum
DROP TYPE "public"."PaymentProvider";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."UserTheme";

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "ServiceBooking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
COMMIT;

-- CreateTable
CREATE TABLE "BookingSettlement" (
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "settledOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingSettlement_pkey" PRIMARY KEY ("bookingId","serviceId")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "tourType" "TourType" NOT NULL DEFAULT 'ADVENTURE',
    "priceUsd" DECIMAL(12,2),
    "priceDop" DECIMAL(12,2),
    "priceEur" DECIMAL(12,2),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "itinerary" JSONB,
    "questions" JSONB,
    "tourDetail" JSONB,
    "images" TEXT[],
    "placeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourRegistration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "TourStatus" NOT NULL,
    "tourId" TEXT NOT NULL,
    "userId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceBooking_userId_idx" ON "ServiceBooking"("userId");

-- CreateIndex
CREATE INDEX "ServiceBooking_createdAt_status_idx" ON "ServiceBooking"("createdAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSettlement_serviceId_key" ON "BookingSettlement"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");

-- CreateIndex
CREATE INDEX "Tour_active_featured_idx" ON "Tour"("active", "featured");

-- CreateIndex
CREATE INDEX "Tour_tourType_idx" ON "Tour"("tourType");

-- CreateIndex
CREATE INDEX "TourRegistration_tourId_idx" ON "TourRegistration"("tourId");

-- CreateIndex
CREATE INDEX "TourRegistration_status_createdAt_idx" ON "TourRegistration"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AddOnProduct_active_idx" ON "AddOnProduct"("active");

-- CreateIndex
CREATE INDEX "BookingAddOn_addOnId_idx" ON "BookingAddOn"("addOnId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAddOn_bookingId_addOnId_key" ON "BookingAddOn"("bookingId", "addOnId");

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_dropoffId_fkey" FOREIGN KEY ("dropoffId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebsiteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "PriceTableRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSettlement" ADD CONSTRAINT "BookingSettlement_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSettlement" ADD CONSTRAINT "BookingSettlement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingSettlement" ADD CONSTRAINT "BookingSettlement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddOn" ADD CONSTRAINT "BookingAddOn_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddOn" ADD CONSTRAINT "BookingAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOnProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourRegistration" ADD CONSTRAINT "TourRegistration_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourRegistration" ADD CONSTRAINT "TourRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebsiteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
