import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import ProductForm from "../product-form";

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, sizes] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo sản phẩm</h1>
        </div>

        <ProductForm mode="create" categories={categories} sizes={sizes} />
      </div>
    </main>
  );
}