import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getItemHistories } from "@/lib/item-history";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const item = await prisma.item.findUnique({
      where: { id },
      select: {
        id: true,
        itemCode: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Không tìm thấy item" }, { status: 404 });
    }

    const histories = await getItemHistories(id);

    return NextResponse.json({
      item,
      histories,
    });
  } catch (error) {
    console.error("GET /api/items/[id]/history error:", error);
    return NextResponse.json(
      { error: "Không thể lấy lịch sử item" },
      { status: 500 }
    );
  }
}