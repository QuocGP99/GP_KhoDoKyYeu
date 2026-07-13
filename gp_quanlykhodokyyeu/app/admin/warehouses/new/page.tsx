import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import WarehouseForm from "../warehouse-form";

export default async function NewWarehousePage() {
  await requireAdmin();

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo kho</h1>
        </div>

        <WarehouseForm mode="create" branches={branches} />
      </div>
    </main>
  );
}