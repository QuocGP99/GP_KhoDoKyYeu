import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateSizeSchema } from "@/lib/size-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const size = await prisma.size.findUnique({
      where: { id },
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

    if (!size) {
      return notFound("Không tìm thấy size");
    }

    return ok({ ok: true, item: size });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_SIZE_ERROR:", error);
    return serverError("Không thể lấy chi tiết size");
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateSizeSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existing = await prisma.size.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Không tìm thấy size");
    }

    if (data.code) {
      const duplicated = await prisma.size.findFirst({
        where: {
          code: data.code,
          NOT: { id },
        },
      });

      if (duplicated) {
        return badRequest("Mã size đã tồn tại");
      }
    }

    const updated = await prisma.size.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

    return ok({ ok: true, item: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("UPDATE_SIZE_ERROR:", error);
    return serverError("Không thể cập nhật size");
  }
}