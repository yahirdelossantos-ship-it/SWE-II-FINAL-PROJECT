-- AlterTable
ALTER TABLE "Service"
ADD COLUMN "originalPickupTime" TIMESTAMP(3),
ADD COLUMN "pickupTimeModifiedAt" TIMESTAMP(3);
