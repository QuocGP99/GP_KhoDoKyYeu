"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormMode = "create" | "edit";

type SizeFormProps = {
  mode: FormMode;
  initialData?: {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
  };
};

export default function SizeForm({ mode, initialData }: SizeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    code: initialData?.code ?? "",
    name: initialData?.name ?? "",
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url =
        mode === "create" ? "/api/sizes" : `/api/sizes/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Lưu size thất bại");
        return;
      }

      router.push("/admin/sizes");
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
          Mã size
        </label>
        <input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="VD: S, M, L, XL"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tên size
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập tên size"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Thứ tự hiển thị
        </label>
        <input
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
        />
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
          {loading
            ? "Đang lưu..."
            : mode === "create"
            ? "Tạo size"
            : "Lưu thay đổi"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/sizes")}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>
    </form>
  );
}