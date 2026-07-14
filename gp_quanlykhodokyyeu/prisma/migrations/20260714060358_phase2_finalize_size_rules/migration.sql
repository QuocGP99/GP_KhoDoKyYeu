-- 1) Nhân bản rule cũ theo tất cả product trong cùng category
INSERT INTO "size_rules" (
  "id",
  "rule_set_id",
  "product_id",
  "gender",
  "min_height_cm",
  "max_height_cm",
  "min_weight_kg",
  "max_weight_kg",
  "size_id",
  "priority",
  "is_active",
  "note",
  "created_at",
  "updated_at"
)
SELECT
  md5(
    sr."id" || ':' || p."id"
  )::text,
  sr."rule_set_id",
  p."id",
  sr."gender",
  sr."min_height_cm",
  sr."max_height_cm",
  sr."min_weight_kg",
  sr."max_weight_kg",
  sr."size_id",
  sr."priority",
  COALESCE(sr."is_active", true),
  sr."note",
  sr."created_at",
  sr."updated_at"
FROM "size_rules" sr
JOIN "products" p
  ON p."category_id" = sr."product_category_id"
WHERE sr."product_id" IS NULL
  AND sr."product_category_id" IS NOT NULL;

-- 2) Xóa rule cũ theo category sau khi đã nhân bản
DELETE FROM "size_rules"
WHERE "product_id" IS NULL
  AND "product_category_id" IS NOT NULL;

-- 3) Nếu còn rule nào chưa có product_id thì dừng ngay
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "size_rules"
    WHERE "product_id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Phase 2 failed: still found size_rules.product_id IS NULL';
  END IF;
END $$;

-- 4) Gỡ foreign key/index cũ liên quan product_category_id
ALTER TABLE "size_rules" DROP CONSTRAINT IF EXISTS "size_rules_product_category_id_fkey";
DROP INDEX IF EXISTS "size_rules_product_category_id_idx";

-- 5) Siết cột product_id thành bắt buộc
ALTER TABLE "size_rules"
ALTER COLUMN "product_id" SET NOT NULL;

-- 6) Tạo lại các index cần cho schema cuối
CREATE INDEX IF NOT EXISTS "size_rules_rule_set_id_product_id_priority_idx"
  ON "size_rules"("rule_set_id", "product_id", "priority");

CREATE INDEX IF NOT EXISTS "size_rules_product_id_gender_idx"
  ON "size_rules"("product_id", "gender");

CREATE INDEX IF NOT EXISTS "size_rules_is_active_idx"
  ON "size_rules"("is_active");

-- 7) Xóa cột cũ ở renters
ALTER TABLE "renters" DROP CONSTRAINT IF EXISTS "renters_suggested_size_id_fkey";
ALTER TABLE "renters" DROP CONSTRAINT IF EXISTS "renters_confirmed_size_id_fkey";

DROP INDEX IF EXISTS "renters_suggested_size_id_idx";
DROP INDEX IF EXISTS "renters_confirmed_size_id_idx";

ALTER TABLE "renters" DROP COLUMN IF EXISTS "suggested_size_id";
ALTER TABLE "renters" DROP COLUMN IF EXISTS "confirmed_size_id";

-- 8) Xóa cột cũ ở size_rules
ALTER TABLE "size_rules" DROP COLUMN IF EXISTS "product_category_id";