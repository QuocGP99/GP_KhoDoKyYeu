import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import ProductCategoriesTable from "./product-categories-table";

export default async function ProductCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.productCategory.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      hasSize: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
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
            <h1 className="text-2xl font-bold text-slate-900">
              Danh mục sản phẩm
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý nhóm áo, quần, phụ kiện và cấu hình có size hay không
            </p>
          </div>

          <Link
            href="/admin/product-categories/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo danh mục
          </Link>
        </div>

        <ProductCategoriesTable categories={categories} />
      </div>
    </main>
  );
}