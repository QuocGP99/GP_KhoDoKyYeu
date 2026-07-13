"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormMode = "create" | "edit";

type UserFormProps = {
  mode: FormMode;
  initialData?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: "ADMIN" | "STAFF";
    isActive: boolean;
  };
};

export default function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: initialData?.fullName ?? "",
    email: initialData?.email ?? "",
    username: initialData?.username ?? "",
    password: "",
    role: initialData?.role ?? ("STAFF" as "ADMIN" | "STAFF"),
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
        mode === "create" ? "/api/users" : `/api/users/${initialData?.id}`;

      const payload =
        mode === "create"
          ? form
          : {
              fullName: form.fullName,
              email: form.email,
              username: form.username,
              role: form.role,
              isActive: form.isActive,
            };

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Lưu dữ liệu thất bại");
        return;
      }

      router.push("/admin/users");
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
          Họ tên
        </label>
        <input
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập họ tên"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập email"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Nhập username"
          required
        />
      </div>

      {mode === "create" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as "ADMIN" | "STAFF" })
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="STAFF">STAFF</option>
          <option value="ADMIN">ADMIN</option>
        </select>
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
            ? "Tạo user"
            : "Lưu thay đổi"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </button>
      </div>
    </form>
  );
}