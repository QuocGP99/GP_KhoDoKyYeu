import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import SizeForm from "../../size-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSizePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const size = await prisma.size.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      sortOrder: true,
      isActive: true,
    },
  });

  if (!size) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sửa size</h1>
        </div>

        <SizeForm mode="edit" initialData={size} />
      </div>
    </main>
  );
}