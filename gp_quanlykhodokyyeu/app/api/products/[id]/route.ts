import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateProductSchema } from "@/lib/product-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        code: true,
        name: true,
        gender: true,
        description: true,
        imageUrl: true,
        hasSize: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            hasSize: true,
          },
        },
        productSizes: {
          orderBy: {
            size: {
              sortOrder: "asc",
            },
          },
          select: {
            sizeId: true,
            size: {
              select: {
                id: true,
                code: true,
                name: true,
                sortOrder: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!product) {
      return notFound("Không tìm thấy sản phẩm");
    }

    return ok({ ok: true, item: product });
  } catch (error) {
    console.error("GET_PRODUCT_ERROR:", error);
    return serverError("Không thể lấy chi tiết sản phẩm");
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        productSizes: true,
      },
    });

    if (!existing) {
      return notFound("Không tìm thấy sản phẩm");
    }

    if (data.code) {
      const duplicated = await prisma.product.findFirst({
        where: {
          code: data.code,
          NOT: { id },
        },
      });

      if (duplicated) {
        return badRequest("Mã sản phẩm đã tồn tại");
      }
    }

    const nextCategoryId = data.categoryId ?? existing.categoryId;

    const category = await prisma.productCategory.findUnique({
      where: { id: nextCategoryId },
      select: {
        id: true,
        hasSize: true,
        isActive: true,
      },
    });

    if (!category) {
      return badRequest("Danh mục không tồn tại");
    }

    if (!category.isActive) {
      return badRequest("Danh mục đã ngưng hoạt động");
    }

    const nextSizeIds = data.sizeIds ?? existing.productSizes.map((x) => x.sizeId);

    if (category.hasSize && nextSizeIds.length === 0) {
      return badRequest("Sản phẩm thuộc danh mục có size phải chọn ít nhất 1 size");
    }

    if (!category.hasSize && nextSizeIds.length > 0) {
      return badRequest("Sản phẩm thuộc danh mục không size thì không được chọn size");
    }

    if (nextSizeIds.length > 0) {
      const validSizes = await prisma.size.count({
        where: {
          id: { in: nextSizeIds },
          isActive: true,
        },
      });

      if (validSizes !== nextSizeIds.length) {
        return badRequest("Có size không hợp lệ hoặc đã ngưng hoạt động");
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        hasSize: category.hasSize,
        productSizes: {
          deleteMany: {},
          ...(category.hasSize
            ? {
                create: nextSizeIds.map((sizeId) => ({
                  size: {
                    connect: { id: sizeId },
                  },
                })),
              }
            : {}),
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        gender: true,
        description: true,
        imageUrl: true,
        hasSize: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            code: true,
            name: true,
            hasSize: true,
          },
        },
        productSizes: {
          orderBy: {
            size: {
              sortOrder: "asc",
            },
          },
          select: {
            id: true,
            size: {
              select: {
                id: true,
                code: true,
                name: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });

    return ok({ ok: true, item: updated });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return serverError("Không thể cập nhật sản phẩm");
  }
}