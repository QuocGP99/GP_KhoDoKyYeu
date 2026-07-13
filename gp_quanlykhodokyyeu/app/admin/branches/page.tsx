import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import BranchesTable from "./branches-table";

export default async function BranchesPage() {
  await requireAdmin();

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      address: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          warehouses: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý chi nhánh</h1>
            <p className="mt-1 text-sm text-slate-500">
              CRUD branch và bật/tắt trạng thái hoạt động
            </p>
          </div>

          <Link
            href="/admin/branches/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo chi nhánh
          </Link>
        </div>

        <BranchesTable branches={branches} />
      </div>
    </main>
  );
}