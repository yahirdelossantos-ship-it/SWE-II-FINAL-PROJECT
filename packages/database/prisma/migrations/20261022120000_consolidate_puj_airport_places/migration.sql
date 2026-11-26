BEGIN;

-- Prevent service and booking writers from adding a duplicate reference while
-- the existing references are moved and the duplicate place is deleted.
LOCK TABLE
	"Place",
	"Service",
	"BookingLeg",
	"TransferProduct",
	"Note"
IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
	canonical_place_id CONSTANT TEXT := 'cmloj8rws000fsb4hc45yj0xg';
	duplicate_place_id CONSTANT TEXT := 'cmtb4c9ai001ei6kqoeg5z8nk';
	canonical_place "Place"%ROWTYPE;
	duplicate_place "Place"%ROWTYPE;
BEGIN
	SELECT *
	INTO canonical_place
	FROM "Place"
	WHERE id = canonical_place_id
	FOR UPDATE;

	SELECT *
	INTO duplicate_place
	FROM "Place"
	WHERE id = duplicate_place_id
	FOR UPDATE;

	-- Fresh databases and databases already consolidated need no data change.
	IF duplicate_place.id IS NULL THEN
		RETURN;
	END IF;

	IF canonical_place.id IS NULL THEN
		RAISE EXCEPTION
			'Cannot consolidate PUJ airport places: canonical place % is missing',
			canonical_place_id;
	END IF;

	IF canonical_place.kind::TEXT <> 'AIRPORT'
		OR duplicate_place.kind::TEXT <> 'AIRPORT'
		OR upper(canonical_place.iata) IS DISTINCT FROM 'PUJ'
		OR upper(duplicate_place.iata) IS DISTINCT FROM 'PUJ'
	THEN
		RAISE EXCEPTION
			'Cannot consolidate PUJ airport places: both records must be AIRPORT places with IATA PUJ';
	END IF;

	IF canonical_place."zoneId" IS NULL
		OR canonical_place."zoneId" IS DISTINCT FROM duplicate_place."zoneId"
	THEN
		RAISE EXCEPTION
			'Cannot consolidate PUJ airport places: both records must belong to the same non-null zone';
	END IF;

	UPDATE "Service"
	SET "pickupId" = canonical_place_id
	WHERE "pickupId" = duplicate_place_id;

	UPDATE "Service"
	SET "dropoffId" = canonical_place_id
	WHERE "dropoffId" = duplicate_place_id;

	UPDATE "BookingLeg"
	SET "pickupPlaceId" = canonical_place_id
	WHERE "pickupPlaceId" = duplicate_place_id;

	UPDATE "BookingLeg"
	SET "dropoffPlaceId" = canonical_place_id
	WHERE "dropoffPlaceId" = duplicate_place_id;

	UPDATE "TransferProduct"
	SET "defaultPickupPlaceId" = canonical_place_id
	WHERE "defaultPickupPlaceId" = duplicate_place_id;

	UPDATE "Note"
	SET "placeId" = canonical_place_id
	WHERE "placeId" = duplicate_place_id;

	IF EXISTS (
		SELECT 1 FROM "Service"
		WHERE "pickupId" = duplicate_place_id
			OR "dropoffId" = duplicate_place_id
	) OR EXISTS (
		SELECT 1 FROM "BookingLeg"
		WHERE "pickupPlaceId" = duplicate_place_id
			OR "dropoffPlaceId" = duplicate_place_id
	) OR EXISTS (
		SELECT 1 FROM "TransferProduct"
		WHERE "defaultPickupPlaceId" = duplicate_place_id
	) OR EXISTS (
		SELECT 1 FROM "Note"
		WHERE "placeId" = duplicate_place_id
	) THEN
		RAISE EXCEPTION
			'Cannot delete duplicate PUJ airport place %: references remain',
			duplicate_place_id;
	END IF;

	DELETE FROM "Place"
	WHERE id = duplicate_place_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION
			'Cannot consolidate PUJ airport places: duplicate place % was not deleted',
			duplicate_place_id;
	END IF;
END $$;

COMMIT;
