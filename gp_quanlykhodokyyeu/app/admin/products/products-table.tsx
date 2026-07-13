"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductItem = {
  id: string;
  code: string;
  name: string;
  gender: string | null;
  hasSize: boolean;
  isActive: boolean;
  category: {
    name: string;
    code: string;
  };
  productSizes: {
    size: {
      code: string;
      name: string;
    };
  }[];
  _count?: {
    items: number;
  };
};

export default function ProductsTable({ products }: { products: ProductItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleStatus(product: ProductItem) {
    const nextStatus = !product.isActive;
    const confirmed = window.confirm(
      nextStatus
        ? `Mở hoạt động sản phẩm "${product.name}"?`
        : `Ngưng hoạt động sản phẩm "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setLoadingId(product.id);

      const res = await fetch(`/api/products/${product.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Danh mục</th>
              <th className="px-4 py-3 font-semibold">Giới tính</th>
              <th className="px-4 py-3 font-semibold">Size</th>
              <th className="px-4 py-3 font-semibold">Số item</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{product.code}</td>
                  <td className="px-4 py-3 text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-slate-700">{product.category.name}</td>
                  <td className="px-4 py-3 text-slate-700">{product.gender || "-"}</td>
                  <td className="px-4 py-3">
                    {product.hasSize ? (
                      <div className="flex flex-wrap gap-1">
                        {product.productSizes.map((x) => (
                          <span
                            key={x.size.code}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                          >
                            {x.size.code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        Không size
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{product._count?.items ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.isActive ? "Đang hoạt động" : "Đã ngưng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product)}
                        disabled={loadingId === product.id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          product.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:opacity-60`}
                      >
                        {loadingId === product.id
                          ? "Đang xử lý..."
                          : product.isActive
                          ? "Ngưng"
                          : "Mở"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}