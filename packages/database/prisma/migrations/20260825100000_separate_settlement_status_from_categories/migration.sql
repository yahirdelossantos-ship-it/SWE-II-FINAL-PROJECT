ALTER TABLE "FinanceTransaction"
  DROP CONSTRAINT "FinanceTransaction_categoryId_fkey";

ALTER TABLE "FinanceTransaction"
  ALTER COLUMN "categoryId" DROP NOT NULL;

UPDATE "FinanceTransaction" AS transaction
SET "categoryId" = NULL
FROM "FinanceCategory" AS category
WHERE transaction."categoryId" = category."id"
  AND category."systemKey" IS NOT NULL;

DELETE FROM "FinanceCategory"
WHERE "systemKey" IS NOT NULL;

ALTER TABLE "FinanceTransaction"
  ADD CONSTRAINT "FinanceTransaction_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
