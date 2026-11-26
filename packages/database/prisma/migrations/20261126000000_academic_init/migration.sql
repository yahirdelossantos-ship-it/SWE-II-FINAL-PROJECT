-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ARRIVAL', 'DEPARTURE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMINISTRATOR', 'COORDINATOR', 'MANAGER');

-- CreateEnum
CREATE TYPE "EmployeeState" AS ENUM ('WORKING', 'SUSPENDED', 'FIRED');

-- CreateEnum
CREATE TYPE "PlaceKind" AS ENUM ('AIRPORT', 'HOTEL', 'OTHER', 'RESORT', 'BEACH', 'CLUB', 'RESTAURANT', 'MARINA', 'RESIDENCE', 'CONDO', 'RESIDENTIAL', 'VILLAS', 'BAR', 'APARTHOTEL', 'APARTMENT', 'AIRBNB');

-- CreateTable
CREATE TABLE "Employee" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"email" TEXT,
	"identification" TEXT,
	"role" "EmployeeRole" NOT NULL,
	"state" "EmployeeState" NOT NULL DEFAULT 'WORKING',
	"photo" TEXT,
	"darkMode" BOOLEAN NOT NULL DEFAULT false,
	"minimized" BOOLEAN NOT NULL DEFAULT false,
	"background" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessKey" (
	"id" TEXT NOT NULL,
	"key" TEXT NOT NULL,
	"employeeId" TEXT NOT NULL,

	CONSTRAINT "AccessKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
	"id" TEXT NOT NULL,
	"date" TIMESTAMP(3) NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
	"id" TEXT NOT NULL,
	"code" TEXT NOT NULL,
	"kindOf" "ServiceType" NOT NULL,
	"clientName" TEXT NOT NULL,
	"pickupTime" TIMESTAMP(3) NOT NULL,
	"originalPickupTime" TIMESTAMP(3) NOT NULL,
	"pickupTimeModifiedAt" TIMESTAMP(3),
	"pax" INTEGER NOT NULL,
	"luggage" INTEGER,
	"flightCode" TEXT,
	"note" TEXT,
	"pickupLocationName" TEXT,
	"dropoffLocationName" TEXT,
	"pickupDisplayName" TEXT,
	"dropoffDisplayName" TEXT,
	"vehicleTypeName" TEXT,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	"itineraryId" TEXT NOT NULL,
	"createdById" TEXT NOT NULL,
	"allyId" TEXT,
	"pickupId" TEXT,
	"dropoffId" TEXT,
	"vehicleId" TEXT,

	CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
	"id" TEXT NOT NULL,
	"kind" "PlaceKind" NOT NULL,
	"name" TEXT NOT NULL,
	"iata" VARCHAR(3),

	CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ally" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"color" TEXT,

	CONSTRAINT "Ally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,

	CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_identification_key" ON "Employee"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "AccessKey_employeeId_key" ON "AccessKey"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_date_key" ON "Itinerary"("date");

-- CreateIndex
CREATE INDEX "Service_itineraryId_pickupTime_idx" ON "Service"("itineraryId", "pickupTime");

-- CreateIndex
CREATE INDEX "Service_createdById_idx" ON "Service"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_kindOf_key" ON "Service"("code", "kindOf");

-- CreateIndex
CREATE UNIQUE INDEX "Place_iata_key" ON "Place"("iata");

-- CreateIndex
CREATE INDEX "Place_kind_name_idx" ON "Place"("kind", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Ally_name_key" ON "Ally"("name");

-- CreateIndex
CREATE INDEX "Vehicle_name_idx" ON "Vehicle"("name");

-- AddForeignKey
ALTER TABLE "AccessKey" ADD CONSTRAINT "AccessKey_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_allyId_fkey" FOREIGN KEY ("allyId") REFERENCES "Ally"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_dropoffId_fkey" FOREIGN KEY ("dropoffId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
