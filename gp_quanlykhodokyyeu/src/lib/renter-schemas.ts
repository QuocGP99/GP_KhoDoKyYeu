import { Gender } from "@prisma/client";
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

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const requiredId = (message: string) =>
  z.string().trim().min(1, message).max(191);

const optionalId = z.preprocess(
  emptyToNull,
  z.string().trim().min(1).max(191).nullable().optional()
);

const optionalText = (max = 255) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

const positiveIntField = (label: string, min = 1, max = 300) =>
  z.coerce
    .number()
    .int(`${label} phải là số nguyên`)
    .min(min, `${label} phải lớn hơn hoặc bằng ${min}`)
    .max(max, `${label} phải nhỏ hơn hoặc bằng ${max}`);

const decimalWeightField = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number") return value;
    return value.trim();
  })
  .refine((value) => value !== "", {
    message: "Vui lòng nhập cân nặng",
  })
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), {
    message: "Cân nặng không hợp lệ",
  })
  .refine((value) => value > 0, {
    message: "Cân nặng phải lớn hơn 0",
  })
  .refine((value) => value <= 999.99, {
    message: "Cân nặng phải nhỏ hơn hoặc bằng 999.99",
  });

export const createRenterSchema = z
  .object({
    rentalGroupId: requiredId("Vui lòng chọn nhóm thuê"),
    studentCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(100, "Mã học sinh quá dài").optional()
    ),
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ tên")
      .max(255, "Họ tên quá dài"),
    gender: z.preprocess(
      emptyToUndefined,
      z.nativeEnum(Gender).optional()
    ),
    heightCm: positiveIntField("Chiều cao", 50, 250),
    weightKg: decimalWeightField,
    confirmedSizeId: optionalId,
    note: optionalText(1000),
  })
  .transform((data) => ({
    ...data,
    fullName: normalizeText(data.fullName),
    studentCode: data.studentCode ? normalizeText(data.studentCode) : undefined,
  }));

export const updateRenterSchema = z
  .object({
    rentalGroupId: requiredId("Vui lòng chọn nhóm thuê").optional(),
    studentCode: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(100, "Mã học sinh quá dài").optional()
    ),
    fullName: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(1, "Họ tên không được để trống")
        .max(255, "Họ tên quá dài")
        .optional()
    ),
    gender: z.preprocess(
      emptyToUndefined,
      z.nativeEnum(Gender).optional()
    ),
    heightCm: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      positiveIntField("Chiều cao", 50, 250).optional()
    ),
    weightKg: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      decimalWeightField.optional()
    ),
    confirmedSizeId: optionalId,
    note: optionalText(1000),
  })
  .transform((data) => ({
    ...data,
    fullName: data.fullName ? normalizeText(data.fullName) : data.fullName,
    studentCode: data.studentCode ? normalizeText(data.studentCode) : data.studentCode,
  }));

export const renterQuerySchema = z.object({
  q: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).optional()
  ),
  rentalGroupId: optionalId,
  gender: z.preprocess(
    emptyToUndefined,
    z.nativeEnum(Gender).optional()
  ),
  suggestedSizeId: optionalId,
  confirmedSizeId: optionalId,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateRenterInput = z.infer<typeof createRenterSchema>;
export type UpdateRenterInput = z.infer<typeof updateRenterSchema>;
export type RenterQueryInput = z.infer<typeof renterQuerySchema>;