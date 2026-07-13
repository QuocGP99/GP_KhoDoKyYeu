/*
  Warnings:

  - You are about to drop the column `createdAt` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `item_statuses` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `item_statuses` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `item_statuses` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `item_statuses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `item_statuses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `itemCode` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `rentalPrice` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `hasSize` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product_categories` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSizeId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sizes` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `sizes` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `sizes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sizes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `warehouses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[item_code]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[branch_id,code]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `item_statuses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_code` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_id` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouse_id` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product_categories` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `code` on the `product_categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `category_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `sizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "RentalGroupStatus" AS ENUM ('DRAFT', 'REVIEWED', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AllocationOrderStatus" AS ENUM ('DRAFT', 'READY', 'PARTIALLY_ALLOCATED', 'ALLOCATED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AllocationItemStatus" AS ENUM ('ASSIGNED', 'PICKED_UP', 'RETURNED', 'MISSING', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('ALLOCATION', 'RETURN', 'IMPORT', 'MANUAL', 'ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_createdById_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_productId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_statusId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_defaultSizeId_fkey";

-- DropForeignKey
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_branchId_fkey";

-- DropIndex
DROP INDEX "item_statuses_sortOrder_idx";

-- DropIndex
DROP INDEX "items_itemCode_key";

-- DropIndex
DROP INDEX "items_productId_idx";

-- DropIndex
DROP INDEX "items_productId_sizeId_statusId_idx";

-- DropIndex
DROP INDEX "items_sizeId_idx";

-- DropIndex
DROP INDEX "items_statusId_idx";

-- DropIndex
DROP INDEX "items_warehouseId_idx";

-- DropIndex
DROP INDEX "items_warehouseId_statusId_idx";

-- DropIndex
DROP INDEX "products_categoryId_name_idx";

-- DropIndex
DROP INDEX "products_defaultSizeId_idx";

-- DropIndex
DROP INDEX "sizes_sortOrder_idx";

-- DropIndex
DROP INDEX "warehouses_branchId_code_key";

-- DropIndex
DROP INDEX "warehouses_branchId_name_idx";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "item_statuses" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "isSystem",
DROP COLUMN "sortOrder",
DROP COLUMN "updatedAt",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "items" DROP COLUMN "createdAt",
DROP COLUMN "createdById",
DROP COLUMN "isActive",
DROP COLUMN "itemCode",
DROP COLUMN "productId",
DROP COLUMN "purchasePrice",
DROP COLUMN "rentalPrice",
DROP COLUMN "sizeId",
DROP COLUMN "statusId",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedById",
DROP COLUMN "warehouseId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "item_code" TEXT NOT NULL,
ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "purchase_date" TIMESTAMP(3),
ADD COLUMN     "size_id" TEXT,
ADD COLUMN     "status_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "warehouse_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_categories" DROP COLUMN "createdAt",
DROP COLUMN "hasSize",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "code",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId",
DROP COLUMN "color",
DROP COLUMN "createdAt",
DROP COLUMN "defaultSizeId",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "gender" DROP DEFAULT;

-- AlterTable
ALTER TABLE "sizes" DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "sortOrder",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "isActive",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "warehouses" DROP COLUMN "branchId",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "branch_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "CategoryCode";

-- CreateTable
CREATE TABLE "user_warehouses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_status_histories" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "from_status_id" TEXT,
    "to_status_id" TEXT NOT NULL,
    "changed_by_user_id" TEXT NOT NULL,
    "reason" TEXT,
    "reference_type" "ReferenceType",
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_groups" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "group_code" TEXT,
    "group_name" TEXT NOT NULL,
    "school_name" TEXT,
    "shoot_date" TIMESTAMP(3),
    "status" "RentalGroupStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "rental_group_id" TEXT NOT NULL,
    "uploaded_by_user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch_errors" (
    "id" TEXT NOT NULL,
    "import_batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "field_name" TEXT,
    "error_message" TEXT NOT NULL,
    "raw_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batch_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renters" (
    "id" TEXT NOT NULL,
    "rental_group_id" TEXT NOT NULL,
    "import_batch_id" TEXT,
    "row_no" INTEGER,
    "student_code" TEXT,
    "full_name" TEXT NOT NULL,
    "gender" "Gender",
    "height_cm" INTEGER NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "suggested_size_id" TEXT,
    "confirmed_size_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_rule_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_rule_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_rules" (
    "id" TEXT NOT NULL,
    "rule_set_id" TEXT NOT NULL,
    "gender" "Gender",
    "product_category_id" TEXT,
    "min_height_cm" INTEGER NOT NULL,
    "max_height_cm" INTEGER NOT NULL,
    "min_weight_kg" DECIMAL(5,2) NOT NULL,
    "max_weight_kg" DECIMAL(5,2) NOT NULL,
    "size_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_orders" (
    "id" TEXT NOT NULL,
    "rental_group_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "allocated_by_user_id" TEXT NOT NULL,
    "status" "AllocationOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_order_items" (
    "id" TEXT NOT NULL,
    "allocation_order_id" TEXT NOT NULL,
    "renter_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "assigned_size_id" TEXT,
    "returned_at" TIMESTAMP(3),
    "return_note" TEXT,
    "status" "AllocationItemStatus" NOT NULL DEFAULT 'ASSIGNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alert_rules" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "product_id" TEXT,
    "size_id" TEXT,
    "min_green_qty" INTEGER NOT NULL DEFAULT 0,
    "min_yellow_qty" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_warehouses_warehouse_id_idx" ON "user_warehouses"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_warehouses_user_id_warehouse_id_key" ON "user_warehouses"("user_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "product_sizes_size_id_idx" ON "product_sizes"("size_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_product_id_size_id_key" ON "product_sizes"("product_id", "size_id");

-- CreateIndex
CREATE INDEX "item_status_histories_item_id_created_at_idx" ON "item_status_histories"("item_id", "created_at");

-- CreateIndex
CREATE INDEX "item_status_histories_to_status_id_idx" ON "item_status_histories"("to_status_id");

-- CreateIndex
CREATE INDEX "item_status_histories_changed_by_user_id_idx" ON "item_status_histories"("changed_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rental_groups_group_code_key" ON "rental_groups"("group_code");

-- CreateIndex
CREATE INDEX "rental_groups_branch_id_warehouse_id_idx" ON "rental_groups"("branch_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "rental_groups_status_idx" ON "rental_groups"("status");

-- CreateIndex
CREATE INDEX "rental_groups_group_name_idx" ON "rental_groups"("group_name");

-- CreateIndex
CREATE INDEX "import_batches_rental_group_id_idx" ON "import_batches"("rental_group_id");

-- CreateIndex
CREATE INDEX "import_batches_uploaded_by_user_id_idx" ON "import_batches"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "import_batches_status_idx" ON "import_batches"("status");

-- CreateIndex
CREATE INDEX "import_batch_errors_import_batch_id_row_number_idx" ON "import_batch_errors"("import_batch_id", "row_number");

-- CreateIndex
CREATE INDEX "renters_rental_group_id_full_name_idx" ON "renters"("rental_group_id", "full_name");

-- CreateIndex
CREATE INDEX "renters_suggested_size_id_idx" ON "renters"("suggested_size_id");

-- CreateIndex
CREATE INDEX "renters_confirmed_size_id_idx" ON "renters"("confirmed_size_id");

-- CreateIndex
CREATE UNIQUE INDEX "renters_rental_group_id_row_no_key" ON "renters"("rental_group_id", "row_no");

-- CreateIndex
CREATE INDEX "size_rule_sets_is_default_is_active_idx" ON "size_rule_sets"("is_default", "is_active");

-- CreateIndex
CREATE INDEX "size_rules_rule_set_id_priority_idx" ON "size_rules"("rule_set_id", "priority");

-- CreateIndex
CREATE INDEX "size_rules_product_category_id_idx" ON "size_rules"("product_category_id");

-- CreateIndex
CREATE INDEX "size_rules_size_id_idx" ON "size_rules"("size_id");

-- CreateIndex
CREATE INDEX "allocation_orders_rental_group_id_idx" ON "allocation_orders"("rental_group_id");

-- CreateIndex
CREATE INDEX "allocation_orders_warehouse_id_idx" ON "allocation_orders"("warehouse_id");

-- CreateIndex
CREATE INDEX "allocation_orders_status_idx" ON "allocation_orders"("status");

-- CreateIndex
CREATE INDEX "allocation_order_items_allocation_order_id_idx" ON "allocation_order_items"("allocation_order_id");

-- CreateIndex
CREATE INDEX "allocation_order_items_renter_id_idx" ON "allocation_order_items"("renter_id");

-- CreateIndex
CREATE INDEX "allocation_order_items_item_id_idx" ON "allocation_order_items"("item_id");

-- CreateIndex
CREATE INDEX "allocation_order_items_status_idx" ON "allocation_order_items"("status");

-- CreateIndex
CREATE INDEX "stock_alert_rules_warehouse_id_product_id_size_id_idx" ON "stock_alert_rules"("warehouse_id", "product_id", "size_id");

-- CreateIndex
CREATE INDEX "stock_alert_rules_is_active_idx" ON "stock_alert_rules"("is_active");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_code_key" ON "items"("item_code");

-- CreateIndex
CREATE INDEX "items_product_id_idx" ON "items"("product_id");

-- CreateIndex
CREATE INDEX "items_warehouse_id_idx" ON "items"("warehouse_id");

-- CreateIndex
CREATE INDEX "items_size_id_idx" ON "items"("size_id");

-- CreateIndex
CREATE INDEX "items_status_id_idx" ON "items"("status_id");

-- CreateIndex
CREATE INDEX "items_warehouse_id_status_id_idx" ON "items"("warehouse_id", "status_id");

-- CreateIndex
CREATE INDEX "items_product_id_size_id_status_id_idx" ON "items"("product_id", "size_id", "status_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "products_category_id_name_idx" ON "products"("category_id", "name");

-- CreateIndex
CREATE INDEX "sizes_sort_order_idx" ON "sizes"("sort_order");

-- CreateIndex
CREATE INDEX "warehouses_branch_id_name_idx" ON "warehouses"("branch_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_branch_id_code_key" ON "warehouses"("branch_id", "code");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_warehouses" ADD CONSTRAINT "user_warehouses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_warehouses" ADD CONSTRAINT "user_warehouses_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "item_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_status_histories" ADD CONSTRAINT "item_status_histories_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_status_histories" ADD CONSTRAINT "item_status_histories_from_status_id_fkey" FOREIGN KEY ("from_status_id") REFERENCES "item_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_status_histories" ADD CONSTRAINT "item_status_histories_to_status_id_fkey" FOREIGN KEY ("to_status_id") REFERENCES "item_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_status_histories" ADD CONSTRAINT "item_status_histories_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_groups" ADD CONSTRAINT "rental_groups_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_groups" ADD CONSTRAINT "rental_groups_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_groups" ADD CONSTRAINT "rental_groups_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_rental_group_id_fkey" FOREIGN KEY ("rental_group_id") REFERENCES "rental_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batch_errors" ADD CONSTRAINT "import_batch_errors_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_rental_group_id_fkey" FOREIGN KEY ("rental_group_id") REFERENCES "rental_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_suggested_size_id_fkey" FOREIGN KEY ("suggested_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_confirmed_size_id_fkey" FOREIGN KEY ("confirmed_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_rule_set_id_fkey" FOREIGN KEY ("rule_set_id") REFERENCES "size_rule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_orders" ADD CONSTRAINT "allocation_orders_rental_group_id_fkey" FOREIGN KEY ("rental_group_id") REFERENCES "rental_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_orders" ADD CONSTRAINT "allocation_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_orders" ADD CONSTRAINT "allocation_orders_allocated_by_user_id_fkey" FOREIGN KEY ("allocated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_order_items" ADD CONSTRAINT "allocation_order_items_allocation_order_id_fkey" FOREIGN KEY ("allocation_order_id") REFERENCES "allocation_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_order_items" ADD CONSTRAINT "allocation_order_items_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_order_items" ADD CONSTRAINT "allocation_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_order_items" ADD CONSTRAINT "allocation_order_items_assigned_size_id_fkey" FOREIGN KEY ("assigned_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert_rules" ADD CONSTRAINT "stock_alert_rules_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert_rules" ADD CONSTRAINT "stock_alert_rules_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alert_rules" ADD CONSTRAINT "stock_alert_rules_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
