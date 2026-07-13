import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RenterForm from "../../renter-form";

export const dynamic = "force-dynamic";

type EditRenterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRenterPage({
  params,
}: EditRenterPageProps) {
  const { id } = await params;

  const [renter, rentalGroups, sizes] = await Promise.all([
    prisma.renter.findUnique({
      where: { id },
      select: {
        id: true,
        rentalGroupId: true,
        studentCode: true,
        fullName: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        suggestedSizeId: true,
        confirmedSizeId: true,
        note: true,
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

  if (!renter) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <RenterForm
        mode="edit"
        item={{
          id: renter.id,
          rentalGroupId: renter.rentalGroupId,
          studentCode: renter.studentCode,
          fullName: renter.fullName,
          gender: renter.gender,
          heightCm: renter.heightCm,
          weightKg: renter.weightKg.toString(),
          suggestedSizeId: renter.suggestedSizeId,
          confirmedSizeId: renter.confirmedSizeId,
          note: renter.note,
        }}
        rentalGroups={rentalGroups}
        sizes={sizes}
      />
    </div>
  );
}