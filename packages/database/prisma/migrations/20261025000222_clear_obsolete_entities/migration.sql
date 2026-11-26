/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NoteSeen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoutePrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZonePrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_allyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_createdByEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_itineraryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_placeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NoteSeen" DROP CONSTRAINT "NoteSeen_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NoteSeen" DROP CONSTRAINT "NoteSeen_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_fromId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Route" DROP CONSTRAINT "Route_toId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoutePrice" DROP CONSTRAINT "RoutePrice_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoutePrice" DROP CONSTRAINT "RoutePrice_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_routeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ZonePrice" DROP CONSTRAINT "ZonePrice_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ZonePrice" DROP CONSTRAINT "ZonePrice_zoneId_fkey";

-- DropTable
DROP TABLE "public"."Note";

-- DropTable
DROP TABLE "public"."NoteSeen";

-- DropTable
DROP TABLE "public"."Route";

-- DropTable
DROP TABLE "public"."RoutePrice";

-- DropTable
DROP TABLE "public"."ZonePrice";

-- DropEnum
DROP TYPE "public"."NoteTag";
