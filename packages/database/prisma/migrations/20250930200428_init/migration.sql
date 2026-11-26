-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ARRIVAL', 'DEPARTURE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "ServiceState" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('DOP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "VehicleState" AS ENUM ('FUNCTIONAL', 'DAMAGED', 'ONSERVICE', 'OFFSERVICE');

-- CreateEnum
CREATE TYPE "VehicleFuelState" AS ENUM ('FULL', 'MIDDLE', 'EMPTY');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMINISTRATOR', 'DEVELOPER', 'COORDINATOR', 'MANAGER', 'DRIVER', 'STAFF');

-- CreateEnum
CREATE TYPE "EmployeeState" AS ENUM ('WORKING', 'SUSPENDED', 'FIRED');

-- CreateEnum
CREATE TYPE "NoteTag" AS ENUM ('EMERGENCY', 'IMPORTANT', 'REMINDER', 'MINOR', 'IDEA', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PlaceKind" AS ENUM ('AIRPORT', 'HOTEL', 'OTHER');

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "kind" "PlaceKind" NOT NULL,
    "name" TEXT NOT NULL,
    "iata" VARCHAR(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "identification" TEXT,
    "role" "EmployeeRole" NOT NULL,
    "state" "EmployeeState" NOT NULL DEFAULT 'WORKING',
    "age" INTEGER,
    "birthdate" TIMESTAMP(3),
    "startedOn" TIMESTAMP(3),
    "avrgWorkingHours" INTEGER,
    "phone" TEXT,
    "emergencyPhone" TEXT,
    "email" TEXT,
    "payAmount" DECIMAL(12,2),
    "payFrequency" "Frequency",
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "appAccent" TEXT,
    "minimized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ips" TEXT[],
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "AccessKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "brand" TEXT,
    "identifierDocument" TEXT,
    "state" "VehicleState" NOT NULL DEFAULT 'FUNCTIONAL',
    "paxCapacity" INTEGER NOT NULL,
    "luggageCapacity" INTEGER NOT NULL,
    "fuelType" TEXT,
    "fuelUnitPrice" DECIMAL(12,2),
    "fuelState" "VehicleFuelState" NOT NULL DEFAULT 'MIDDLE',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMaintenanceOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ally" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "contactNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'DOP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "kindOf" "ServiceType" NOT NULL,
    "state" "ServiceState" NOT NULL DEFAULT 'UPCOMING',
    "clientName" TEXT NOT NULL,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "flightCode" TEXT,
    "pax" INTEGER NOT NULL,
    "luggage" INTEGER,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "allyId" TEXT,
    "pickupId" TEXT NOT NULL,
    "dropoffId" TEXT NOT NULL,
    "routeId" TEXT,
    "price" DECIMAL(12,2),
    "currency" "Currency",
    "flierUrl" TEXT,
    "itineraryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sorted" BOOLEAN NOT NULL DEFAULT false,
    "flightsChecked" BOOLEAN NOT NULL DEFAULT false,
    "timesConverted" BOOLEAN NOT NULL DEFAULT false,
    "edgeCases" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "tag" "NoteTag",
    "content" TEXT NOT NULL,
    "serviceId" TEXT,
    "itineraryId" TEXT,
    "vehicleId" TEXT,
    "placeId" TEXT,
    "routeId" TEXT,
    "allyId" TEXT,
    "budgetId" TEXT,
    "employeeId" TEXT,
    "transactionId" TEXT,
    "spendingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'DOP',
    "serviceId" TEXT,
    "vehicleId" TEXT,
    "employeeId" TEXT,
    "assignedBudgetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "category" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'DOP',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spending" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" "Frequency",
    "assignedBudgetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "html" TEXT NOT NULL,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "emergencyNumber" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "about" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Place_kind_name_idx" ON "Place"("kind", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Place_kind_name_iata_key" ON "Place"("kind", "name", "iata");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_identification_key" ON "Employee"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_key_key" ON "AccessKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_employeeId_key" ON "AccessKey"("employeeId");

-- CreateIndex
CREATE INDEX "Vehicle_state_idx" ON "Vehicle"("state");

-- CreateIndex
CREATE INDEX "Vehicle_brand_idx" ON "Vehicle"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "Ally_name_key" ON "Ally"("name");

-- CreateIndex
CREATE INDEX "Route_fromId_toId_idx" ON "Route"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_fromId_toId_key" ON "Route"("name", "fromId", "toId");

-- CreateIndex
CREATE INDEX "Service_state_pickupTime_idx" ON "Service"("state", "pickupTime");

-- CreateIndex
CREATE INDEX "Service_driverId_vehicleId_idx" ON "Service"("driverId", "vehicleId");

-- CreateIndex
CREATE INDEX "Service_allyId_idx" ON "Service"("allyId");

-- CreateIndex
CREATE INDEX "Service_pickupId_dropoffId_idx" ON "Service"("pickupId", "dropoffId");

-- CreateIndex
CREATE INDEX "Service_routeId_idx" ON "Service"("routeId");

-- CreateIndex
CREATE INDEX "Service_code_idx" ON "Service"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_date_key" ON "Itinerary"("date");

-- CreateIndex
CREATE INDEX "Note_serviceId_itineraryId_vehicleId_employeeId_idx" ON "Note"("serviceId", "itineraryId", "vehicleId", "employeeId");

-- CreateIndex
CREATE INDEX "Note_placeId_routeId_allyId_idx" ON "Note"("placeId", "routeId", "allyId");

-- CreateIndex
CREATE INDEX "Note_budgetId_transactionId_spendingId_idx" ON "Note"("budgetId", "transactionId", "spendingId");

-- CreateIndex
CREATE INDEX "Transaction_serviceId_vehicleId_employeeId_idx" ON "Transaction"("serviceId", "vehicleId", "employeeId");

-- CreateIndex
CREATE INDEX "Transaction_assignedBudgetId_idx" ON "Transaction"("assignedBudgetId");

-- CreateIndex
CREATE INDEX "Budget_category_idx" ON "Budget"("category");

-- CreateIndex
CREATE INDEX "Spending_assignedBudgetId_idx" ON "Spending"("assignedBudgetId");

-- AddForeignKey
ALTER TABLE "AccessKey" ADD CONSTRAINT "AccessKey_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_allyId_fkey" FOREIGN KEY ("allyId") REFERENCES "Ally"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_dropoffId_fkey" FOREIGN KEY ("dropoffId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_allyId_fkey" FOREIGN KEY ("allyId") REFERENCES "Ally"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_spendingId_fkey" FOREIGN KEY ("spendingId") REFERENCES "Spending"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assignedBudgetId_fkey" FOREIGN KEY ("assignedBudgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spending" ADD CONSTRAINT "Spending_assignedBudgetId_fkey" FOREIGN KEY ("assignedBudgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
