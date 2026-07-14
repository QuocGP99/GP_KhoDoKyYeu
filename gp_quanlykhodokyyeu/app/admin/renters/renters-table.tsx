"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Gender = "MALE" | "FEMALE" | "OTHER";

type RentalGroupOption = {
  id: string;
  groupName: string;
  groupCode: string | null;
  schoolName: string | null;
  status: string;
};

type SizeOption = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type SizeValue = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type RenterRow = {
  id: string;
  studentCode: string | null;
  fullName: string;
  gender: Gender | null;
  heightCm: number;
  weightKg: number | string | { toString(): string };
  note: string | null;
  createdAt?: string | Date;
  rentalGroup: {
    id: string;
    groupName: string;
    groupCode: string | null;
    schoolName: string | null;
    status: string;
  };
  suggestedSize: SizeValue | null;
  confirmedSize: SizeValue | null;
  importBatch: {
    id: string;
    fileName: string;
    status: string;
  } | null;
  _count: {
    allocationItems: number;
  };
  sizeAssignments?: {
    id: string;
    rentalGroupProductId: string;
    product: {
      id: string;
      code: string;
      name: string;
      gender: string | null;
    };
    suggestedSize: SizeValue | null;
    confirmedSize: SizeValue | null;
    matchedRule: {
      id: string;
      priority: number;
      sizeId?: string | null;
    } | null;
    note: string | null;
  }[];
};

type RentersTableProps = {
  initialRenters: RenterRow[];
  rentalGroups: RentalGroupOption[];
  sizes: SizeOption[];
};

const genderOptions: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

function genderLabel(value?: Gender | null) {
  if (!value) return "-";
  return genderOptions.find((item) => item.value === value)?.label ?? value;
}

function weightLabel(value: RenterRow["weightKg"]) {
  if (value == null) return "-";
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return value;
  return value.toString();
}

function sizeLabel(size?: SizeValue | null) {
  if (!size) return "-";
  return `${size.code} - ${size.name}`;
}

