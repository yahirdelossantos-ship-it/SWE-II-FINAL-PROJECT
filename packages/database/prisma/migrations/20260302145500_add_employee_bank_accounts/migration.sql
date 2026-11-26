-- CreateTable
CREATE TABLE "EmployeeBankAccount" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "bank" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountType" "AccountType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmployeeBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeBankAccount_employeeId_idx" ON "EmployeeBankAccount"("employeeId");

-- AddForeignKey
ALTER TABLE "EmployeeBankAccount"
ADD CONSTRAINT "EmployeeBankAccount_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
