import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { createUserSchema } from "@/lib/user-schemas";
import { badRequest, ok, serverError } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim();
    const isActive = searchParams.get("isActive")?.trim();

    const users = await prisma.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { fullName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          role ? { role: role as "ADMIN" | "STAFF" } : {},
          isActive !== null && isActive !== undefined && isActive !== ""
            ? { isActive: isActive === "true" }
            : {},
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ ok: true, items: users });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_USERS_ERROR:", error);
    return serverError("Không thể lấy danh sách user");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return badRequest("Email đã tồn tại");
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      return badRequest("Username đã tồn tại");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        username: data.username,
        passwordHash,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok({ ok: true, item: user }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("CREATE_USER_ERROR:", error);
    return serverError("Không thể tạo user");
  }
}