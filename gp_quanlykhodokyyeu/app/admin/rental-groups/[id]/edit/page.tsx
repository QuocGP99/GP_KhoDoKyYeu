import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RentalGroupForm from "../../rental-group-form";

export const dynamic = "force-dynamic";

export default async function EditRentalGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, branches, warehouses, currentUser] = await Promise.all([
    prisma.rentalGroup.findUnique({
      where: { id },
      select: {
        id: true,
        branchId: true,
        warehouseId: true,
        groupCode: true,
        groupName: true,
        schoolName: true,
        shootDate: true,
        status: true,
        note: true,
      },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
      },
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        branchId: true,
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

  if (!item || !currentUser) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <RentalGroupForm
        mode="edit"
        item={item}
        branches={branches}
        warehouses={warehouses}
        currentUserId={currentUser.id}
      />
    </div>
  );
}