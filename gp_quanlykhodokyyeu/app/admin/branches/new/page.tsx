import { requireAdmin } from "@/lib/auth-guard";
import BranchForm from "../branch-form";

export default async function NewBranchPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo chi nhánh</h1>
        </div>

        <BranchForm mode="create" />
      </div>
    </main>
  );
}