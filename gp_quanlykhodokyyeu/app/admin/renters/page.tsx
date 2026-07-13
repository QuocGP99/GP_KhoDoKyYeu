import { prisma } from "@/lib/prisma";
import RentersTable from "./renters-table";

export const dynamic = "force-dynamic";

export default async function RentersPage() {
  const [rentersRaw, rentalGroups, sizes] = await Promise.all([
    prisma.renter.findMany({
      include: {
        rentalGroup: {
          select: {
            id: true,
            groupName: true,
            groupCode: true,
            schoolName: true,
            status: true,
          },
        },
        suggestedSize: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },
        confirmedSize: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },
        importBatch: {
          select: {
            id: true,
            fileName: true,
            status: true,
          },
        },
        _count: {
          select: {
            allocationItems: true,
          },
        },
      },
      orderBy: [{ rentalGroup: { groupName: "asc" } }, { fullName: "asc" }],
    }),
    prisma.rentalGroup.findMany({
      orderBy: [{ groupName: "asc" }],
      select: {
        id: true,
        groupName: true,
        groupCode: true,
        schoolName: true,
        status: true,
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
  ]);

  const renters = rentersRaw.map((renter) => ({
    ...renter,
    weightKg: renter.weightKg.toString(),
  }));

  return (
    <div className="space-y-6">
      <RentersTable
        initialRenters={renters}
        rentalGroups={rentalGroups}
        sizes={sizes}
      />
    </div>
  );
}