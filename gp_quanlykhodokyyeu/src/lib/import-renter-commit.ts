import {
  ImportBatchStatus,
  Prisma,
  RentalGroupStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ImportRenterRowError } from "@/lib/import-renter-validators";
import { buildRenterImportRowsFromSheet } from "@/lib/import-renter-validators";

export type CommitRenterImportInput = {
  rentalGroupId: string;
  uploadedByUserId: string;
  fileName: string;
  rawHeaders: unknown[];
  rawRows: unknown[][];
};

export type CommitRenterImportResult = {
  ok: true;
  importBatch: {
    id: string;
    fileName: string;
    createdAt: Date;
    finishedAt: Date | null;
    status: ImportBatchStatus;
  };
  summary: {
    totalRows: number;
    createdRows: number;
    updatedRows: number;
    skippedRows: number;
    successRows: number;
    errorRows: number;
    totalErrorCount: number;
  };
  errors: ImportRenterRowError[];
  affectedRentalGroups: {
    id: string;
    groupName: string;
    schoolName: string | null;
    created: boolean;
  }[];
};

function toRawValue(value: unknown) {
  if (value == null) return null;
  const str = String(value).trim();
  return str || null;
}

function normalizeText(value: unknown) {
  if (value == null) return "";
  return String(value).trim().replace(/\s+/g, " ");
}

function stripFileExtension(fileName: string) {
  return fileName.replace(/\.(xlsx|xls|csv)$/i, "").trim();
}

