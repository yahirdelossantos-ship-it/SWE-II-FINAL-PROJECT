/*
  Warnings:

  - You are about to drop the column `currency` on the `Route` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_fromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_toId_fkey";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "zoneId" TEXT;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "currency";

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonePrice" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZonePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Zone_name_idx" ON "Zone"("name");

-- CreateIndex
CREATE INDEX "ZonePrice_zoneId_idx" ON "ZonePrice"("zoneId");

-- CreateIndex
CREATE INDEX "ZonePrice_vehicleId_idx" ON "ZonePrice"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "ZonePrice_zoneId_vehicleId_key" ON "ZonePrice"("zoneId", "vehicleId");

-- CreateIndex
CREATE INDEX "Place_zoneId_idx" ON "Place"("zoneId");

-- AddForeignKey
ALTER TABLE "ZonePrice" ADD CONSTRAINT "ZonePrice_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZonePrice" ADD CONSTRAINT "ZonePrice_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
