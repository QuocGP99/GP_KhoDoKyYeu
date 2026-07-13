import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateProductCategoryStatusSchema } from "@/lib/product-category-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateProductCategoryStatusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Trạng thái không hợp lệ");
    }

    const existing = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Không tìm thấy danh mục");
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        hasSize: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ ok: true, item: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("UPDATE_PRODUCT_CATEGORY_STATUS_ERROR:", error);
    return serverError("Không thể cập nhật trạng thái danh mục");
  }
}