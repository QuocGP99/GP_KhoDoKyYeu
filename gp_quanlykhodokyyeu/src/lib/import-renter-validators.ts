import { Gender } from "@prisma/client";

export const REQUIRED_RENTER_HEADERS = [
  "STT",
  "Họ tên",
  "Giới tính",
  "Chiều cao",
  "Cân nặng",
] as const;

export type RequiredRenterHeader = (typeof REQUIRED_RENTER_HEADERS)[number];

export type ImportRenterRowError = {
  rowNumber: number;
  fieldName: string | null;
  errorMessage: string;
  rawValue: string | null;
};

export type NormalizedRenterRow = {
  rowNo: number | null;
  fullName: string;
  gender: Gender | null;
  heightCm: number | null;
  weightKg: number | null;
};

export type ValidRenterImportRow = {
  rowNumber: number;
  rawRow: Record<string, unknown>;
  normalizedRow: NormalizedRenterRow;
};

export type BuildRenterImportRowsResult = {
  headers: {
    normalizedHeaders: (string | null)[];
    errors: ImportRenterRowError[];
  };
  rows: {
    totalRows: number;
    validRows: ValidRenterImportRow[];
    errors: ImportRenterRowError[];
  };
  allErrors: ImportRenterRowError[];
};

function toRawValue(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeHeader(value: unknown): string | null {
  if (value == null) return null;

  const text = String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!text) return null;

  if (text === "stt") return "STT";
  if (text === "ho ten" || text === "ten") return "Họ tên";
  if (text === "gioi tinh") return "Giới tính";
  if (text === "chieu cao") return "Chiều cao";
  if (text === "can nang") return "Cân nặng";

  return null;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function parseRowNo(value: unknown): number | null {
  if (value == null) return null;

  const raw = String(value).trim();
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return null;

  const rowNo = Number(raw);
  if (!Number.isInteger(rowNo) || rowNo <= 0) return null;

  return rowNo;
}

function normalizeGender(value: unknown): Gender | null {
  if (value == null) return null;

  const raw = String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!raw) return null;

  if (["nam", "male", "m"].includes(raw)) return Gender.MALE;
  if (["nu", "nữ", "female", "f"].includes(raw)) return Gender.FEMALE;
  if (["khac", "khác", "other", "o"].includes(raw)) return Gender.OTHER;

  return null;
}

function parseHeightCm(value: unknown): number | null {
  if (value == null) return null;

  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  const compact = raw.replace(/\s+/g, "").replace(",", ".");

  if (/^\d{3}$/.test(compact)) {
    const height = Number(compact);
    return height >= 100 && height <= 250 ? height : null;
  }

  if (/^\d{3}cm$/.test(compact)) {
    const height = Number(compact.slice(0, -2));
    return height >= 100 && height <= 250 ? height : null;
  }

  const meterMatch = compact.match(/^(\d)m(\d{1,2})$/);
  if (meterMatch) {
    const meter = Number(meterMatch[1]);
    const cmRaw = meterMatch[2];
    const cm = cmRaw.length === 1 ? Number(cmRaw) * 10 : Number(cmRaw);
    const height = meter * 100 + cm;
    return height >= 100 && height <= 250 ? height : null;
  }

  return null;
}

function parseWeightKg(value: unknown): number | null {
  if (value == null) return null;

  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  const compact = raw.replace(/\s+/g, "").replace(",", ".");

  const normalized = compact.endsWith("kg")
    ? compact.slice(0, -2)
    : compact;

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const weight = Number(normalized);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 300) {
    return null;
  }

  return weight;
}

function mapRawRow(
  normalizedHeaders: (string | null)[],
  rowValues: unknown[]
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  normalizedHeaders.forEach((header, index) => {
    if (!header) return;
    row[header] = rowValues[index] ?? "";
  });

  return row;
}

function validateHeaders(rawHeaders: unknown[]): {
  normalizedHeaders: (string | null)[];
  errors: ImportRenterRowError[];
} {
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const errors: ImportRenterRowError[] = [];

  for (const requiredHeader of REQUIRED_RENTER_HEADERS) {
    if (!normalizedHeaders.includes(requiredHeader)) {
      errors.push({
        rowNumber: 1,
        fieldName: requiredHeader,
        errorMessage: `Thiếu cột bắt buộc: ${requiredHeader}`,
        rawValue: null,
      });
    }
  }

  return {
    normalizedHeaders,
    errors,
  };
}

function isCompletelyEmptyRow(rowValues: unknown[]) {
  return rowValues.every((value) => {
    if (value == null) return true;
    return String(value).trim() === "";
  });
}

function validateRow(rowNumber: number, rawRow: Record<string, unknown>) {
  const errors: ImportRenterRowError[] = [];

  const rowNo = parseRowNo(rawRow["STT"]);
  const fullName = normalizeText(rawRow["Họ tên"]);
  const gender = normalizeGender(rawRow["Giới tính"]);
  const heightCm = parseHeightCm(rawRow["Chiều cao"]);
  const weightKg = parseWeightKg(rawRow["Cân nặng"]);

  if (rowNo == null) {
    errors.push({
      rowNumber,
      fieldName: "STT",
      errorMessage: "STT không hợp lệ",
      rawValue: toRawValue(rawRow["STT"]),
    });
  }

  if (!fullName) {
    errors.push({
      rowNumber,
      fieldName: "Họ tên",
      errorMessage: "Họ tên không được để trống",
      rawValue: toRawValue(rawRow["Họ tên"]),
    });
  }

  if (gender == null) {
    errors.push({
      rowNumber,
      fieldName: "Giới tính",
      errorMessage: "Giới tính không hợp lệ",
      rawValue: toRawValue(rawRow["Giới tính"]),
    });
  }

  if (heightCm == null) {
    errors.push({
      rowNumber,
      fieldName: "Chiều cao",
      errorMessage: "Chiều cao không hợp lệ",
      rawValue: toRawValue(rawRow["Chiều cao"]),
    });
  }

  if (weightKg == null) {
    errors.push({
      rowNumber,
      fieldName: "Cân nặng",
      errorMessage: "Cân nặng không hợp lệ",
      rawValue: toRawValue(rawRow["Cân nặng"]),
    });
  }

  return {
    errors,
    normalizedRow: {
      rowNo,
      fullName,
      gender,
      heightCm,
      weightKg,
    } satisfies NormalizedRenterRow,
  };
}

export function buildRenterImportRowsFromSheet(input: {
  rawHeaders: unknown[];
  rawRows: unknown[][];
}): BuildRenterImportRowsResult {
  const { rawHeaders, rawRows } = input;

  const headerResult = validateHeaders(rawHeaders);
  const rowErrors: ImportRenterRowError[] = [];
  const validRows: ValidRenterImportRow[] = [];

  rawRows.forEach((rowValues, index) => {
    const rowNumber = index + 2;

    if (isCompletelyEmptyRow(rowValues)) {
      return;
    }

    const rawRow = mapRawRow(headerResult.normalizedHeaders, rowValues);
    const rowResult = validateRow(rowNumber, rawRow);

    if (rowResult.errors.length > 0) {
      rowErrors.push(...rowResult.errors);
      return;
    }

    validRows.push({
      rowNumber,
      rawRow,
      normalizedRow: rowResult.normalizedRow,
    });
  });

  return {
    headers: {
      normalizedHeaders: headerResult.normalizedHeaders,
      errors: headerResult.errors,
    },
    rows: {
      totalRows: rawRows.filter((row) => !isCompletelyEmptyRow(row)).length,
      validRows,
      errors: rowErrors,
    },
    allErrors: [...headerResult.errors, ...rowErrors],
  };
}