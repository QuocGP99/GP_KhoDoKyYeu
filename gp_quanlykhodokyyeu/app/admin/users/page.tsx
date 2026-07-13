import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import UsersTable from "./users-table";
import Link from "next/link";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý tài khoản admin và staff trong hệ thống
            </p>
          </div>

          <Link
            href="/admin/users/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo user
          </Link>
        </div>

        <UsersTable users={users} />
      </div>
    </main>
  );
}