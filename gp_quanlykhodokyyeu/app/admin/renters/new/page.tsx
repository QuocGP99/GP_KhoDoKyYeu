import { prisma } from "@/lib/prisma";
import RenterForm from "../renter-form";

export const dynamic = "force-dynamic";

export default async function NewRenterPage() {
  const [rentalGroups, sizes] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <RenterForm
        mode="create"
        rentalGroups={rentalGroups}
        sizes={sizes}
      />
    </div>
  );
}