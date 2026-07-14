-- AlterTable
ALTER TABLE "size_rules" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "product_id" TEXT,
ALTER COLUMN "min_height_cm" DROP NOT NULL,
ALTER COLUMN "max_height_cm" DROP NOT NULL,
ALTER COLUMN "min_weight_kg" DROP NOT NULL,
ALTER COLUMN "max_weight_kg" DROP NOT NULL;

-- CreateTable
CREATE TABLE "rental_group_products" (
    "id" TEXT NOT NULL,
    "rental_group_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity_plan" INTEGER,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_group_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renter_product_sizes" (
    "id" TEXT NOT NULL,
    "renter_id" TEXT NOT NULL,
    "rental_group_product_id" TEXT NOT NULL,
    "suggested_size_id" TEXT,
    "confirmed_size_id" TEXT,
    "matched_rule_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renter_product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rental_group_products_product_id_idx" ON "rental_group_products"("product_id");

-- CreateIndex
CREATE INDEX "rental_group_products_rental_group_id_sort_order_idx" ON "rental_group_products"("rental_group_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "rental_group_products_rental_group_id_product_id_key" ON "rental_group_products"("rental_group_id", "product_id");

-- CreateIndex
CREATE INDEX "renter_product_sizes_rental_group_product_id_idx" ON "renter_product_sizes"("rental_group_product_id");

-- CreateIndex
CREATE INDEX "renter_product_sizes_suggested_size_id_idx" ON "renter_product_sizes"("suggested_size_id");

-- CreateIndex
CREATE INDEX "renter_product_sizes_confirmed_size_id_idx" ON "renter_product_sizes"("confirmed_size_id");

-- CreateIndex
CREATE INDEX "renter_product_sizes_matched_rule_id_idx" ON "renter_product_sizes"("matched_rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "renter_product_sizes_renter_id_rental_group_product_id_key" ON "renter_product_sizes"("renter_id", "rental_group_product_id");

-- CreateIndex
CREATE INDEX "size_rules_product_id_idx" ON "size_rules"("product_id");

-- CreateIndex
CREATE INDEX "size_rules_rule_set_id_product_id_priority_idx" ON "size_rules"("rule_set_id", "product_id", "priority");

-- CreateIndex
CREATE INDEX "size_rules_product_id_gender_idx" ON "size_rules"("product_id", "gender");

-- AddForeignKey
ALTER TABLE "rental_group_products" ADD CONSTRAINT "rental_group_products_rental_group_id_fkey" FOREIGN KEY ("rental_group_id") REFERENCES "rental_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_group_products" ADD CONSTRAINT "rental_group_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renter_product_sizes" ADD CONSTRAINT "renter_product_sizes_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renter_product_sizes" ADD CONSTRAINT "renter_product_sizes_rental_group_product_id_fkey" FOREIGN KEY ("rental_group_product_id") REFERENCES "rental_group_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renter_product_sizes" ADD CONSTRAINT "renter_product_sizes_suggested_size_id_fkey" FOREIGN KEY ("suggested_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renter_product_sizes" ADD CONSTRAINT "renter_product_sizes_confirmed_size_id_fkey" FOREIGN KEY ("confirmed_size_id") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renter_product_sizes" ADD CONSTRAINT "renter_product_sizes_matched_rule_id_fkey" FOREIGN KEY ("matched_rule_id") REFERENCES "size_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "size_rules" ADD CONSTRAINT "size_rules_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
