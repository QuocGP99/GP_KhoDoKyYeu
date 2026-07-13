import { prisma } from "@/lib/prisma";
import RentalGroupsTable from "./rental-groups-table";

export const dynamic = "force-dynamic";

export default async function RentalGroupsPage() {
  const [rentalGroups, branches, warehouses] = await Promise.all([
    prisma.rentalGroup.findMany({
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
            branchId: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            renters: true,
            importBatches: true,
            allocationOrders: true,
          },
        },
      },
      orderBy: [{ shootDate: "asc" }, { createdAt: "desc" }],
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
  ]);

  return (
    <div className="space-y-6">
      <RentalGroupsTable
        initialRentalGroups={rentalGroups}
        branches={branches}
        warehouses={warehouses}
      />
    </div>
  );
}