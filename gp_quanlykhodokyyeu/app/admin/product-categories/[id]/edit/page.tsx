import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import ProductCategoryForm from "../../product-category-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductCategoryPage({
  params,
}: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const category = await prisma.productCategory.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      hasSize: true,
      isActive: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Sửa danh mục sản phẩm
          </h1>
        </div>

        <ProductCategoryForm mode="edit" initialData={category} />
      </div>
    </main>
  );
}