"use client";

import { useMemo, useState } from "react";

type RentalGroupOption = {
  id: string;
  groupName: string;
  groupCode?: string | null;
  schoolName?: string | null;
  status: string;
};

type PreviewError = {
  rowNumber: number;
  fieldName: string | null;
  errorMessage: string;
  rawValue: string | null;
};

type PreviewValidRow = {
  rowNumber: number;
  rawRow: Record<string, unknown>;
  normalizedRow: {
    rowNo: number | null;
    fullName: string;
    gender: string | null;
    heightCm: number | null;
    weightKg: number | null;
  };
};

type PreviewResponse = {
  ok?: boolean;
  error?: string;
  rentalGroup?: RentalGroupOption;
  file?: {
    name: string;
    size: number;
    type: string | null;
    sheetName: string;
  };
  summary?: {
    totalRows: number;
    successRows: number;
    errorRows: number;
    headerErrorCount: number;
    totalErrorCount: number;
  };
  headers?: {
    normalizedHeaders: (string | null)[];
    errors: PreviewError[];
  };
  rows?: {
    validRows: PreviewValidRow[];
    errors: PreviewError[];
  };
};

type CommitResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  importBatch?: {
    id: string;
    fileName: string;
    createdAt: string;
    finishedAt?: string | null;
    status?: string;
  };
  file?: {
    name: string;
    size: number;
    type: string | null;
    sheetName: string;
  };
  summary?: {
    totalRows: number;
    createdRows: number;
    updatedRows: number;
    skippedRows: number;
    successRows: number;
    errorRows: number;
    totalErrorCount: number;
  };
  errors?: PreviewError[];
};

type Props = {
  rentalGroups: RentalGroupOption[];
  uploadedByUserId: string;
};

