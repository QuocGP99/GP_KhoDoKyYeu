import { z } from "zod";
import { ItemCondition } from "@prisma/client";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalId = z.preprocess(
  emptyToNull,
  z.string().trim().min(1).max(191).nullable().optional()
);

const optionalText = (max = 255) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }
  return value;
}, z.date().nullable().optional());

export const itemCodeModeSchema = z.enum(["AUTO", "MANUAL"]);

export const createItemSchema = z
  .object({
    itemCodeMode: itemCodeModeSchema.default("AUTO"),
    itemCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1, "Mã item không được để trống").max(100).optional()
    ),
    productId: z.string().trim().min(1, "Vui lòng chọn sản phẩm").max(191),
    warehouseId: z.string().trim().min(1, "Vui lòng chọn kho").max(191),
    statusId: z.string().trim().min(1, "Vui lòng chọn trạng thái").max(191),
    sizeId: optionalId,
    barcode: optionalText(100),
    condition: z.nativeEnum(ItemCondition).default(ItemCondition.GOOD),
    purchaseDate: optionalDate,
    note: optionalText(1000),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.itemCodeMode === "MANUAL" && !data.itemCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["itemCode"],
        message: "Vui lòng nhập item_code khi chọn chế độ thủ công",
      });
    }

    if (data.itemCodeMode === "AUTO" && data.itemCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["itemCode"],
        message: "Không cần nhập item_code khi chọn chế độ tự sinh mã",
      });
    }
  });

export const updateItemSchema = z
  .object({
    itemCodeMode: itemCodeModeSchema.optional(),
    itemCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1, "Mã item không được để trống").max(100).optional()
    ),
    productId: z.string().trim().min(1).max(191).optional(),
    warehouseId: z.string().trim().min(1).max(191).optional(),
    statusId: z.string().trim().min(1).max(191).optional(),
    sizeId: optionalId,
    barcode: optionalText(100),
    condition: z.nativeEnum(ItemCondition).optional(),
    purchaseDate: optionalDate,
    note: optionalText(1000),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.itemCodeMode === "MANUAL" && !data.itemCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["itemCode"],
        message: "Vui lòng nhập item_code khi chọn chế độ thủ công",
      });
    }

    if (data.itemCodeMode === "AUTO" && data.itemCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["itemCode"],
        message: "Không cần nhập item_code khi chọn chế độ tự sinh mã",
      });
    }
  });

export const itemQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  categoryId: optionalId,
  productId: optionalId,
  warehouseId: optionalId,
  sizeId: optionalId,
  statusId: optionalId,
  barcode: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  condition: z.nativeEnum(ItemCondition).optional(),
  isActive: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemQueryInput = z.infer<typeof itemQuerySchema>;
export type ItemCodeMode = z.infer<typeof itemCodeModeSchema>;