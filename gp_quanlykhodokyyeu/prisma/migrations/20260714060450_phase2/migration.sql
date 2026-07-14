-- DropIndex
DROP INDEX "size_rules_is_active_idx";

-- AlterTable
ALTER TABLE "renters" ADD COLUMN     "confirmed_size_id" TEXT,
ADD COLUMN     "suggested_size_id" TEXT;

-- AlterTable
ALTER TABLE "size_rules" ADD COLUMN     "product_category_id" TEXT,
ALTER COLUMN "product_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "renters_suggested_size_id_idx" ON "renters"("suggested_size_id");

-- CreateIndex
CREATE INDEX "renters_confirmed_size_id_idx" ON "renters"("confirmed_size_id");

-- CreateIndex
CREATE INDEX "size_rules_product_category_id_idx" ON "size_rules"("product_category_id");

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_suggested_size_id_fkey" FOREIGN KEY ("suggested_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_confirmed_size_id_fkey" FOREIGN KEY ("confirmed_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "productcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
