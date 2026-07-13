import { z } from "zod";

export const createBranchSchema = z.object({
  code: z.string().trim().min(1, "Mã chi nhánh là bắt buộc"),
  name: z.string().trim().min(1, "Tên chi nhánh là bắt buộc"),
  address: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const updateBranchSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateBranchStatusSchema = z.object({
  isActive: z.boolean(),
});