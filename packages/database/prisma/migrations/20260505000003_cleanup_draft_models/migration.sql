/*
  Warnings:

  - You are about to drop the column `budgetId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `spendingId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Spending` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_spendingId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Spending" DROP CONSTRAINT "Spending_assignedBudgetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assignedBudgetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_vehicleId_fkey";

-- DropIndex
DROP INDEX "Note_budgetId_transactionId_spendingId_idx";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "budgetId",
DROP COLUMN "spendingId",
DROP COLUMN "transactionId";

-- DropTable
DROP TABLE "Budget";

-- DropTable
DROP TABLE "Contract";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Spending";

-- DropTable
DROP TABLE "Transaction";
