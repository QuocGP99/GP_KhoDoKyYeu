import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { createProductSchema } from "@/lib/product-schemas";

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
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
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    return ok({ ok: true, items: products });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_PRODUCTS_ERROR:", error);
    return serverError("Không thể lấy danh sách sản phẩm");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingCode = await prisma.product.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return badRequest("Mã sản phẩm đã tồn tại");
    }

    const category = await prisma.productCategory.findUnique({
      where: { id: data.categoryId },
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

    if (category.hasSize && data.sizeIds.length === 0) {
      return badRequest("Sản phẩm thuộc danh mục có size phải chọn ít nhất 1 size");
    }

    if (!category.hasSize && data.sizeIds.length > 0) {
      return badRequest("Sản phẩm thuộc danh mục không size thì không được chọn size");
    }

    if (data.sizeIds.length > 0) {
      const validSizes = await prisma.size.count({
        where: {
          id: { in: data.sizeIds },
          isActive: true,
        },
      });

      if (validSizes !== data.sizeIds.length) {
        return badRequest("Có size không hợp lệ hoặc đã ngưng hoạt động");
      }
    }

    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        code: data.code,
        name: data.name,
        gender: data.gender ?? null,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        hasSize: category.hasSize,
        isActive: data.isActive,
        productSizes: category.hasSize
          ? {
              create: data.sizeIds.map((sizeId) => ({
                size: {
                  connect: { id: sizeId },
                },
              })),
            }
          : undefined,
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

    return ok({ ok: true, item: product }, 201);
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR:", error);
    return serverError("Không thể tạo sản phẩm");
  }
}