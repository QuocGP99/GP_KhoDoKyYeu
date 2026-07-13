import { z } from "zod";

export const createWarehouseSchema = z.object({
    branchId: z.string().min(1, "Chi nhánh là bắt buộc"),
    code: z.string().min(1, "Mã kho là bắt buộc"),
    name: z.string().min(1, "Tên kho là bắt buộc"),
    description: z.string().trim().optional().default(""),
    isActive: z.boolean().optional().default(true),
})

export const updateWarehouseSchema = z.object({
    branchId: z.string().trim().min(1).optional(),
    code: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
})

export const updateWarehouseStatusSchema = z.object({
    isActive: z.boolean(),
});