function normalizeGroupKey(groupName: unknown, schoolName: unknown) {
  const normalizedGroupName = normalizeText(groupName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const normalizedSchoolName = normalizeText(schoolName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return `${normalizedGroupName}||${normalizedSchoolName}`;
}

function parseRentalGroupFromFileName(fileName: string) {
  const baseName = stripFileExtension(fileName);

  const separators = [" - ", " – ", " — ", "_", "|"];
  for (const separator of separators) {
    if (!baseName.includes(separator)) continue;

    const parts = baseName
      .split(separator)
      .map((part) => normalizeText(part))
      .filter(Boolean);

    if (parts.length < 2) continue;

    const [groupName, ...schoolParts] = parts;
    const schoolName = normalizeText(schoolParts.join(" "));

    if (groupName && schoolName) {
      return { groupName, schoolName };
    }
  }

  return null;
}

type ImportNormalizedRow = {
  rowNo: number | null;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  heightCm: number | null;
  weightKg: number | null;
};

export async function commitRenterImport(
  input: CommitRenterImportInput
): Promise<CommitRenterImportResult> {
  const { rentalGroupId, uploadedByUserId, fileName, rawHeaders, rawRows } =
    input;

  const [baseRentalGroup, uploadedByUser] = await Promise.all([
    prisma.rentalGroup.findUnique({
      where: { id: rentalGroupId },
      select: {
        id: true,
        branchId: true,
        warehouseId: true,
        createdByUserId: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: uploadedByUserId },
      select: {
        id: true,
        isActive: true,
      },
    }),
  ]);

  if (!baseRentalGroup) {
    throw new Error("Nhóm thuê gốc không tồn tại");
  }

  if (!uploadedByUser || !uploadedByUser.isActive) {
    throw new Error("Người tải file không hợp lệ hoặc đã bị khóa");
  }

  const parsedGroup = parseRentalGroupFromFileName(fileName);

  if (!parsedGroup) {
    throw new Error(
      'Không thể đọc Lớp và Trường từ tên file. Hãy đặt tên theo một trong các dạng: "12A1 - THPT Ong Ich Khiem.xlsx", "12A1_THPT Ong Ich Khiem.xlsx", hoặc "12A1 | THPT Ong Ich Khiem.xlsx".'
    );
  }

  const previewResult = buildRenterImportRowsFromSheet({
    rawHeaders,
    rawRows,
  });

  const collectedErrors: ImportRenterRowError[] = [...previewResult.allErrors];

  let createdRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;

  const affectedRentalGroupsMap = new Map<
    string,
    { id: string; groupName: string; schoolName: string | null; created: boolean }
  >();

  const finalBatch = await prisma.$transaction(async (tx) => {
    const groupKey = normalizeGroupKey(
      parsedGroup.groupName,
      parsedGroup.schoolName
    );

    const existingGroup = await tx.rentalGroup.findFirst({
      where: {
        branchId: baseRentalGroup.branchId,
        warehouseId: baseRentalGroup.warehouseId,
        groupName: parsedGroup.groupName,
        schoolName: parsedGroup.schoolName,
      },
      select: {
        id: true,
        groupName: true,
        schoolName: true,
      },
    });

    const targetRentalGroup = existingGroup
      ? {
          id: existingGroup.id,
          groupName: existingGroup.groupName,
          schoolName: existingGroup.schoolName,
          created: false,
        }
      : {
          ...(await tx.rentalGroup.create({
            data: {
              branchId: baseRentalGroup.branchId,
              warehouseId: baseRentalGroup.warehouseId,
              createdByUserId: baseRentalGroup.createdByUserId,
              groupName: parsedGroup.groupName,
              schoolName: parsedGroup.schoolName,
              status: RentalGroupStatus.DRAFT,
            },
            select: {
              id: true,
              groupName: true,
              schoolName: true,
            },
          })),
          created: true,
        };

    affectedRentalGroupsMap.set(groupKey, targetRentalGroup);

    const importBatch = await tx.importBatch.create({
      data: {
        rentalGroupId: targetRentalGroup.id,
        uploadedByUserId,
        fileName,
        totalRows: previewResult.rows.totalRows,
        successRows: 0,
        errorRows: 0,
        status: ImportBatchStatus.PROCESSING,
      },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        finishedAt: true,
        status: true,
      },
    });

    for (const item of previewResult.rows.validRows) {
      const { normalizedRow, rawRow, rowNumber } = item;
      const row = normalizedRow as ImportNormalizedRow;

      if (row.rowNo == null) {
        collectedErrors.push({
          rowNumber,
          fieldName: "STT",
          errorMessage: "Không thể import vì thiếu STT hợp lệ",
          rawValue: toRawValue(rawRow["STT"]),
        });
        skippedRows += 1;
        continue;
      }

      const existingByRowNo = await tx.renter.findUnique({
        where: {
          rentalGroupId_rowNo: {
            rentalGroupId: targetRentalGroup.id,
            rowNo: row.rowNo,
          },
        },
        select: {
          id: true,
          fullName: true,
          rowNo: true,
        },
      });

      if (!existingByRowNo) {
        await tx.renter.create({
          data: {
            rentalGroupId: targetRentalGroup.id,
            importBatchId: importBatch.id,
            rowNo: row.rowNo,
            fullName: row.fullName,
            gender: row.gender,
            heightCm: row.heightCm!,
            weightKg: new Prisma.Decimal(row.weightKg!),
          },
        });

        createdRows += 1;
        continue;
      }

      if (existingByRowNo.fullName.trim() !== row.fullName.trim()) {
        collectedErrors.push({
          rowNumber,
          fieldName: "Họ tên",
          errorMessage:
            "Không overwrite vì trùng lớp + trường + STT nhưng họ tên không khớp",
          rawValue: row.fullName,
        });
        skippedRows += 1;
        continue;
      }

      await tx.renter.update({
        where: { id: existingByRowNo.id },
        data: {
          importBatchId: importBatch.id,
          fullName: row.fullName,
          gender: row.gender,
          heightCm: row.heightCm!,
          weightKg: new Prisma.Decimal(row.weightKg!),
        },
      });

      updatedRows += 1;
    }

    if (collectedErrors.length > 0) {
      await tx.importBatchError.createMany({
        data: collectedErrors.map((error) => ({
          importBatchId: importBatch.id,
          rowNumber: error.rowNumber,
          fieldName: error.fieldName,
          errorMessage: error.errorMessage,
          rawValue: error.rawValue,
        })),
      });
    }

    const updatedImportBatch = await tx.importBatch.update({
      where: { id: importBatch.id },
      data: {
        successRows: createdRows + updatedRows,
        errorRows: new Set(collectedErrors.map((item) => item.rowNumber)).size,
        status:
          collectedErrors.length > 0
            ? ImportBatchStatus.FAILED
            : ImportBatchStatus.COMPLETED,
        finishedAt: new Date(),
      },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        finishedAt: true,
        status: true,
      },
    });

    return updatedImportBatch;
  });

  return {
    ok: true,
    importBatch: finalBatch,
    summary: {
      totalRows: previewResult.rows.totalRows,
      createdRows,
      updatedRows,
      skippedRows,
      successRows: createdRows + updatedRows,
      errorRows: new Set(collectedErrors.map((item) => item.rowNumber)).size,
      totalErrorCount: collectedErrors.length,
    },
    errors: collectedErrors,
    affectedRentalGroups: Array.from(affectedRentalGroupsMap.values()),
  };
}