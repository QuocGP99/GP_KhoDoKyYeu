-- AlterTable
ALTER TABLE "productcategories" RENAME CONSTRAINT "product_categories_pkey" TO "productcategories_pkey";

-- RenameIndex
ALTER INDEX "product_categories_code_key" RENAME TO "productcategories_code_key";
