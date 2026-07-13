import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  badRequest,
  ok,
  serverError,
} from "@/lib/api-response";
import {
  createBranchSchema,
} from "@/lib/branch-schemas";

export async function GET() {
  try {
    await requireAdmin();

    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            warehouses: true,
          },
        },
      },
    });

    return ok({ ok: true, items: branches });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_BRANCHES_ERROR:", error);
    return serverError("Không thể lấy danh sách chi nhánh");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createBranchSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingCode = await prisma.branch.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return badRequest("Mã chi nhánh đã tồn tại");
    }

    const branch = await prisma.branch.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address || "",
        phone: data.phone || "",
        isActive: data.isActive,
      },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ ok: true, item: branch }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("CREATE_BRANCH_ERROR:", error);
    return serverError("Không thể tạo chi nhánh");
  }
}