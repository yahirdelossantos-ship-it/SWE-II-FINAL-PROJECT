CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED', 'FINED', 'NO_SHOW');
CREATE TYPE "SettlementPricingMode" AS ENUM ('INFERRED', 'MANUAL');
CREATE TYPE "FinanceTransactionType" AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE "FinanceConfiguration" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "ledgerStartsOn" TIMESTAMP(3) NOT NULL,
  "lockedAt" TIMESTAMP(3),
  "configuredById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PriceTable" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "currency" "Currency" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PriceTable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PriceTableRate" (
  "id" TEXT NOT NULL,
  "priceTableId" TEXT NOT NULL,
  "zoneFromId" TEXT NOT NULL,
  "zoneToId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PriceTableRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceAccount" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "institution" TEXT,
  "currency" "Currency" NOT NULL,
  "initialBalance" DECIMAL(14,2) NOT NULL,
  "balanceAsOf" TIMESTAMP(3) NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "emoji" TEXT,
  "type" "FinanceTransactionType" NOT NULL,
  "systemKey" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceSettlement" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
  "pricingMode" "SettlementPricingMode",
  "originZoneOverrideId" TEXT,
  "destinationZoneOverrideId" TEXT,
  "inferredAmount" DECIMAL(12,2),
  "finalAmount" DECIMAL(12,2),
  "currency" "Currency",
  "priceTableId" TEXT,
  "priceTableRateId" TEXT,
  "accountId" TEXT,
  "tableNameSnapshot" TEXT,
  "originZoneNameSnapshot" TEXT,
  "destinationZoneNameSnapshot" TEXT,
  "vehicleNameSnapshot" TEXT,
  "rateAmountSnapshot" DECIMAL(12,2),
  "strandedReason" TEXT,
  "settledAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceSettlement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinanceTransaction" (
  "id" TEXT NOT NULL,
  "title" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "type" "FinanceTransactionType" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "emoji" TEXT,
  "accountId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "serviceSettlementId" TEXT,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceTransaction_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Ally" ADD COLUMN "priceTableId" TEXT;

CREATE UNIQUE INDEX "PriceTable_name_key" ON "PriceTable"("name");
CREATE INDEX "PriceTable_active_idx" ON "PriceTable"("active");
CREATE UNIQUE INDEX "PriceTableRate_priceTableId_zoneFromId_zoneToId_vehicleId_key" ON "PriceTableRate"("priceTableId", "zoneFromId", "zoneToId", "vehicleId");
CREATE INDEX "PriceTableRate_zoneFromId_idx" ON "PriceTableRate"("zoneFromId");
CREATE INDEX "PriceTableRate_zoneToId_idx" ON "PriceTableRate"("zoneToId");
CREATE INDEX "PriceTableRate_vehicleId_idx" ON "PriceTableRate"("vehicleId");
CREATE INDEX "FinanceAccount_currency_active_idx" ON "FinanceAccount"("currency", "active");
CREATE UNIQUE INDEX "FinanceCategory_systemKey_key" ON "FinanceCategory"("systemKey");
CREATE UNIQUE INDEX "FinanceCategory_name_type_key" ON "FinanceCategory"("name", "type");
CREATE INDEX "FinanceCategory_type_active_idx" ON "FinanceCategory"("type", "active");
CREATE UNIQUE INDEX "ServiceSettlement_serviceId_key" ON "ServiceSettlement"("serviceId");
CREATE INDEX "ServiceSettlement_status_settledAt_idx" ON "ServiceSettlement"("status", "settledAt");
CREATE INDEX "ServiceSettlement_accountId_idx" ON "ServiceSettlement"("accountId");
CREATE UNIQUE INDEX "FinanceTransaction_serviceSettlementId_key" ON "FinanceTransaction"("serviceSettlementId");
CREATE INDEX "FinanceTransaction_occurredAt_idx" ON "FinanceTransaction"("occurredAt");
CREATE INDEX "FinanceTransaction_accountId_occurredAt_idx" ON "FinanceTransaction"("accountId", "occurredAt");
CREATE INDEX "FinanceTransaction_categoryId_occurredAt_idx" ON "FinanceTransaction"("categoryId", "occurredAt");
CREATE INDEX "Ally_priceTableId_idx" ON "Ally"("priceTableId");

ALTER TABLE "FinanceConfiguration" ADD CONSTRAINT "FinanceConfiguration_configuredById_fkey" FOREIGN KEY ("configuredById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PriceTableRate" ADD CONSTRAINT "PriceTableRate_priceTableId_fkey" FOREIGN KEY ("priceTableId") REFERENCES "PriceTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceTableRate" ADD CONSTRAINT "PriceTableRate_zoneFromId_fkey" FOREIGN KEY ("zoneFromId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PriceTableRate" ADD CONSTRAINT "PriceTableRate_zoneToId_fkey" FOREIGN KEY ("zoneToId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PriceTableRate" ADD CONSTRAINT "PriceTableRate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceCategory" ADD CONSTRAINT "FinanceCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinanceCategory" ADD CONSTRAINT "FinanceCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_originZoneOverrideId_fkey" FOREIGN KEY ("originZoneOverrideId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_destinationZoneOverrideId_fkey" FOREIGN KEY ("destinationZoneOverrideId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_priceTableId_fkey" FOREIGN KEY ("priceTableId") REFERENCES "PriceTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_priceTableRateId_fkey" FOREIGN KEY ("priceTableRateId") REFERENCES "PriceTableRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceSettlement" ADD CONSTRAINT "ServiceSettlement_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinanceAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_serviceSettlementId_fkey" FOREIGN KEY ("serviceSettlementId") REFERENCES "ServiceSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinanceTransaction" ADD CONSTRAINT "FinanceTransaction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ally" ADD CONSTRAINT "Ally_priceTableId_fkey" FOREIGN KEY ("priceTableId") REFERENCES "PriceTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "FinanceCategory" ("id", "name", "color", "emoji", "type", "systemKey", "active", "createdAt", "updatedAt") VALUES
  ('finance-category-service-completed', 'Servicios completados', '#22c55e', '✓', 'INCOME', 'SERVICE_COMPLETED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('finance-category-no-show', 'No show', '#f59e0b', '◷', 'INCOME', 'SERVICE_NO_SHOW', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('finance-category-fines', 'Multas', '#ef4444', '!', 'EXPENSE', 'SERVICE_FINE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
