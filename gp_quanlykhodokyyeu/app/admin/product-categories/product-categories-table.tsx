"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  hasSize: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    products: number;
    sizeRules: number;
  };
};

export default function ProductCategoriesTable({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleStatus(category: CategoryItem) {
    const nextStatus = !category.isActive;
    const confirmed = window.confirm(
      nextStatus
        ? `Mở hoạt động danh mục "${category.name}"?`
        : `Ngưng hoạt động danh mục "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(category.id);

      const res = await fetch(`/api/product-categories/${category.id}/status`, {
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
              <th className="px-4 py-3 font-semibold">Tên danh mục</th>
              <th className="px-4 py-3 font-semibold">Có size</th>
              <th className="px-4 py-3 font-semibold">Số sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {category.code}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-900">
                        {category.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {category.description || "Không có mô tả"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.hasSize
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {category.hasSize ? "Có size" : "Không size"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {category._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.isActive ? "Đang hoạt động" : "Đã ngưng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/product-categories/${category.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(category)}
                        disabled={loadingId === category.id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          category.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-60`}
                      >
                        {loadingId === category.id
                          ? "Đang xử lý..."
                          : category.isActive
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
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}