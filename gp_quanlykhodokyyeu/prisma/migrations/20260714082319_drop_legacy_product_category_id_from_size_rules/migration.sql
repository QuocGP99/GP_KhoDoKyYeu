ALTER TABLE "size_rules"
DROP CONSTRAINT IF EXISTS "size_rules_productCategoryId_fkey";

DROP INDEX IF EXISTS "size_rules_productCategoryId_idx";

ALTER TABLE "size_rules"
DROP COLUMN IF EXISTS "productCategoryId";