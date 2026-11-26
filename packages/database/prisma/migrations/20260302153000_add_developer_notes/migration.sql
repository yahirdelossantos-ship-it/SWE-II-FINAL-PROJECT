-- CreateEnum
CREATE TYPE "DeveloperNoteType" AS ENUM ('PATCH', 'UPDATE', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "DeveloperNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "DeveloperNoteType" NOT NULL DEFAULT 'INFO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeveloperNote_type_idx" ON "DeveloperNote"("type");

-- CreateIndex
CREATE INDEX "DeveloperNote_isActive_startsAt_expiresAt_idx" ON "DeveloperNote"("isActive", "startsAt", "expiresAt");

-- CreateIndex
CREATE INDEX "DeveloperNote_createdAt_idx" ON "DeveloperNote"("createdAt");
