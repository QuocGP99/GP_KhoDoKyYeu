"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SizeItem = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    productSizes: number;
    items: number;
    sizeRules: number;
  };
};

export default function SizesTable({ sizes }: { sizes: SizeItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleStatus(size: SizeItem) {
    const nextStatus = !size.isActive;
    const confirmed = window.confirm(
      nextStatus
        ? `Mở hoạt động size "${size.name}"?`
        : `Ngưng hoạt động size "${size.name}"?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(size.id);

      const res = await fetch(`/api/sizes/${size.id}/status`, {
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
              <th className="px-4 py-3 font-semibold">Tên size</th>
              <th className="px-4 py-3 font-semibold">Thứ tự</th>
              <th className="px-4 py-3 font-semibold">Số sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Số item</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <tr key={size.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {size.code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{size.name}</td>
                  <td className="px-4 py-3 text-slate-700">{size.sortOrder}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {size._count?.productSizes ?? 0}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {size._count?.items ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        size.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {size.isActive ? "Đang hoạt động" : "Đã ngưng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/sizes/${size.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(size)}
                        disabled={loadingId === size.id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          size.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-60`}
                      >
                        {loadingId === size.id
                          ? "Đang xử lý..."
                          : size.isActive
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
                  Chưa có size nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}