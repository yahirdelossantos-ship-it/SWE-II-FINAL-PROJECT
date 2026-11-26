-- July 15 at midnight in America/Santo_Domingo is 04:00 UTC.
UPDATE "FinanceConfiguration"
SET
  "ledgerStartsOn" = TIMESTAMP '2026-07-15 04:00:00.000',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'default';
