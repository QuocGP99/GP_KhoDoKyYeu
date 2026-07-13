import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { createProductCategorySchema } from "@/lib/product-category-schemas";

export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.productCategory.findMany({
      orderBy: { createdAt: "desc" },
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

    return ok({ ok: true, items: categories });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_PRODUCT_CATEGORIES_ERROR:", error);
    return serverError("Không thể lấy danh sách danh mục");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createProductCategorySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingCode = await prisma.productCategory.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return badRequest("Mã danh mục đã tồn tại");
    }

    const category = await prisma.productCategory.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || "",
        hasSize: data.hasSize,
        isActive: data.isActive,
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

    return ok({ ok: true, item: category }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("CREATE_PRODUCT_CATEGORY_ERROR:", error);
    return serverError("Không thể tạo danh mục");
  }
}