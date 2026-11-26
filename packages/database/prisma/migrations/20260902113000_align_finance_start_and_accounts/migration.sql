-- August 24 at midnight in America/Santo_Domingo is 04:00 UTC.
BEGIN;

UPDATE "FinanceConfiguration"
SET
  "ledgerStartsOn" = TIMESTAMP '2026-08-24 04:00:00.000',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'default';

UPDATE "FinanceAccount"
SET
  "balanceAsOf" = TIMESTAMP '2026-08-24 04:00:00.000',
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;
