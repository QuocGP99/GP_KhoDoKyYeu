import { z } from "zod";

export const createSizeSchema = z.object({
  code: z.string().trim().min(1, "Mã size là bắt buộc"),
  name: z.string().trim().min(1, "Tên size là bắt buộc"),
  sortOrder: z.coerce.number().int("Thứ tự phải là số nguyên").min(0, "Thứ tự phải >= 0"),
  isActive: z.boolean().optional().default(true),
});

export const updateSizeSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  sortOrder: z.coerce.number().int("Thứ tự phải là số nguyên").min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateSizeStatusSchema = z.object({
  isActive: z.boolean(),
});