/*
  Warnings:

  - You are about to drop the column `productCategoryId` on the `size_rules` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "size_rules" DROP CONSTRAINT "size_rules_productCategoryId_fkey";

-- AlterTable
ALTER TABLE "size_rules" DROP COLUMN "productCategoryId";
