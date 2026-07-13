import { z } from "zod";

export const createProductCategorySchema = z.object({
  code: z.string().trim().min(1, "Mã danh mục là bắt buộc"),
  name: z.string().trim().min(1, "Tên danh mục là bắt buộc"),
  description: z.string().trim().optional().default(""),
  hasSize: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

export const updateProductCategorySchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  hasSize: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductCategoryStatusSchema = z.object({
  isActive: z.boolean(),
});