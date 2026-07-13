import { requireAdmin } from "@/lib/auth-guard";
import ProductCategoryForm from "../product-category-form";

export default async function NewProductCategoryPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Tạo danh mục sản phẩm
          </h1>
        </div>

        <ProductCategoryForm mode="create" />
      </div>
    </main>
  );
}