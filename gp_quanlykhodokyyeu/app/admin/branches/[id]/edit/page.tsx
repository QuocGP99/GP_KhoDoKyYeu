import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import BranchForm from "../../branch-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBranchPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const branch = await prisma.branch.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      address: true,
      phone: true,
      isActive: true,
    },
  });

  if (!branch) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sửa chi nhánh</h1>
        </div>

        <BranchForm mode="edit" initialData={branch} />
      </div>
    </main>
  );
}