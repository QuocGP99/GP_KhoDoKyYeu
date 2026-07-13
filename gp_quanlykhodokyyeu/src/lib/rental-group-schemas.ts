import { RentalGroupStatus } from "@prisma/client";
import { z } from "zod";

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

const requiredId = (message: string) =>
  z.string().trim().min(1, message).max(191);

const dateField = z.preprocess((value) => {
  if (value === "" || value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }
  return value;
}, z.date({ error: "Ngày không hợp lệ" }));

export function buildRentalGroupName(className: string, schoolName: string) {
  const normalizedClassName = className.trim().replace(/\s+/g, " ");
  const normalizedSchoolName = schoolName.trim().replace(/\s+/g, " ");

  return `Lớp ${normalizedClassName} - Trường ${normalizedSchoolName}`;
}

export const createRentalGroupSchema = z
  .object({
    branchId: requiredId("Vui lòng chọn chi nhánh"),
    warehouseId: requiredId("Vui lòng chọn kho phục vụ"),
    className: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên lớp/nhóm")
      .max(150, "Tên lớp/nhóm quá dài"),
    schoolName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên trường")
      .max(255, "Tên trường quá dài"),
    groupName: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).max(255).optional()
    ),
    groupCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1, "Mã nhóm không được để trống").max(100).optional()
    ),
    shootDate: dateField,
    status: z.nativeEnum(RentalGroupStatus).default(RentalGroupStatus.DRAFT),
    note: optionalText(1000),
    createdByUserId: requiredId("Thiếu thông tin người tạo nhóm thuê"),
  })
  .transform((data) => {
    const normalizedGroupName =
      data.groupName?.trim() ||
      buildRentalGroupName(data.className, data.schoolName);

    return {
      ...data,
      groupName: normalizedGroupName,
      className: data.className.trim().replace(/\s+/g, " "),
      schoolName: data.schoolName.trim().replace(/\s+/g, " "),
    };
  })
  .superRefine((data, ctx) => {
    const expectedName = buildRentalGroupName(data.className, data.schoolName);

    if (data.groupName.trim() !== expectedName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["groupName"],
        message: "Tên nhóm phải theo mẫu: Lớp ... - Trường ...",
      });
    }
  });

export const updateRentalGroupSchema = z
  .object({
    branchId: requiredId("Vui lòng chọn chi nhánh").optional(),
    warehouseId: requiredId("Vui lòng chọn kho phục vụ").optional(),
    className: z
      .preprocess(emptyToUndefined, z.string().trim().min(1).max(150).optional()),
    schoolName: z
      .preprocess(emptyToUndefined, z.string().trim().min(1).max(255).optional()),
    groupName: z
      .preprocess(emptyToUndefined, z.string().trim().min(1).max(255).optional()),
    groupCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1, "Mã nhóm không được để trống").max(100).optional()
    ),
    shootDate: z.preprocess((value) => {
      if (value === "" || value == null) return undefined;
      if (value instanceof Date) return value;
      if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date;
      }
      return value;
    }, z.date({ error: "Ngày không hợp lệ" }).optional()),
    status: z.nativeEnum(RentalGroupStatus).optional(),
    note: optionalText(1000),
  })
  .superRefine((data, ctx) => {
    const hasClassName = typeof data.className === "string" && data.className.trim().length > 0;
    const hasSchoolName =
      typeof data.schoolName === "string" && data.schoolName.trim().length > 0;

    if ((hasClassName && !hasSchoolName) || (!hasClassName && hasSchoolName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["className"],
        message: "Khi đổi tên nhóm, cần nhập đầy đủ cả lớp/nhóm và trường",
      });
    }

    if (data.groupName) {
      const normalized = data.groupName.trim().replace(/\s+/g, " ");
      const validPattern = /^Lớp\s.+\s-\sTrường\s.+$/i.test(normalized);

      if (!validPattern) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["groupName"],
          message: "Tên nhóm phải theo mẫu: Lớp ... - Trường ...",
        });
      }
    }
  });

export const rentalGroupQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  branchId: optionalId,
  warehouseId: optionalId,
  status: z.nativeEnum(RentalGroupStatus).optional(),
  shootDateFrom: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date;
    }
    return value;
  }, z.date().optional()),
  shootDateTo: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date;
    }
    return value;
  }, z.date().optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateRentalGroupInput = z.infer<typeof createRentalGroupSchema>;
export type UpdateRentalGroupInput = z.infer<typeof updateRentalGroupSchema>;
export type RentalGroupQueryInput = z.infer<typeof rentalGroupQuerySchema>;