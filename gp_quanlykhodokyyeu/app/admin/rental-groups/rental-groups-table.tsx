"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RentalGroupStatus =
  | "DRAFT"
  | "REVIEWED"
  | "CONFIRMED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type BranchOption = {
  id: string;
  code: string;
  name: string;
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
  branchId: string;
};

type RentalGroupRow = {
  id: string;
  groupCode: string | null;
  groupName: string;
  schoolName: string | null;
  shootDate: string | Date | null;
  status: RentalGroupStatus;
  note: string | null;
  createdAt: string | Date;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  warehouse: {
    id: string;
    code: string;
    name: string;
    branchId: string;
  };
  createdByUser: {
    id: string;
    username: string;
    fullName: string;
  };
  _count: {
    renters: number;
    importBatches: number;
    allocationOrders: number;
  };
};

type RentalGroupsTableProps = {
  initialRentalGroups: RentalGroupRow[];
  branches: BranchOption[];
  warehouses: WarehouseOption[];
};

const statusOptions: { value: RentalGroupStatus; label: string }[] = [
  { value: "DRAFT", label: "Nháp" },
  { value: "REVIEWED", label: "Đã duyệt sơ bộ" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "READY", label: "Sẵn sàng" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function statusLabel(status: RentalGroupStatus) {
  return (
    statusOptions.find((option) => option.value === status)?.label || status
  );
}

function statusClass(status: RentalGroupStatus) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "REVIEWED":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "READY":
      return "bg-violet-100 text-violet-700 ring-violet-200";
    case "COMPLETED":
      return "bg-green-100 text-green-700 ring-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export default function RentalGroupsTable({
  initialRentalGroups,
  branches,
  warehouses,
}: RentalGroupsTableProps) {
  const [rows] = useState<RentalGroupRow[]>(initialRentalGroups);
  const [q, setQ] = useState("");
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("");
  const [shootDateFrom, setShootDateFrom] = useState("");
  const [shootDateTo, setShootDateTo] = useState("");

  const filteredWarehouses = useMemo(() => {
    if (!branchId) return warehouses;
    return warehouses.filter((warehouse) => warehouse.branchId === branchId);
  }, [branchId, warehouses]);

  const filteredRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return rows.filter((row) => {
      const matchKeyword =
        !keyword ||
        row.groupName.toLowerCase().includes(keyword) ||
        (row.schoolName ?? "").toLowerCase().includes(keyword) ||
        (row.groupCode ?? "").toLowerCase().includes(keyword) ||
        row.branch.name.toLowerCase().includes(keyword) ||
        row.branch.code.toLowerCase().includes(keyword) ||
        row.warehouse.name.toLowerCase().includes(keyword) ||
        row.warehouse.code.toLowerCase().includes(keyword);

      const matchBranch = !branchId || row.branch.id === branchId;
      const matchWarehouse = !warehouseId || row.warehouse.id === warehouseId;
      const matchStatus = !status || row.status === status;

      const rowShootDate = row.shootDate ? new Date(row.shootDate) : null;
      const fromDate = shootDateFrom ? new Date(`${shootDateFrom}T00:00:00`) : null;
      const toDate = shootDateTo ? new Date(`${shootDateTo}T23:59:59`) : null;

      const matchFrom = !fromDate || (rowShootDate && rowShootDate >= fromDate);
      const matchTo = !toDate || (rowShootDate && rowShootDate <= toDate);

      return (
        matchKeyword &&
        matchBranch &&
        matchWarehouse &&
        matchStatus &&
        matchFrom &&
        matchTo
      );
    });
  }, [rows, q, branchId, warehouseId, status, shootDateFrom, shootDateTo]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Danh sách nhóm thuê
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý nhóm chụp, kho phục vụ, ngày chụp và trạng thái nhóm thuê.
          </p>
        </div>

        <Link
          href="/admin/rental-groups/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Tạo nhóm thuê
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên nhóm, trường, mã nhóm..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        />

        <select
          value={branchId}
          onChange={(e) => {
            const nextBranchId = e.target.value;
            setBranchId(nextBranchId);

            const isWarehouseStillValid = warehouses.some(
              (warehouse) =>
                warehouse.id === warehouseId && warehouse.branchId === nextBranchId
            );

            if (!isWarehouseStillValid) {
              setWarehouseId("");
            }
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả chi nhánh</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.code} - {branch.name}
            </option>
          ))}
        </select>

        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả kho</option>
          {filteredWarehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.code} - {warehouse.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={shootDateFrom}
          onChange={(e) => setShootDateFrom(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        />

        <input
          type="date"
          value={shootDateTo}
          onChange={(e) => setShootDateTo(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setQ("");
            setBranchId("");
            setWarehouseId("");
            setStatus("");
            setShootDateFrom("");
            setShootDateTo("");
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Xóa bộ lọc
        </button>

        <div className="ml-auto text-sm text-slate-500">
          Tổng:{" "}
          <span className="font-medium text-slate-900">{filteredRows.length}</span>{" "}
          nhóm thuê
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-medium">Nhóm thuê</th>
              <th className="px-4 py-3 font-medium">Chi nhánh / Kho</th>
              <th className="px-4 py-3 font-medium">Ngày chụp</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Dữ liệu liên quan</th>
              <th className="px-4 py-3 font-medium">Người tạo</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  Không có nhóm thuê phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="text-sm text-slate-700">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">{row.groupName}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Trường: {row.schoolName || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Mã nhóm: {row.groupCode || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">
                      {row.branch.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.branch.code}
                    </div>

                    <div className="mt-3 font-medium text-slate-900">
                      {row.warehouse.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.warehouse.code}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">{formatDate(row.shootDate)}</td>

                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
                        row.status
                      )}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-900">
                      Người thuê: <span className="font-medium">{row._count.renters}</span>
                    </div>
                    <div className="mt-1 text-slate-900">
                      Import: <span className="font-medium">{row._count.importBatches}</span>
                    </div>
                    <div className="mt-1 text-slate-900">
                      Cấp phát:{" "}
                      <span className="font-medium">{row._count.allocationOrders}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="text-slate-900">
                      {row.createdByUser.fullName || row.createdByUser.username}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.createdByUser.username}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/rental-groups/${row.id}/edit`}
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