CREATE TYPE "PriceRateKind" AS ENUM ('AIRPORT', 'INTER_ZONE');

ALTER TABLE "PriceTableRate"
  ADD COLUMN "kind" "PriceRateKind" NOT NULL DEFAULT 'INTER_ZONE';

UPDATE "PriceTableRate"
SET "kind" = 'AIRPORT'
WHERE "zoneFromId" = 'cmmkqc9bd005bi6dpq3txlm2c'
   OR "zoneToId" = 'cmmkqc9bd005bi6dpq3txlm2c';

ALTER TABLE "PriceTableRate"
  ALTER COLUMN "kind" DROP DEFAULT;

DROP INDEX "PriceTableRate_priceTableId_zoneFromId_zoneToId_vehicleId_key";

CREATE UNIQUE INDEX "PriceTableRate_priceTableId_kind_zoneFromId_zoneToId_vehicleId_key"
  ON "PriceTableRate"("priceTableId", "kind", "zoneFromId", "zoneToId", "vehicleId");

CREATE INDEX "PriceTableRate_priceTableId_kind_idx"
  ON "PriceTableRate"("priceTableId", "kind");

DROP INDEX IF EXISTS "FinanceCategory_systemKey_key";

ALTER TABLE "FinanceCategory"
  DROP COLUMN "systemKey";
