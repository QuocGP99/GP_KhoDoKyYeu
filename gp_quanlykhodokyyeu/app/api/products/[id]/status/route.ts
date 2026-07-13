import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateProductStatusSchema } from "@/lib/product-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateProductStatusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Trạng thái không hợp lệ");
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Không tìm thấy sản phẩm");
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
      },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        hasSize: true,
      },
    });

    return ok({ ok: true, item: updated });
  } catch (error) {
    console.error("UPDATE_PRODUCT_STATUS_ERROR:", error);
    return serverError("Không thể cập nhật trạng thái sản phẩm");
  }
}