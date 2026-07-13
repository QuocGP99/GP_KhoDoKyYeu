import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ItemsTable from "./items-table";

export default async function AdminItemsPage() {
    const [items, categories, products, warehouses, statuses] = await Promise.all([
    prisma.item.findMany({
        include: {
        product: {
            select: {
            id: true,
            code: true,
            name: true,
            hasSize: true,
            category: {
                select: { id: true, code: true, name: true },
            },
            },
        },
        size: {
            select: { id: true, code: true, name: true },
        },
        warehouse: {
            select: { id: true, code: true, name: true },
        },
        status: {
            select: { id: true, code: true, name: true, color: true },
        },
        },
        orderBy: { createdAt: "desc" },
    }),
    prisma.productCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true },
    }),
    prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true, hasSize: true },
    }),
    prisma.warehouse.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true },
    }),
    prisma.itemStatus.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, code: true, name: true, color: true },
    }),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý item</h1>
          <p className="text-sm text-slate-500">
            CRUD item, gắn product, size, warehouse, status.
          </p>
        </div>

        <Link
          href="/admin/items/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Thêm item
        </Link>
      </div>

      <ItemsTable
        initialItems={items}
        products={products}
        warehouses={warehouses}
        statuses={statuses}
        categories={categories}
      />
    </div>
  );
}