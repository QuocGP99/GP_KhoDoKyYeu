import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;

    const existing = await prisma.item.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy item" }, { status: 404 });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { isActive: isActive ?? !existing.isActive },
      select: { id: true, isActive: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/items/[id]/status error:", error);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái hoạt động" }, { status: 500 });
  }
}