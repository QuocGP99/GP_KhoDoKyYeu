"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BranchItem = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    warehouses: number;
  };
};

export default function BranchesTable({ branches }: { branches: BranchItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleStatus(branch: BranchItem) {
    const nextStatus = !branch.isActive;
    const confirmed = window.confirm(
      nextStatus
        ? `Mở hoạt động chi nhánh "${branch.name}"?`
        : `Tạm ngưng chi nhánh "${branch.name}"?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(branch.id);

      const res = await fetch(`/api/branches/${branch.id}/status`, {
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
              <th className="px-4 py-3 font-semibold">Mã</th>
              <th className="px-4 py-3 font-semibold">Tên chi nhánh</th>
              <th className="px-4 py-3 font-semibold">Địa chỉ</th>
              <th className="px-4 py-3 font-semibold">Số kho</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {branches.length > 0 ? (
              branches.map((branch) => (
                <tr key={branch.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {branch.code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{branch.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {branch.address || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {branch._count?.warehouses ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        branch.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {branch.isActive ? "Đang hoạt động" : "Đã ngưng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/branches/${branch.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(branch)}
                        disabled={loadingId === branch.id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          branch.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-60`}
                      >
                        {loadingId === branch.id
                          ? "Đang xử lý..."
                          : branch.isActive
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
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Chưa có chi nhánh nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}