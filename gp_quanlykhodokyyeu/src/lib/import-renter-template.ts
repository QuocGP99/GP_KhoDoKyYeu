import { Gender } from "@prisma/client";

export const RENTER_IMPORT_SHEET_NAME = "NguoiMac";

export const renterImportHeaders = [
  "STT",
  "Họ tên",
  "Giới tính",
  "Chiều cao",
  "Cân nặng",
] as const;

export type RenterImportHeader = (typeof renterImportHeaders)[number];

export type RenterImportRow = {
  STT: number | string | null;
  "Họ tên": string | null;
  "Giới tính": string | null;
  "Chiều cao": number | string | null;
  "Cân nặng": number | string | null;
};

export type NormalizedRenterImportRow = {
  rowNo: number | null;
  fullName: string;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
};

export const renterImportFieldMap: Record<RenterImportHeader, keyof NormalizedRenterImportRow> = {
  STT: "rowNo",
  "Họ tên": "fullName",
  "Giới tính": "gender",
  "Chiều cao": "heightCm",
  "Cân nặng": "weightKg",
};

export const renterImportRequiredHeaders: RenterImportHeader[] = [
  "STT",
  "Họ tên",
  "Giới tính",
  "Chiều cao",
  "Cân nặng",
];

export const renterImportHeaderAliases: Record<RenterImportHeader, string[]> = {
  STT: ["stt", "số thứ tự", "so thu tu", "row", "rowno"],
  "Họ tên": ["họ tên", "ho ten", "tên", "ten", "full name", "fullname"],
  "Giới tính": ["giới tính", "gioi tinh", "gender", "sex"],
  "Chiều cao": ["chiều cao", "chieu cao", "height", "height(cm)", "cao"],
  "Cân nặng": ["cân nặng", "can nang", "weight", "weight(kg)", "nặng"],
};

export const renterImportSampleRows: RenterImportRow[] = [
  {
    STT: 1,
    "Họ tên": "Nguyễn Văn An",
    "Giới tính": "Nam",
    "Chiều cao": "170",
    "Cân nặng": "58",
  },
  {
    STT: 2,
    "Họ tên": "Trần Thị Bình",
    "Giới tính": "Nữ",
    "Chiều cao": "158cm",
    "Cân nặng": "47.5kg",
  },
  {
    STT: 3,
    "Họ tên": "Lê Minh Châu",
    "Giới tính": "Khác",
    "Chiều cao": "1m65",
    "Cân nặng": "55",
  },
];

export const renterImportInstructions = [
  "Dòng đầu tiên phải là hàng tiêu đề đúng theo mẫu.",
  "STT phải là số nguyên dương và không trùng trong cùng file.",
  "Họ tên là bắt buộc.",
  "Giới tính chấp nhận: Nam, Nữ, Khác; hoặc MALE, FEMALE, OTHER.",
  "Chiều cao chấp nhận: 159, 159cm, 1m59, 1m6, 1m70.",
  "Cân nặng chấp nhận: 60, 60kg, 47.5, 47,5kg.",
  "Bỏ trống hoàn toàn các dòng không dùng; hệ thống sẽ bỏ qua dòng trống.",
] as const;

export const renterImportErrorMessages = {
  missingRequiredHeader: "Thiếu cột bắt buộc",
  invalidHeader: "Tên cột không hợp lệ",
  duplicateRowNo: "Dòng bị trùng STT trong file",
  invalidRowNo: "STT không hợp lệ",
  emptyFullName: "Họ tên không được để trống",
  invalidGender: "Giới tính không hợp lệ",
  invalidHeightCm: "Chiều cao không hợp lệ",
  invalidWeightKg: "Cân nặng không hợp lệ",
} as const;

export function getExpectedRenterImportHeaders(): RenterImportHeader[] {
  return [...renterImportHeaders];
}

export function normalizeImportText(value: unknown) {
  if (value == null) return "";
  return String(value).trim().replace(/\s+/g, " ");
}