export default function RenterImportUploadForm({
  rentalGroups,
  uploadedByUserId,
}: Props) {
  const [rentalGroupId, setRentalGroupId] = useState(rentalGroups[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectedGroup = useMemo(
    () => rentalGroups.find((group) => group.id === rentalGroupId) ?? null,
    [rentalGroupId, rentalGroups]
  );

  async function handlePreview() {
    if (!rentalGroupId) {
      setErrorMessage("Vui lòng chọn nhóm thuê.");
      return;
    }

    if (!file) {
      setErrorMessage("Vui lòng chọn file import.");
      return;
    }

    setIsPreviewing(true);
    setErrorMessage("");
    setCommitResult(null);

    try {
      const formData = new FormData();
      formData.append("rentalGroupId", rentalGroupId);
      formData.append("file", file);

      const response = await fetch("/api/imports/renters/preview", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as PreviewResponse;

      if (!response.ok) {
        setPreviewResult(null);
        setErrorMessage(data.error ?? "Không thể preview file import.");
        return;
      }

      setPreviewResult(data);
    } catch (error) {
      console.error(error);
      setPreviewResult(null);
      setErrorMessage("Đã xảy ra lỗi khi preview file import.");
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleCommit() {
    if (!rentalGroupId) {
      setErrorMessage("Vui lòng chọn nhóm thuê.");
      return;
    }

    if (!file) {
      setErrorMessage("Vui lòng chọn file import.");
      return;
    }

    if (!previewResult?.summary) {
      setErrorMessage("Vui lòng preview file trước khi import.");
      return;
    }

    setIsCommitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("rentalGroupId", rentalGroupId);
      formData.append("uploadedByUserId", uploadedByUserId);
      formData.append("file", file);

      const response = await fetch("/api/imports/renters/commit", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as CommitResponse;

      if (!response.ok) {
        setCommitResult(null);
        setErrorMessage(data.error ?? "Không thể commit import.");
        return;
      }

      setCommitResult(data);
    } catch (error) {
      console.error(error);
      setCommitResult(null);
      setErrorMessage("Đã xảy ra lỗi khi commit import.");
    } finally {
      setIsCommitting(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setPreviewResult(null);
    setCommitResult(null);
    setErrorMessage("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="rentalGroupId"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Nhóm thuê
              </label>
              <select
                id="rentalGroupId"
                value={rentalGroupId}
                onChange={(event) => {
                  setRentalGroupId(event.target.value);
                  setPreviewResult(null);
                  setCommitResult(null);
                  setErrorMessage("");
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 focus:border-slate-500"
              >
                <option value="">Chọn nhóm thuê</option>
                {rentalGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.groupName}
                    {group.groupCode ? ` - ${group.groupCode}` : ""}
                    {group.schoolName ? ` - ${group.schoolName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="importFile"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                File import
              </label>
              <input
                id="importFile"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
              <p className="mt-2 text-xs text-slate-500">
                Hỗ trợ định dạng .xlsx, .xls, .csv.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isPreviewing || isCommitting}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPreviewing ? "Đang preview..." : "Preview file"}
              </button>

              <button
                type="button"
                onClick={handleCommit}
                disabled={isPreviewing || isCommitting || !previewResult?.summary}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCommitting ? "Đang import..." : "Commit import"}
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Thông tin phiên import
              </h3>
              <div className="text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-900">Nhóm thuê:</span>{" "}
                  {selectedGroup?.groupName ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Mã nhóm:</span>{" "}
                  {selectedGroup?.groupCode ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Trường:</span>{" "}
                  {selectedGroup?.schoolName ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Trạng thái:</span>{" "}
                  {selectedGroup?.status ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900">File:</span>{" "}
                  {file?.name ?? "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {previewResult?.summary ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Kết quả preview
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Dữ liệu dưới đây là kết quả parse và validate trước khi ghi vào DB.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Tổng dòng</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {previewResult.summary.totalRows}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">Dòng hợp lệ</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-800">
                {previewResult.summary.successRows}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm text-amber-700">Dòng lỗi</div>
              <div className="mt-1 text-2xl font-semibold text-amber-800">
                {previewResult.summary.errorRows}
              </div>
            </div>

            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm text-rose-700">Tổng lỗi</div>
              <div className="mt-1 text-2xl font-semibold text-rose-800">
                {previewResult.summary.totalErrorCount}
              </div>
            </div>
          </div>

          {previewResult.rows?.errors?.length ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Lỗi preview
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Dòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Cột
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Lỗi
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Giá trị gốc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewResult.rows.errors.map((error, index) => (
                      <tr key={`${error.rowNumber}-${error.fieldName}-${index}`}>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {error.rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {error.fieldName ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-rose-700">
                          {error.errorMessage}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {error.rawValue ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {previewResult.rows?.validRows?.length ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Dòng hợp lệ
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Dòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Họ tên
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Giới tính
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Chiều cao
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Cân nặng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewResult.rows.validRows.slice(0, 20).map((item) => (
                      <tr key={item.rowNumber}>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.normalizedRow.rowNo ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {item.normalizedRow.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.normalizedRow.gender ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.normalizedRow.heightCm ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.normalizedRow.weightKg ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewResult.rows.validRows.length > 20 ? (
                <p className="mt-2 text-xs text-slate-500">
                  Đang hiển thị 20 dòng hợp lệ đầu tiên.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {commitResult?.summary ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Kết quả import
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Batch import đã được ghi nhận và dữ liệu hợp lệ đã được xử lý vào hệ thống.
            </p>
          </div>

          {commitResult.message ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {commitResult.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Tổng dòng</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {commitResult.summary.totalRows}
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">Tạo mới</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-800">
                {commitResult.summary.createdRows}
              </div>
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="text-sm text-sky-700">Cập nhật</div>
              <div className="mt-1 text-2xl font-semibold text-sky-800">
                {commitResult.summary.updatedRows}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm text-amber-700">Bỏ qua</div>
              <div className="mt-1 text-2xl font-semibold text-amber-800">
                {commitResult.summary.skippedRows}
              </div>
            </div>

            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm text-rose-700">Dòng lỗi</div>
              <div className="mt-1 text-2xl font-semibold text-rose-800">
                {commitResult.summary.errorRows}
              </div>
            </div>
          </div>

          {commitResult.importBatch ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                <span className="font-medium text-slate-900">Import batch:</span>{" "}
                {commitResult.importBatch.id}
              </div>
              <div>
                <span className="font-medium text-slate-900">File:</span>{" "}
                {commitResult.importBatch.fileName}
              </div>
              <div>
                <span className="font-medium text-slate-900">Thời điểm tạo:</span>{" "}
                {new Date(commitResult.importBatch.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ) : null}

          {commitResult.errors?.length ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Lỗi import
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Dòng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Cột
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Lỗi
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                        Giá trị gốc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {commitResult.errors.map((error, index) => (
                      <tr key={`${error.rowNumber}-${error.fieldName}-${index}`}>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {error.rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {error.fieldName ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-rose-700">
                          {error.errorMessage}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {error.rawValue ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}