import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import ProductsTable from "./products-table";

export default async function ProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      gender: true,
      hasSize: true,
      isActive: true,
      category: {
        select: {
          name: true,
          code: true,
        },
      },
      productSizes: {
        orderBy: {
          size: {
            sortOrder: "asc",
          },
        },
        select: {
          size: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý catalog sản phẩm theo danh mục và size
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Tạo sản phẩm
          </Link>
        </div>

        <ProductsTable products={products} />
      </div>
    </main>
  );
}