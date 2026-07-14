-- 1) Chặn nếu còn size_rules chưa có product_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "size_rules"
    WHERE "product_id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot cleanup legacy size columns: found size_rules.product_id IS NULL';
  END IF;
END $$;

-- 2) Khóa product_id thành bắt buộc
ALTER TABLE "size_rules"
ALTER COLUMN "product_id" SET NOT NULL;

-- 3) Gỡ ràng buộc cũ liên quan product_category_id
ALTER TABLE "size_rules"
DROP CONSTRAINT IF EXISTS "size_rules_product_category_id_fkey";

DROP INDEX IF EXISTS "size_rules_product_category_id_idx";

-- 4) Xóa cột product_category_id cũ
ALTER TABLE "size_rules"
DROP COLUMN IF EXISTS "product_category_id";

-- 5) Gỡ FK/index cũ trên renters
ALTER TABLE "renters"
DROP CONSTRAINT IF EXISTS "renters_suggested_size_id_fkey";

ALTER TABLE "renters"
DROP CONSTRAINT IF EXISTS "renters_confirmed_size_id_fkey";

DROP INDEX IF EXISTS "renters_suggested_size_id_idx";
DROP INDEX IF EXISTS "renters_confirmed_size_id_idx";

-- 6) Xóa 2 cột size cũ ở renters
ALTER TABLE "renters"
DROP COLUMN IF EXISTS "suggested_size_id",
DROP COLUMN IF EXISTS "confirmed_size_id";