-- CreateEnum
CREATE TYPE "UserTheme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCEL_REQUESTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingLegKind" AS ENUM ('OUTBOUND', 'RETURN');

-- CreateEnum
CREATE TYPE "BookingLegStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYPAL');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('EXCURSION', 'CLUB', 'TOUR', 'ADVENTURE');

-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('PENDING_CONTACT', 'CONTACTED', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "googlePlaceId" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "airConditioning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "carryOnCapacity" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "websiteVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "mapCenterLat" DOUBLE PRECISION,
ADD COLUMN     "mapCenterLng" DOUBLE PRECISION,
ADD COLUMN     "mapColor" TEXT,
ADD COLUMN     "mapZoom" INTEGER,
ADD COLUMN     "polygon" JSONB;

-- CreateTable
CREATE TABLE "WebsiteUser" (
    "id" TEXT NOT NULL,
    "googleSub" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "phone" TEXT,
    "theme" "UserTheme" NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "destinationZoneId" TEXT NOT NULL,
    "defaultPickupPlaceId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "discountPercent" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transferProductId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "customerNote" TEXT,
    "cancellationReason" TEXT,
    "cancelRequestedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLeg" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "BookingLegKind" NOT NULL,
    "status" "BookingLegStatus" NOT NULL DEFAULT 'UPCOMING',
    "pickupPlaceId" TEXT NOT NULL,
    "dropoffPlaceId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "generatedServiceId" TEXT,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "pax" INTEGER NOT NULL,
    "luggage" INTEGER,
    "carryOn" INTEGER,
    "price" DECIMAL(12,2) NOT NULL,
    "customerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddOnProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddOnProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingAddOn" (
    "id" TEXT NOT NULL,
    "bookingLegId" TEXT NOT NULL,
    "addOnProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingAddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "userId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYPAL',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "providerOrderId" TEXT,
    "providerCaptureId" TEXT,
    "payerEmail" TEXT,
    "rawProviderData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "providerRefundId" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "reason" TEXT,
    "rawProviderData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL DEFAULT 'ADVENTURE',
    "placeMapsId" TEXT,
    "price" DECIMAL(12,2),
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "discountPercent" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "durationHours" INTEGER,
    "highlights" TEXT[],
    "itinerary" JSONB,
    "questions" JSONB,
    "eventDetail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "extraPhone" TEXT,
    "extraEmail" TEXT,
    "status" "EventRegistrationStatus" NOT NULL DEFAULT 'PENDING_CONTACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteUser_googleSub_key" ON "WebsiteUser"("googleSub");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteUser_email_key" ON "WebsiteUser"("email");

-- CreateIndex
CREATE INDEX "WebsiteUser_email_idx" ON "WebsiteUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TransferProduct_slug_key" ON "TransferProduct"("slug");

-- CreateIndex
CREATE INDEX "TransferProduct_destinationZoneId_idx" ON "TransferProduct"("destinationZoneId");

-- CreateIndex
CREATE INDEX "TransferProduct_vehicleId_idx" ON "TransferProduct"("vehicleId");

-- CreateIndex
CREATE INDEX "TransferProduct_active_featured_sortOrder_idx" ON "TransferProduct"("active", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_transferProductId_idx" ON "Booking"("transferProductId");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingLeg_generatedServiceId_key" ON "BookingLeg"("generatedServiceId");

-- CreateIndex
CREATE INDEX "BookingLeg_bookingId_idx" ON "BookingLeg"("bookingId");

-- CreateIndex
CREATE INDEX "BookingLeg_pickupPlaceId_dropoffPlaceId_idx" ON "BookingLeg"("pickupPlaceId", "dropoffPlaceId");

-- CreateIndex
CREATE INDEX "BookingLeg_routeId_idx" ON "BookingLeg"("routeId");

-- CreateIndex
CREATE INDEX "BookingLeg_vehicleId_idx" ON "BookingLeg"("vehicleId");

-- CreateIndex
CREATE INDEX "BookingLeg_status_pickupAt_idx" ON "BookingLeg"("status", "pickupAt");

-- CreateIndex
CREATE INDEX "AddOnProduct_active_sortOrder_idx" ON "AddOnProduct"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "BookingAddOn_addOnProductId_idx" ON "BookingAddOn"("addOnProductId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingAddOn_bookingLegId_addOnProductId_key" ON "BookingAddOn"("bookingLegId", "addOnProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerCaptureId_key" ON "Payment"("providerCaptureId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_providerRefundId_key" ON "Refund"("providerRefundId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_status_createdAt_idx" ON "Refund"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_active_featured_idx" ON "Event"("active", "featured");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_status_createdAt_idx" ON "EventRegistration"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Place_googlePlaceId_idx" ON "Place"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Vehicle_websiteVisible_sortOrder_idx" ON "Vehicle"("websiteVisible", "sortOrder");

-- AddForeignKey
ALTER TABLE "TransferProduct" ADD CONSTRAINT "TransferProduct_destinationZoneId_fkey" FOREIGN KEY ("destinationZoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferProduct" ADD CONSTRAINT "TransferProduct_defaultPickupPlaceId_fkey" FOREIGN KEY ("defaultPickupPlaceId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferProduct" ADD CONSTRAINT "TransferProduct_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebsiteUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transferProductId_fkey" FOREIGN KEY ("transferProductId") REFERENCES "TransferProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_pickupPlaceId_fkey" FOREIGN KEY ("pickupPlaceId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_dropoffPlaceId_fkey" FOREIGN KEY ("dropoffPlaceId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_generatedServiceId_fkey" FOREIGN KEY ("generatedServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddOn" ADD CONSTRAINT "BookingAddOn_bookingLegId_fkey" FOREIGN KEY ("bookingLegId") REFERENCES "BookingLeg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingAddOn" ADD CONSTRAINT "BookingAddOn_addOnProductId_fkey" FOREIGN KEY ("addOnProductId") REFERENCES "AddOnProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebsiteUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebsiteUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
