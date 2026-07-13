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
  suggestedSize: {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  } | null;
  confirmedSize: {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
  } | null;
  importBatch: {
    id: string;
    fileName: string;
    status: string;
  } | null;
  _count: {
    allocationItems: number;
  };
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
        !suggestedSizeId || row.suggestedSize?.id === suggestedSizeId;

      const matchConfirmedSize =
        !confirmedSizeId || row.confirmedSize?.id === confirmedSizeId;

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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Danh sách người mặc
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin người mặc, nhóm thuê và size gợi ý/size chốt.
          </p>
        </div>

        <Link
          href="/admin/renters/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Thêm người mặc
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, mã HS, nhóm thuê..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        />

        <select
          value={rentalGroupId}
          onChange={(e) => setRentalGroupId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả nhóm thuê</option>
          {rentalGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.groupName}
            </option>
          ))}
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả size gợi ý</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.code} - {size.name}
            </option>
          ))}
        </select>

        <select
          value={confirmedSizeId}
          onChange={(e) => setConfirmedSizeId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả size chốt</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.code} - {size.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setQ("");
            setRentalGroupId("");
            setGender("");
            setSuggestedSizeId("");
            setConfirmedSizeId("");
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Xóa bộ lọc
        </button>

        <div className="ml-auto text-sm text-slate-500">
          Tổng:{" "}
          <span className="font-medium text-slate-900">{filteredRows.length}</span>{" "}
          người mặc
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-medium">Người mặc</th>
              <th className="px-4 py-3 font-medium">Nhóm thuê</th>
              <th className="px-4 py-3 font-medium">Thông số</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Nguồn dữ liệu</th>
              <th className="px-4 py-3 font-medium">Cấp phát</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  Không có người mặc phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="text-sm text-slate-700">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">{row.fullName}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Mã HS: {row.studentCode || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Giới tính: {genderLabel(row.gender)}
                    </div>
                    {row.note ? (
                      <div className="mt-2 line-clamp-2 max-w-xs text-xs text-slate-500">
                        Ghi chú: {row.note}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">
                      {row.rentalGroup.groupName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Trường: {row.rentalGroup.schoolName || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Mã nhóm: {row.rentalGroup.groupCode || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-900">
                      Cao: <span className="font-medium">{row.heightCm} cm</span>
                    </div>
                    <div className="mt-1 text-slate-900">
                      Nặng: <span className="font-medium">{weightLabel(row.weightKg)} kg</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-900">
                      Gợi ý:{" "}
                      <span className="font-medium">
                        {row.suggestedSize
                          ? `${row.suggestedSize.code} - ${row.suggestedSize.name}`
                          : "-"}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-900">
                      Chốt:{" "}
                      <span className="font-medium">
                        {row.confirmedSize
                          ? `${row.confirmedSize.code} - ${row.confirmedSize.name}`
                          : "-"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    {row.importBatch ? (
                      <>
                        <div className="font-medium text-slate-900">Import Excel</div>
                        <div className="mt-1 text-xs text-slate-500">
                          File: {row.importBatch.fileName}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Trạng thái: {row.importBatch.status}
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500">Nhập thủ công</div>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-900">
                      Phiếu cấp phát:{" "}
                      <span className="font-medium">
                        {row._count.allocationItems}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/renters/${row.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}