export default function RentersTable({
  initialRenters,
  rentalGroups,
  sizes,
}: RentersTableProps) {
  const rows = initialRenters ?? [];

  const [q, setQ] = useState("");
  const [rentalGroupId, setRentalGroupId] = useState("");
  const [gender, setGender] = useState("");
  const [suggestedSizeId, setSuggestedSizeId] = useState("");
  const [confirmedSizeId, setConfirmedSizeId] = useState("");

  const sortedRentalGroups = useMemo(() => {
    return [...rentalGroups].sort((a, b) =>
      a.groupName.localeCompare(b.groupName, "vi")
    );
  }, [rentalGroups]);

  const sortedSizes = useMemo(() => {
    return [...sizes].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [sizes]);

  const filteredRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return rows.filter((row) => {
      const matchKeyword =
        !keyword ||
        row.fullName.toLowerCase().includes(keyword) ||
        (row.studentCode ?? "").toLowerCase().includes(keyword) ||
        (row.note ?? "").toLowerCase().includes(keyword) ||
        row.rentalGroup.groupName.toLowerCase().includes(keyword) ||
        (row.rentalGroup.schoolName ?? "").toLowerCase().includes(keyword) ||
        (row.rentalGroup.groupCode ?? "").toLowerCase().includes(keyword);

      const matchRentalGroup =
        !rentalGroupId || row.rentalGroup.id === rentalGroupId;

      const matchGender = !gender || row.gender === gender;

      const matchSuggestedSize =
        !suggestedSizeId ||
        row.suggestedSize?.id === suggestedSizeId ||
        row.sizeAssignments?.some(
          (assignment) => assignment.suggestedSize?.id === suggestedSizeId
        );

      const matchConfirmedSize =
        !confirmedSizeId ||
        row.confirmedSize?.id === confirmedSizeId ||
        row.sizeAssignments?.some(
          (assignment) => assignment.confirmedSize?.id === confirmedSizeId
        );

      return (
        matchKeyword &&
        matchRentalGroup &&
        matchGender &&
        matchSuggestedSize &&
        matchConfirmedSize
      );
    });
  }, [rows, q, rentalGroupId, gender, suggestedSizeId, confirmedSizeId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Danh sách người mặc
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Quản lý thông tin người mặc, nhóm thuê, size gợi ý và trạng thái xác
            nhận size theo từng sản phẩm.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, mã HS, nhóm, trường..."
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 xl:col-span-2"
          />

          <select
            value={rentalGroupId}
            onChange={(e) => setRentalGroupId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Tất cả nhóm thuê</option>
            {sortedRentalGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupName}
                {group.groupCode ? ` (${group.groupCode})` : ""}
              </option>
            ))}
          </select>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Tất cả giới tính</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={suggestedSizeId}
            onChange={(e) => setSuggestedSizeId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Tất cả size gợi ý</option>
            {sortedSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.code} - {size.name}
              </option>
            ))}
          </select>

          <select
            value={confirmedSizeId}
            onChange={(e) => setConfirmedSizeId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Tất cả size chốt</option>
            {sortedSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.code} - {size.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            Tổng: <strong>{filteredRows.length}</strong> người mặc
          </span>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setRentalGroupId("");
              setGender("");
              setSuggestedSizeId("");
              setConfirmedSizeId("");
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-medium text-slate-700">
                  Người mặc
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Nhóm thuê
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Thông số
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Xác nhận size
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Nguồn dữ liệu
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Cấp phát
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Không có người mặc phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const assignments = row.sizeAssignments ?? [];
                  const confirmedCount = assignments.filter(
                    (item) => item.confirmedSize
                  ).length;
                  const totalAssignments = assignments.length;
                  const allConfirmed =
                    totalAssignments > 0 && confirmedCount === totalAssignments;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 align-top last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">
                            {row.fullName}
                          </div>
                          <div className="text-slate-500">
                            Mã HS: {row.studentCode || "-"}
                          </div>
                          <div className="text-slate-500">
                            Giới tính: {genderLabel(row.gender)}
                          </div>
                          {row.note ? (
                            <div className="text-slate-500">
                              Ghi chú: {row.note}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900">
                            {row.rentalGroup.groupName}
                          </div>
                          <div className="text-slate-500">
                            Trường: {row.rentalGroup.schoolName || "-"}
                          </div>
                          <div className="text-slate-500">
                            Mã nhóm: {row.rentalGroup.groupCode || "-"}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1 text-slate-700">
                          <div>Cao: {row.heightCm} cm</div>
                          <div>Nặng: {weightLabel(row.weightKg)} kg</div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                allConfirmed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : confirmedCount > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {allConfirmed
                                ? "Đã chốt đầy đủ"
                                : confirmedCount > 0
                                ? `Đã chốt ${confirmedCount}/${totalAssignments}`
                                : "Chưa chốt size"}
                            </span>

                            {row.suggestedSize ? (
                              <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                                Gợi ý chung: {row.suggestedSize.code}
                              </span>
                            ) : null}
                          </div>

                          {assignments.length ? (
                            <div className="space-y-2">
                              {assignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                                >
                                  <div className="mb-1 text-sm font-medium text-slate-900">
                                    {assignment.product.name}
                                    {assignment.product.code
                                      ? ` (${assignment.product.code})`
                                      : ""}
                                  </div>

                                  <div className="grid gap-1 text-xs text-slate-600">
                                    <div>
                                      Gợi ý: {sizeLabel(assignment.suggestedSize)}
                                    </div>
                                    <div>
                                      Chốt:{" "}
                                      <span
                                        className={
                                          assignment.confirmedSize
                                            ? "font-medium text-emerald-700"
                                            : "text-slate-500"
                                        }
                                      >
                                        {sizeLabel(assignment.confirmedSize)}
                                      </span>
                                    </div>
                                    <div>
                                      Rule match:{" "}
                                      {assignment.matchedRule
                                        ? `Priority ${assignment.matchedRule.priority}`
                                        : "-"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">
                              Chưa có assignment size.
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {row.importBatch ? (
                          <div className="space-y-1 text-slate-700">
                            <div className="font-medium text-slate-900">
                              Import Excel
                            </div>
                            <div>File: {row.importBatch.fileName}</div>
                            <div>Trạng thái: {row.importBatch.status}</div>
                          </div>
                        ) : (
                          <div className="text-slate-500">Nhập thủ công</div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-700">
                          Phiếu cấp phát: {row._count.allocationItems}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/renters/${row.id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Sửa
                          </Link>

                          <Link
                            href={`/admin/renters/${row.id}`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}