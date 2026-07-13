import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { updateUserSchema } from "@/lib/user-schemas";
import { badRequest, notFound, serverError, ok } from "@/lib/api-response";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) return notFound("Không tìm thấy user");

    return ok({ ok: true, item: user });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("GET_USER_ERROR:", error);
    return serverError("Không thể lấy chi tiết user");
  }
}

export async function PATCH(req: Request, context: Context) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ");
    }

    const data = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFound("Không tìm thấy user");
    }

    if (data.email) {
      const sameEmail = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          NOT: { id },
        },
      });

      if (sameEmail) return badRequest("Email đã tồn tại");
    }

    if (data.username) {
      const sameUsername = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id },
        },
      });

      if (sameUsername) return badRequest("Username đã tồn tại");
    }

    if (currentUser.id === id && data.role === "STAFF") {
      return badRequest("Không thể tự đổi quyền của chính mình xuống STAFF");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.email !== undefined ? { email: data.email.toLowerCase() } : {}),
        ...(data.username !== undefined ? { username: data.username } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

    return ok({ ok: true, item: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    console.error("UPDATE_USER_ERROR:", error);
    return serverError("Không thể cập nhật user");
  }
}