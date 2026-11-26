-- Add trip-level service type and leg-level passenger/flight details for website bookings.
ALTER TABLE "Booking"
ADD COLUMN "tripType" "ServiceType" NOT NULL DEFAULT 'TRANSFER';

ALTER TABLE "BookingLeg"
ADD COLUMN "flightCode" TEXT,
ADD COLUMN "adultCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "childCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "BookingLeg"
SET "adultCount" = COALESCE("pax", 1),
    "childCount" = 0;

ALTER TABLE "BookingLeg"
DROP COLUMN "pax";

ALTER TABLE "Booking"
ALTER COLUMN "tripType" DROP DEFAULT;
