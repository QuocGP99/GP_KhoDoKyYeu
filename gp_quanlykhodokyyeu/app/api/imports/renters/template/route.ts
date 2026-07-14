import { NextRequest, NextResponse } from "next/server";
import {
  RENTER_IMPORT_SHEET_NAME,
  getRenterImportTemplateMatrix,
  renterImportInstructions,
  renterImportSampleRows,
  getExpectedRenterImportHeaders,
} from "@/lib/import-renter-template";

export const dynamic = "force-dynamic";

function escapeCsvValue(value: unknown) {
  const stringValue = value == null ? "" : String(value);
  const escaped = stringValue.replace(/"/g, '""');

  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

function buildCsvContent(matrix: unknown[][]) {
  return matrix
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") ?? "csv").toLowerCase();

    const headers = getExpectedRenterImportHeaders();
    const matrix = getRenterImportTemplateMatrix();

    if (format === "json") {
      return NextResponse.json({
        sheetName: RENTER_IMPORT_SHEET_NAME,
        fileName: "mau-import-nguoi-mac.csv",
        headers,
        sampleRows: renterImportSampleRows,
        instructions: renterImportInstructions,
        matrix,
      });
    }

    const csvContent = buildCsvContent(matrix);

    return new NextResponse(`\ufeff${csvContent}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="mau-import-nguoi-mac.csv"',
        "Cache-Control": "no-store",
        "X-Template-Sheet-Name": RENTER_IMPORT_SHEET_NAME,
      },
    });
  } catch (error) {
    console.error("GET /api/imports/renters/template error:", error);

    return NextResponse.json(
      { error: "Không thể tạo file mẫu import người mặc" },
      { status: 500 }
    );
  }
}