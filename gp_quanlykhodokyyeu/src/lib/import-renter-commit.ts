import { ImportBatchStatus, Prisma } from "@prisma/client";
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
};

function toRawValue(value: unknown) {
  if (value == null) return null;
  const str = String(value).trim();
  return str || null;
}

export async function commitRenterImport(
  input: CommitRenterImportInput
): Promise<CommitRenterImportResult> {
  const { rentalGroupId, uploadedByUserId, fileName, rawHeaders, rawRows } = input;

  const [rentalGroup, uploadedByUser] = await Promise.all([
    prisma.rentalGroup.findUnique({
      where: { id: rentalGroupId },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: uploadedByUserId },
      select: {
        id: true,
        isActive: true,
      },
    }),
  ]);

  if (!rentalGroup) {
    throw new Error("Nhóm thuê không tồn tại");
  }

  if (!uploadedByUser || !uploadedByUser.isActive) {
    throw new Error("Người tải file không hợp lệ hoặc đã bị khóa");
  }

  const previewResult = buildRenterImportRowsFromSheet({
    rawHeaders,
    rawRows,
  });

  const collectedErrors: ImportRenterRowError[] = [...previewResult.allErrors];

  const importBatch = await prisma.importBatch.create({
    data: {
      rentalGroupId,
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

  let createdRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;

  const finalBatch = await prisma.$transaction(async (tx) => {
    for (const item of previewResult.rows.validRows) {
      const { normalizedRow, rawRow, rowNumber } = item;

      if (normalizedRow.rowNo == null) {
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
            rentalGroupId,
            rowNo: normalizedRow.rowNo,
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
            rentalGroupId,
            importBatchId: importBatch.id,
            rowNo: normalizedRow.rowNo,
            fullName: normalizedRow.fullName,
            gender: normalizedRow.gender,
            heightCm: normalizedRow.heightCm!,
            weightKg: new Prisma.Decimal(normalizedRow.weightKg!),
          },
        });

        createdRows += 1;
        continue;
      }

      if (existingByRowNo.fullName.trim() !== normalizedRow.fullName.trim()) {
        collectedErrors.push({
          rowNumber,
          fieldName: "Họ tên",
          errorMessage:
            "Không overwrite vì chỉ trùng rentalGroupId + rowNo nhưng fullName không khớp",
          rawValue: normalizedRow.fullName,
        });
        skippedRows += 1;
        continue;
      }

      await tx.renter.update({
        where: { id: existingByRowNo.id },
        data: {
          importBatchId: importBatch.id,
          fullName: normalizedRow.fullName,
          gender: normalizedRow.gender,
          heightCm: normalizedRow.heightCm!,
          weightKg: new Prisma.Decimal(normalizedRow.weightKg!),
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
  };
}