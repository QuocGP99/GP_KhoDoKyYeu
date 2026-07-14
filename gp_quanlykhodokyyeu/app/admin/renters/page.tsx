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
        productSizes: {
          include: {
            rentalGroupProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    gender: true,
                  },
                },
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
            matchedRule: {
              select: {
                id: true,
                priority: true,
              },
            },
          },
          orderBy: {
            rentalGroupProduct: {
              sortOrder: "asc",
            },
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

  const renters = rentersRaw.map((renter) => {
    const firstProductSize = renter.productSizes[0] ?? null;

    return {
      ...renter,
      weightKg: renter.weightKg.toString(),
      suggestedSize: firstProductSize?.suggestedSize ?? null,
      confirmedSize: firstProductSize?.confirmedSize ?? null,
      sizeAssignments: renter.productSizes.map((productSize) => ({
        id: productSize.id,
        rentalGroupProductId: productSize.rentalGroupProductId,
        product: productSize.rentalGroupProduct.product,
        suggestedSize: productSize.suggestedSize,
        confirmedSize: productSize.confirmedSize,
        matchedRule: productSize.matchedRule,
        note: productSize.note,
      })),
    };
  });

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