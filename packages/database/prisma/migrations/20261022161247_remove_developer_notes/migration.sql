/*
  Warnings:

  - You are about to drop the `DeveloperNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeveloperNoteGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeveloperNoteSeen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DeveloperNote" DROP CONSTRAINT "DeveloperNote_createdByEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeveloperNote" DROP CONSTRAINT "DeveloperNote_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeveloperNoteGroup" DROP CONSTRAINT "DeveloperNoteGroup_createdByEmployeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeveloperNoteSeen" DROP CONSTRAINT "DeveloperNoteSeen_developerNoteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeveloperNoteSeen" DROP CONSTRAINT "DeveloperNoteSeen_employeeId_fkey";

-- DropTable
DROP TABLE "public"."DeveloperNote";

-- DropTable
DROP TABLE "public"."DeveloperNoteGroup";

-- DropTable
DROP TABLE "public"."DeveloperNoteSeen";

-- DropEnum
DROP TYPE "public"."DeveloperNoteType";
