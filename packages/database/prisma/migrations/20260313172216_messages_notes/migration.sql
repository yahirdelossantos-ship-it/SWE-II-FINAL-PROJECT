-- AlterTable
ALTER TABLE "DeveloperNote" ADD COLUMN     "createdByEmployeeId" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "createdByEmployeeId" TEXT,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NoteSeen" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteSeen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperNoteGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "versionLabel" TEXT,
    "tagLabel" TEXT,
    "color" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByEmployeeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperNoteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperNoteSeen" (
    "id" TEXT NOT NULL,
    "developerNoteId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperNoteSeen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NoteSeen_employeeId_seenAt_idx" ON "NoteSeen"("employeeId", "seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoteSeen_noteId_employeeId_key" ON "NoteSeen"("noteId", "employeeId");

-- CreateIndex
CREATE INDEX "DeveloperNoteGroup_isFeatured_isActive_idx" ON "DeveloperNoteGroup"("isFeatured", "isActive");

-- CreateIndex
CREATE INDEX "DeveloperNoteGroup_createdByEmployeeId_idx" ON "DeveloperNoteGroup"("createdByEmployeeId");

-- CreateIndex
CREATE INDEX "DeveloperNoteGroup_createdAt_idx" ON "DeveloperNoteGroup"("createdAt");

-- CreateIndex
CREATE INDEX "DeveloperNoteSeen_employeeId_seenAt_idx" ON "DeveloperNoteSeen"("employeeId", "seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperNoteSeen_developerNoteId_employeeId_key" ON "DeveloperNoteSeen"("developerNoteId", "employeeId");

-- CreateIndex
CREATE INDEX "DeveloperNote_groupId_idx" ON "DeveloperNote"("groupId");

-- CreateIndex
CREATE INDEX "DeveloperNote_createdByEmployeeId_idx" ON "DeveloperNote"("createdByEmployeeId");

-- CreateIndex
CREATE INDEX "DeveloperNote_isFeatured_createdAt_idx" ON "DeveloperNote"("isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "Note_createdByEmployeeId_idx" ON "Note"("createdByEmployeeId");

-- CreateIndex
CREATE INDEX "Note_isPinned_createdAt_idx" ON "Note"("isPinned", "createdAt");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSeen" ADD CONSTRAINT "NoteSeen_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteSeen" ADD CONSTRAINT "NoteSeen_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperNoteGroup" ADD CONSTRAINT "DeveloperNoteGroup_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperNote" ADD CONSTRAINT "DeveloperNote_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DeveloperNoteGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperNote" ADD CONSTRAINT "DeveloperNote_createdByEmployeeId_fkey" FOREIGN KEY ("createdByEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperNoteSeen" ADD CONSTRAINT "DeveloperNoteSeen_developerNoteId_fkey" FOREIGN KEY ("developerNoteId") REFERENCES "DeveloperNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperNoteSeen" ADD CONSTRAINT "DeveloperNoteSeen_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
