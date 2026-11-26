/*
  Warnings:

  - You are about to drop the column `price` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `flierUrl` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_dropoffId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_pickupId_fkey";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "currency",
DROP COLUMN "flierUrl",
ADD COLUMN     "dropoffLocationName" TEXT,
ADD COLUMN     "pickupLocationName" TEXT,
ADD COLUMN     "routeName" TEXT,
ADD COLUMN     "vehicleTypeName" TEXT,
ALTER COLUMN "pickupId" DROP NOT NULL,
ALTER COLUMN "dropoffId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_dropoffId_fkey" FOREIGN KEY ("dropoffId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
