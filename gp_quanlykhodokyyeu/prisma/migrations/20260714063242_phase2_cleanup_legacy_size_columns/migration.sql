-- DropIndex
DROP INDEX "size_rules_product_id_idx";

-- DropIndex
DROP INDEX "size_rules_rule_set_id_priority_idx";

-- AlterTable
ALTER TABLE "size_rules" ADD COLUMN     "productCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "size_rules_is_active_idx" ON "size_rules"("is_active");

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "productcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
