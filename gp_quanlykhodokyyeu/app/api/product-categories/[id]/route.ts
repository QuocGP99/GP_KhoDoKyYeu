import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateProductCategorySchema } from "@/lib/product-category-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const category = await prisma.productCategory.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        hasSize: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            sizeRules: true,
          },
        },
      },
    });

    if (!category) {
      return notFound("Không tìm thấy danh mục");
    }

    return ok({ ok: true, item: category });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_PRODUCT_CATEGORY_ERROR:", error);
    return serverError("Không thể lấy chi tiết danh mục");
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateProductCategorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existing = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Không tìm thấy danh mục");
    }

    if (data.code) {
      const duplicated = await prisma.productCategory.findFirst({
        where: {
          code: data.code,
          NOT: { id },
        },
      });

      if (duplicated) {
        return badRequest("Mã danh mục đã tồn tại");
      }
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.hasSize !== undefined ? { hasSize: data.hasSize } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

    console.error("UPDATE_PRODUCT_CATEGORY_ERROR:", error);
    return serverError("Không thể cập nhật danh mục");
  }
}