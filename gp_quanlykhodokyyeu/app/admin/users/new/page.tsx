import { requireAdmin } from "@/lib/auth-guard";
import UserForm from "../user-form";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo user mới</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tạo tài khoản admin hoặc staff cho hệ thống
          </p>
        </div>

        <UserForm mode="create" />
      </div>
    </main>
  );
}