import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import WarehouseForm from "../../warehouse-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWarehousePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [warehouse, branches] = await Promise.all([
    prisma.warehouse.findUnique({
      where: { id },
      select: {
        id: true,
        branchId: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
      },
    }),
    prisma.branch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
  ]);

  if (!warehouse) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sửa kho</h1>
        </div>

        <WarehouseForm
          mode="edit"
          branches={branches}
          initialData={warehouse}
        />
      </div>
    </main>
  );
}