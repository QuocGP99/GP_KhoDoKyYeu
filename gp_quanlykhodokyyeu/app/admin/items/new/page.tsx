import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ItemForm from "../item-form";

export const dynamic = "force-dynamic";

export default async function NewItemPage() {
  const [products, warehouses, statuses, sizes, currentUser] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        hasSize: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        productSizes: {
          include: {
            size: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: [
            { isDefault: "desc" },
            { size: { sortOrder: "asc" } },
          ],
        },
      },
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    prisma.itemStatus.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
      },
    }),
    prisma.size.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        sortOrder: true,
      },
    }),
    prisma.user.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        fullName: true,
      },
    }),
  ]);

  if (!currentUser) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ItemForm
        mode="create"
        products={products}
        warehouses={warehouses}
        statuses={statuses}
        sizes={sizes}
        currentUserId={currentUser.id}
      />
    </div>
  );
}