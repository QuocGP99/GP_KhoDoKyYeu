import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import {
  buildRenterImportRowsFromSheet,
  REQUIRED_RENTER_HEADERS,
} from "@/lib/import-renter-validators";

export const dynamic = "force-dynamic";

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function isSupportedFile(fileName: string) {
  const ext = getFileExtension(fileName);
  return ["xlsx", "xls", "csv"].includes(ext);
}

function normalizeHeaderKey(value: unknown) {
  if (value == null) return "";

  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function hasRequiredHeaders(rawHeaders: unknown[]) {
  const normalizedHeaders = rawHeaders.map(normalizeHeaderKey);

  const requiredHeaders = REQUIRED_RENTER_HEADERS.map((header) =>
    normalizeHeaderKey(header)
  );

  return requiredHeaders.every((header) => normalizedHeaders.includes(header));
}

function findBestSheet(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });

    if (!sheetRows.length) continue;

    const [rawHeaders = []] = sheetRows;

    if (hasRequiredHeaders(rawHeaders)) {
      return {
        sheetName,
        sheetRows,
      };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rentalGroupId = String(formData.get("rentalGroupId") ?? "").trim();
    const file = formData.get("file");

    if (!rentalGroupId) {
      return NextResponse.json(
        { error: "Thiếu rentalGroupId" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Thiếu file import" },
        { status: 400 }
      );
    }

    if (!isSupportedFile(file.name)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ file .xlsx, .xls hoặc .csv" },
        { status: 400 }
      );
    }

    const rentalGroup = await prisma.rentalGroup.findUnique({
      where: { id: rentalGroupId },
      select: {
        id: true,
        groupName: true,
        groupCode: true,
        schoolName: true,
        status: true,
      },
    });

    if (!rentalGroup) {
      return NextResponse.json(
        { error: "Nhóm thuê không tồn tại" },
        { status: 404 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const matchedSheet = findBestSheet(workbook);

    if (!matchedSheet) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy sheet có header hợp lệ. File phải có các cột: STT, Họ tên, Giới tính, Chiều cao, Cân nặng.",
        },
        { status: 400 }
      );
    }

    const [rawHeaders = [], ...rawRows] = matchedSheet.sheetRows;

    const result = buildRenterImportRowsFromSheet({
      rawHeaders,
      rawRows,
    });

    return NextResponse.json({
      ok: true,
      rentalGroup,
      file: {
        name: file.name,
        size: file.size,
        type: file.type || null,
        sheetName: matchedSheet.sheetName,
      },
      summary: {
        totalRows: result.rows.totalRows,
        successRows: result.rows.validRows.length,
        errorRows: new Set(result.rows.errors.map((item) => item.rowNumber)).size,
        headerErrorCount: result.headers.errors.length,
        totalErrorCount: result.allErrors.length,
      },
      headers: {
        normalizedHeaders: result.headers.normalizedHeaders,
        errors: result.headers.errors,
      },
      rows: {
        validRows: result.rows.validRows,
        errors: result.rows.errors,
      },
    });
  } catch (error) {
    console.error("POST /api/imports/renters/preview error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể preview file import",
      },
      { status: 500 }
    );
  }
}