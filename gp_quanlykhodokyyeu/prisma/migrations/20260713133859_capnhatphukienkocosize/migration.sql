-- Drop foreign keys trước khi rename bảng đích
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_category_id_fkey";
ALTER TABLE "size_rules" DROP CONSTRAINT IF EXISTS "size_rules_product_category_id_fkey";

-- 1) Đổi tên bảng product_categories -> productcategories
ALTER TABLE "product_categories" RENAME TO "productcategories";

-- 2) Nếu cần, đổi tên các cột của products để khớp schema mới
ALTER TABLE "products"
  RENAME COLUMN "image_url" TO "imageurl";

ALTER TABLE "products"
  RENAME COLUMN "is_active" TO "isactive";

-- 3) Thêm cột mới hassize cho products
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "hassize" BOOLEAN NOT NULL DEFAULT true;

-- 4) Đổi tên cột của productcategories nếu bảng cũ đang dùng snake_case
--ALTER TABLE "productcategories"
  --RENAME COLUMN "has_size" TO "hassize";

ALTER TABLE "productcategories"
  RENAME COLUMN "is_active" TO "isactive";

-- 5) Nếu bảng cũ chưa có hassize thì thêm mới
ALTER TABLE "productcategories"
  ADD COLUMN IF NOT EXISTS "hassize" BOOLEAN NOT NULL DEFAULT true;

-- 6) Nếu bảng cũ chưa có updated_at hoặc created_at thì thôi, nhưng theo schema cũ của bạn gần như đã có.
-- Nếu chưa có updated_at thật thì dùng đoạn này:
-- ALTER TABLE "productcategories"
--   ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);
-- UPDATE "productcategories"
-- SET "updated_at" = COALESCE("created_at", NOW())
-- WHERE "updated_at" IS NULL;
-- ALTER TABLE "productcategories"
--   ALTER COLUMN "updated_at" SET NOT NULL;

-- 7) Tạo lại foreign key sau khi rename xong
ALTER TABLE "products"
  ADD CONSTRAINT "products_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "productcategories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "size_rules"
  ADD CONSTRAINT "size_rules_product_category_id_fkey"
  FOREIGN KEY ("product_category_id") REFERENCES "productcategories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;