import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import ProductForm from "../../product-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, sizes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        code: true,
        name: true,
        gender: true,
        description: true,
        imageUrl: true,
        hasSize: true,
        isActive: true,
        productSizes: {
          select: {
            sizeId: true,
          },
        },
      },
    }),
    prisma.productCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        hasSize: true,
        isActive: true,
      },
    }),
    prisma.size.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        sortOrder: true,
        isActive: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sửa sản phẩm</h1>
        </div>

        <ProductForm
          mode="edit"
          categories={categories}
          sizes={sizes}
          initialData={{
            id: product.id,
            categoryId: product.categoryId,
            code: product.code,
            name: product.name,
            gender: product.gender,
            description: product.description,
            imageUrl: product.imageUrl,
            hasSize: product.hasSize,
            isActive: product.isActive,
            sizeIds: product.productSizes.map((x) => x.sizeId),
          }}
        />
      </div>
    </main>
  );
}