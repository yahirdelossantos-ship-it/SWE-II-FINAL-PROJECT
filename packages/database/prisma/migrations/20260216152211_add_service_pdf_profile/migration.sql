-- CreateTable
CREATE TABLE "ServicePdf" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientName" TEXT,
    "time" TEXT,
    "flightCode" TEXT,
    "pax" INTEGER,
    "hotelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePdf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicePdf_serviceId_key" ON "ServicePdf"("serviceId");

-- CreateIndex
CREATE INDEX "ServicePdf_serviceId_idx" ON "ServicePdf"("serviceId");

-- AddForeignKey
ALTER TABLE "ServicePdf" ADD CONSTRAINT "ServicePdf_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
