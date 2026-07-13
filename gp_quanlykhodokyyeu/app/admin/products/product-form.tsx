"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CategoryItem = {
  id: string;
  code: string;
  name: string;
  hasSize: boolean;
  isActive: boolean;
};

type SizeItem = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type ProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryItem[];
  sizes: SizeItem[];
  initialData?: {
    id: string;
    categoryId: string;
    code: string;
    name: string;
    gender: "MALE" | "FEMALE" | "UNISEX" | null;
    description: string | null;
    imageUrl: string | null;
    hasSize: boolean;
    isActive: boolean;
    sizeIds: string[];
  };
};

export default function ProductForm({
  mode,
  categories,
  sizes,
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    categoryId: initialData?.categoryId ?? "",
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    gender: initialData?.gender ?? null,
    description: initialData?.description ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    isActive: initialData?.isActive ?? true,
    sizeIds: initialData?.sizeIds ?? [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((x) => x.id === form.categoryId),
    [categories, form.categoryId]
  );

  useEffect(() => {
    if (selectedCategory && !selectedCategory.hasSize && form.sizeIds.length > 0) {
      setForm((prev) => ({ ...prev, sizeIds: [] }));
    }
  }, [selectedCategory, form.sizeIds.length]);

  function toggleSize(sizeId: string) {
    setForm((prev) => {
      const exists = prev.sizeIds.includes(sizeId);
      return {
        ...prev,
        sizeIds: exists
          ? prev.sizeIds.filter((x) => x !== sizeId)
          : [...prev.sizeIds, sizeId],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Lưu sản phẩm thất bại");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Danh mục
        </label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          required
        >
          <option value="">Chọn danh mục</option>
          {categories
            .filter((x) => x.isActive)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} - {category.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Mã sản phẩm
        </label>
        <input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="VD: AO_CU_NHAN_NAM"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tên sản phẩm
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Giới tính
        </label>
        <select
          value={form.gender ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              gender: e.target.value ? (e.target.value as "MALE" | "FEMALE" | "UNISEX") : null,
            })
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="">Không xác định</option>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="UNISEX">Unisex</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          URL ảnh
        </label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập mô tả"
        />
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="mb-2 text-sm font-medium text-slate-700">Cấu hình size</div>
        {selectedCategory ? (
          selectedCategory.hasSize ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Danh mục này có size. Chọn các size áp dụng cho sản phẩm.
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes
                  .filter((x) => x.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((size) => {
                    const checked = form.sizeIds.includes(size.id);
                    return (
                      <label
                        key={size.id}
                        className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${
                          checked
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => toggleSize(size.id)}
                        />
                        {size.code}
                      </label>
                    );
                  })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-700">
              Danh mục này không dùng size. Sản phẩm sẽ được lưu ở chế độ không size.
            </p>
          )
        ) : (
          <p className="text-sm text-slate-500">Hãy chọn danh mục trước.</p>
        )}
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Đang hoạt động
      </label>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>
    </form>
  );
}