BEGIN;

-- No conversions exist at rollout. Refuse to discard any if that changes.
LOCK TABLE "BookingConversion" IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "BookingConversion") THEN
		RAISE EXCEPTION 'BookingConversion must be empty before moving provenance to Service';
	END IF;
END $$;

DROP TABLE "BookingConversion";
ALTER TYPE "BookingConversionLeg" RENAME TO "ServiceBookingLeg";

-- Existing services deliberately retain unknown creator attribution.
ALTER TABLE "Service"
	ADD COLUMN "bookingId" TEXT,
	ADD COLUMN "leg" "ServiceBookingLeg",
	ADD COLUMN "createdById" TEXT,
	ADD CONSTRAINT "Service_booking_leg_check"
		CHECK (("bookingId" IS NULL) = ("leg" IS NULL));

CREATE UNIQUE INDEX "Service_bookingId_leg_key" ON "Service"("bookingId", "leg");
CREATE INDEX "Service_createdById_createdAt_idx" ON "Service"("createdById", "createdAt");

ALTER TABLE "Service"
	ADD CONSTRAINT "Service_bookingId_fkey" FOREIGN KEY ("bookingId")
		REFERENCES "ServiceBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
	ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById")
		REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
