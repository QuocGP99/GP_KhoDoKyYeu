import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { createSizeSchema } from "@/lib/size-schemas";

export async function GET() {
  try {
    await requireAdmin();

    const sizes = await prisma.size.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        code: true,
        name: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            productSizes: true,
            items: true,
            rentersSuggested: true,
            rentersConfirmed: true,
            sizeRules: true,
            allocationItems: true,
            stockAlertRules: true,
          },
        },
      },
    });

    return ok({ ok: true, items: sizes });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_SIZES_ERROR:", error);
    return serverError("Không thể lấy danh sách size");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createSizeSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingCode = await prisma.size.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return badRequest("Mã size đã tồn tại");
    }

    const size = await prisma.size.create({
      data: {
        code: data.code,
        name: data.name,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      select: {
        id: true,
        code: true,
        name: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ ok: true, item: size }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("CREATE_SIZE_ERROR:", error);
    return serverError("Không thể tạo size");
  }
}