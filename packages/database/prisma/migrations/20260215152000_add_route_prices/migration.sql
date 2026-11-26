-- CreateTable
CREATE TABLE "RoutePrice" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutePrice_routeId_idx" ON "RoutePrice"("routeId");

-- CreateIndex
CREATE INDEX "RoutePrice_vehicleId_idx" ON "RoutePrice"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "RoutePrice_routeId_vehicleId_key" ON "RoutePrice"("routeId", "vehicleId");

-- AddForeignKey
ALTER TABLE "RoutePrice" ADD CONSTRAINT "RoutePrice_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePrice" ADD CONSTRAINT "RoutePrice_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
