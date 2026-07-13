import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import WarehousesTable from "./warehouses-table";

export default async function WarehousesPage() {
  await requireAdmin();

  const warehouses = await prisma.warehouse.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      branchId: true,
      code: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      branch: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
          users: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý kho</h1>
            <p className="mt-1 text-sm text-slate-500">
              CRUD warehouse, gán vào branch và bật/tắt hoạt động
            </p>
          </div>

          <Link
            href="/admin/warehouses/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo kho
          </Link>
        </div>

        <WarehousesTable warehouses={warehouses} />
      </div>
    </main>
  );
}