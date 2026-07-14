import { prisma } from "@/lib/prisma";
import RenterImportUploadForm from "./upload-form";

export const dynamic = "force-dynamic";

async function getRentalGroups() {
  return prisma.rentalGroup.findMany({
    orderBy: [
      { createdAt: "desc" },
      { groupName: "asc" },
    ],
    select: {
      id: true,
      groupName: true,
      groupCode: true,
      schoolName: true,
      status: true,
    },
  });
}

async function getCurrentUser() {
  return prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      username: true,
    },
  });
}

export default async function RenterImportsPage() {
  const [rentalGroups, currentUser] = await Promise.all([
    getRentalGroups(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Import người mặc
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Chọn nhóm thuê, tải file Excel/CSV, preview dữ liệu, rồi commit import
            vào hệ thống. Luồng này hỗ trợ batch log, lỗi theo dòng và cập nhật
            dữ liệu người mặc theo rule đã chốt.
          </p>
        </div>
      </section>

      <RenterImportUploadForm
        rentalGroups={rentalGroups}
        uploadedByUserId={currentUser?.id ?? ""}
      />
    </div>
  );
}