import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";
import { updateWarehouseSchema } from "@/lib/warehouse-schemas";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      select: {
        id: true,
        branchId: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            items: true,
            users: true,
          },
        },
      },
    });

    if (!warehouse) {
      return notFound("Không tìm thấy kho");
    }

    return ok({ ok: true, item: warehouse });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_WAREHOUSE_ERROR:", error);
    return serverError("Không thể lấy chi tiết kho");
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateWarehouseSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existing = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound("Không tìm thấy kho");
    }

    const nextBranchId = data.branchId ?? existing.branchId;
    const nextCode = data.code ?? existing.code;

    if (data.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: data.branchId },
      });

      if (!branch) {
        return badRequest("Chi nhánh không tồn tại");
      }
    }

    const duplicated = await prisma.warehouse.findFirst({
      where: {
        branchId: nextBranchId,
        code: nextCode,
        NOT: { id },
      },
    });

    if (duplicated) {
      return badRequest("Mã kho đã tồn tại trong chi nhánh này");
    }

    const updated = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(data.branchId !== undefined ? { branchId: data.branchId } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      select: {
        id: true,
        branchId: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
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

    console.error("UPDATE_WAREHOUSE_ERROR:", error);
    return serverError("Không thể cập nhật kho");
  }
}