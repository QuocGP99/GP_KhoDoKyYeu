import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { updateUserStatusSchema } from "@/lib/user-schemas";
import { badRequest, notFound, ok, serverError } from "@/lib/api-response";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateUserStatusSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Trạng thái không hợp lệ");
    }

    if (currentUser.id === id && parsed.data.isActive === false) {
      return badRequest("Không thể tự khóa tài khoản của chính mình");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFound("Không tìm thấy user");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
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

    console.error("UPDATE_USER_STATUS_ERROR:", error);
    return serverError("Không thể cập nhật trạng thái user");
  }
}