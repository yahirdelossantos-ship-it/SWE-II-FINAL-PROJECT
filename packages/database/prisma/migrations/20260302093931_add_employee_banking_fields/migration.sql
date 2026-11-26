-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('AHORROS', 'CORRIENTE');

-- AlterTable
ALTER TABLE "Employee"
ADD COLUMN "accountNumber" TEXT,
ADD COLUMN "accountType" "AccountType",
ADD COLUMN "bank" TEXT,
ADD COLUMN "idNumber" TEXT;
