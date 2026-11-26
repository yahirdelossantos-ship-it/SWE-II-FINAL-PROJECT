-- The maintained v2 flow no longer persists coordinates. Keep the nullable
-- columns temporarily because legacy v1 still compiles against the shared model.
UPDATE "Place"
SET "latitude" = NULL,
    "longitude" = NULL
WHERE "latitude" IS NOT NULL
   OR "longitude" IS NOT NULL;

DROP INDEX "Place_googlePlaceId_idx";

CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");
