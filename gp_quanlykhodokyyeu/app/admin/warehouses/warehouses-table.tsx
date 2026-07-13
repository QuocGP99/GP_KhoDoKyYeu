"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WarehouseItem = {
  id: string;
  branchId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  _count?: {
    items: number;
    users: number;
  };
};

export default function WarehousesTable({
  warehouses,
}: {
  warehouses: WarehouseItem[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleStatus(warehouse: WarehouseItem) {
    const nextStatus = !warehouse.isActive;
    const confirmed = window.confirm(
      nextStatus
        ? `Mở hoạt động kho "${warehouse.name}"?`
        : `Tạm ngưng kho "${warehouse.name}"?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(warehouse.id);

      const res = await fetch(`/api/warehouses/${warehouse.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.message || "Cập nhật trạng thái thất bại");
        return;
      }

      router.refresh();
    } catch {
      alert("Có lỗi xảy ra");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Mã kho</th>
              <th className="px-4 py-3 font-semibold">Tên kho</th>
              <th className="px-4 py-3 font-semibold">Chi nhánh</th>
              <th className="px-4 py-3 font-semibold">Số item</th>
              <th className="px-4 py-3 font-semibold">Nhân sự</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {warehouse.code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{warehouse.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {warehouse.branch.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {warehouse._count?.items ?? 0}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {warehouse._count?.users ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        warehouse.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {warehouse.isActive ? "Đang hoạt động" : "Đã ngưng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/warehouses/${warehouse.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(warehouse)}
                        disabled={loadingId === warehouse.id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          warehouse.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-60`}
                      >
                        {loadingId === warehouse.id
                          ? "Đang xử lý..."
                          : warehouse.isActive
                          ? "Ngưng"
                          : "Mở"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Chưa có kho nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}