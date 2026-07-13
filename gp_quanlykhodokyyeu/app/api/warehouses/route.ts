import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { createWarehouseSchema } from "@/lib/warehouse-schemas";

export async function GET() {
  try {
    await requireAdmin();

    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: "desc" },
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

    return ok({ ok: true, items: warehouses });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_WAREHOUSES_ERROR:", error);
    return serverError("Không thể lấy danh sách kho");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createWarehouseSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingBranch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!existingBranch) {
      return badRequest("Chi nhánh không tồn tại");
    }

    const existingCode = await prisma.warehouse.findFirst({
      where: {
        branchId: data.branchId,
        code: data.code,
      },
    });

    if (existingCode) {
      return badRequest("Mã kho đã tồn tại trong chi nhánh này");
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        branchId: data.branchId,
        code: data.code,
        name: data.name,
        description: data.description || "",
        isActive: data.isActive,
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

    return ok({ ok: true, item: warehouse }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("CREATE_WAREHOUSE_ERROR:", error);
    return serverError("Không thể tạo kho");
  }
}