export function normalizeImportHeader(value: unknown) {
  return normalizeImportText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isRenterImportHeader(value: unknown): value is RenterImportHeader {
  return renterImportHeaders.includes(value as RenterImportHeader);
}

export function resolveRenterImportHeader(value: unknown): RenterImportHeader | null {
  const normalized = normalizeImportHeader(value);

  for (const header of renterImportHeaders) {
    if (normalizeImportHeader(header) === normalized) {
      return header;
    }

    const aliases = renterImportHeaderAliases[header] ?? [];
    if (aliases.some((alias) => normalizeImportHeader(alias) === normalized)) {
      return header;
    }
  }

  return null;
}

export function parseImportInteger(value: unknown): number | null {
  const normalized = normalizeImportText(value);
  if (!normalized) return null;

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  if (!Number.isInteger(num)) return null;

  return num;
}

export function parseImportDecimal(value: unknown): number | null {
  const normalized = normalizeImportText(value).replace(",", ".");
  if (!normalized) return null;

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;

  return num;
}

export function parseImportGender(value: unknown): Gender | null {
  const normalized = normalizeImportHeader(value);

  if (!normalized) return null;

  if (["nam", "male", "m"].includes(normalized)) {
    return Gender.MALE;
  }

  if (["nu", "female", "f"].includes(normalized)) {
    return Gender.FEMALE;
  }

  if (["khac", "other", "o"].includes(normalized)) {
    return Gender.OTHER;
  }

  if (normalized === Gender.MALE.toLowerCase()) {
    return Gender.MALE;
  }

  if (normalized === Gender.FEMALE.toLowerCase()) {
    return Gender.FEMALE;
  }

  if (normalized === Gender.OTHER.toLowerCase()) {
    return Gender.OTHER;
  }

  return null;
}

export function parseImportHeightCm(value: unknown): number | null {
  const normalized = normalizeImportText(value).toLowerCase().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) return null;

  if (/^\d{3}$/.test(normalized)) {
    const height = Number(normalized);
    return height >= 100 && height <= 250 ? height : null;
  }

  if (/^\d{3}cm$/.test(normalized)) {
    const height = Number(normalized.slice(0, -2));
    return height >= 100 && height <= 250 ? height : null;
  }

  const meterMatch = normalized.match(/^(\d)m(\d{1,2})$/);
  if (meterMatch) {
    const meter = Number(meterMatch[1]);
    const cmRaw = meterMatch[2];
    const cm = cmRaw.length === 1 ? Number(cmRaw) * 10 : Number(cmRaw);
    const height = meter * 100 + cm;
    return height >= 100 && height <= 250 ? height : null;
  }

  return null;
}

export function parseImportWeightKg(value: unknown): number | null {
  const normalized = normalizeImportText(value).toLowerCase().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) return null;

  const raw = normalized.endsWith("kg") ? normalized.slice(0, -2) : normalized;

  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return null;
  }

  const weight = Number(raw);
  return Number.isFinite(weight) && weight > 0 && weight <= 300 ? weight : null;
}

export function normalizeRenterImportRow(
  row: Partial<Record<RenterImportHeader, unknown>>
): NormalizedRenterImportRow {
  return {
    rowNo: parseImportInteger(row["STT"]),
    fullName: normalizeImportText(row["Họ tên"]),
    gender: parseImportGender(row["Giới tính"]),
    heightCm: parseImportHeightCm(row["Chiều cao"]),
    weightKg: parseImportWeightKg(row["Cân nặng"]),
  };
}

export function isEmptyRenterImportRow(row: Partial<Record<RenterImportHeader, unknown>>) {
  return renterImportHeaders.every((header) => {
    const value = row[header];
    return normalizeImportText(value) === "";
  });
}

export function getRenterImportTemplateMatrix() {
  return [
    Array.from(renterImportHeaders),
    ...renterImportSampleRows.map((row) =>
      renterImportHeaders.map((header) => row[header] ?? "")
    ),
  ];
}