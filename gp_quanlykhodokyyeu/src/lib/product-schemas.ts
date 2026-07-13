import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().trim().min(1, "Danh mục là bắt buộc"),
  code: z.string().trim().min(1, "Mã sản phẩm là bắt buộc"),
  name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc"),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]).nullable().optional(),
  description: z.string().trim().optional().default(""),
  imageUrl: z.string().trim().optional().default(""),
  isActive: z.boolean().optional().default(true),
  sizeIds: z.array(z.string()).optional().default([]),
});

export const updateProductSchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]).nullable().optional(),
  description: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  sizeIds: z.array(z.string()).optional(),
});

export const updateProductStatusSchema = z.object({
  isActive: z.boolean(),
});