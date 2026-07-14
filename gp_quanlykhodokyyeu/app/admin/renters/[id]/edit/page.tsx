import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RenterForm from "../../renter-form";

export const dynamic = "force-dynamic";

type EditRenterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRenterPage({
  params,
}: EditRenterPageProps) {
  const { id } = await params;

  const [renterRaw, rentalGroups, sizes] = await Promise.all([
    prisma.renter.findUnique({
      where: { id },
      include: {
        productSizes: {
          include: {
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
          },
          orderBy: {
            rentalGroupProduct: {
              sortOrder: "asc",
            },
          },
        },
      },
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

  if (!renterRaw) {
    notFound();
  }

  const firstProductSize = renterRaw.productSizes[0] ?? null;

  const renter = {
    id: renterRaw.id,
    rentalGroupId: renterRaw.rentalGroupId,
    studentCode: renterRaw.studentCode,
    fullName: renterRaw.fullName,
    gender: renterRaw.gender,
    heightCm: renterRaw.heightCm,
    weightKg: renterRaw.weightKg.toString(),
    suggestedSizeId: firstProductSize?.suggestedSize?.id ?? null,
    confirmedSizeId: firstProductSize?.confirmedSize?.id ?? null,
    note: renterRaw.note,
  };

  return (
    <RenterForm
      mode="edit"
      item={renter}
      rentalGroups={rentalGroups}
      sizes={sizes}
    />
  );
}