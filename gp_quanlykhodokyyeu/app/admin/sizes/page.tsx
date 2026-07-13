import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import SizesTable from "./sizes-table";

export default async function SizesPage() {
  await requireAdmin();

  const sizes = await prisma.size.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      code: true,
      name: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          productSizes: true,
          items: true,
          sizeRules: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý size</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý size S, M, L và mở rộng XL, XXL về sau
            </p>
          </div>

          <Link
            href="/admin/sizes/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo size
          </Link>
        </div>

        <SizesTable sizes={sizes} />
      </div>
    </main>
  );
}