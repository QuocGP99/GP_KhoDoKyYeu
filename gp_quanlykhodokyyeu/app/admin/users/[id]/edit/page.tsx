import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import UserForm from "../../user-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa user</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cập nhật thông tin tài khoản trong hệ thống
          </p>
        </div>

        <UserForm mode="edit" initialData={user} />
      </div>
    </main>
  );
}