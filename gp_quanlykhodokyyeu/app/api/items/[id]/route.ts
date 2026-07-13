import { NextRequest, NextResponse } from "next/server";
import { Prisma, ReferenceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateItemSchema } from "@/lib/item-schemas";
import { createItemHistory } from "@/lib/item-history";

async function validateItemRelations(input: {
  productId: string;
  warehouseId: string;
  statusId: string;
  sizeId?: string | null;
}) {
  const [product, warehouse, status] = await Promise.all([
    prisma.product.findUnique({
      where: { id: input.productId },
      include: {
        productSizes: {
          include: { size: true },
        },
      },
    }),
    prisma.warehouse.findUnique({
      where: { id: input.warehouseId },
    }),
    prisma.itemStatus.findUnique({
      where: { id: input.statusId },
    }),
  ]);

  if (!product || !product.isActive) {
    return { error: "Sản phẩm không tồn tại hoặc đã ngưng hoạt động" };
  }

  if (!warehouse || !warehouse.isActive) {
    return { error: "Kho không tồn tại hoặc đã ngưng hoạt động" };
  }

  if (!status || !status.isActive) {
    return { error: "Trạng thái không tồn tại hoặc đã ngưng hoạt động" };
  }

  if (product.hasSize) {
    if (!input.sizeId) {
      return { error: "Sản phẩm này bắt buộc có size" };
    }

    const allowed = product.productSizes.some((ps) => ps.sizeId === input.sizeId);
    if (!allowed) {
      return { error: "Size không thuộc sản phẩm này" };
    }
  } else if (input.sizeId) {
    return { error: "Sản phẩm này không dùng size" };
  }

  return { product, warehouse, status };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
            productSizes: {
              include: {
                size: true,
              },
            },
          },
        },
        size: true,
        warehouse: {
          include: {
            branch: true,
          },
        },
        status: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Không tìm thấy item" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/items/[id] error:", error);
    return NextResponse.json({ error: "Không thể lấy chi tiết item" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = req.headers.get("x-user-id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Thiếu thông tin người dùng thao tác (x-user-id)" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await prisma.item.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy item" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const nextProductId = data.productId ?? existing.productId;
    const nextWarehouseId = data.warehouseId ?? existing.warehouseId;
    const nextStatusId = data.statusId ?? existing.statusId;
    const nextSizeId = data.sizeId !== undefined ? data.sizeId : existing.sizeId;

    const validated = await validateItemRelations({
      productId: nextProductId,
      warehouseId: nextWarehouseId,
      statusId: nextStatusId,
      sizeId: nextSizeId,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    if (data.itemCode) {
      const duplicateCode = await prisma.item.findFirst({
        where: {
          itemCode: data.itemCode,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateCode) {
        return NextResponse.json({ error: "item_code đã tồn tại" }, { status: 409 });
      }
    }

    if (data.barcode) {
      const duplicateBarcode = await prisma.item.findFirst({
        where: {
          barcode: data.barcode,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateBarcode) {
        return NextResponse.json({ error: "barcode đã tồn tại" }, { status: 409 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.item.update({
        where: { id },
        data: {
          ...(data.itemCode !== undefined ? { itemCode: data.itemCode ?? existing.itemCode } : {}),
          ...(data.productId !== undefined ? { productId: data.productId } : {}),
          ...(data.warehouseId !== undefined ? { warehouseId: data.warehouseId } : {}),
          ...(data.statusId !== undefined ? { statusId: data.statusId } : {}),
          ...(data.sizeId !== undefined ? { sizeId: data.sizeId ?? null } : {}),
          ...(data.barcode !== undefined ? { barcode: data.barcode ?? null } : {}),
          ...(data.condition !== undefined ? { condition: data.condition } : {}),
          ...(data.purchaseDate !== undefined ? { purchaseDate: data.purchaseDate ?? null } : {}),
          ...(data.note !== undefined ? { note: data.note ?? null } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });

      if (existing.statusId !== item.statusId) {
        await createItemHistory({
          tx,
          itemId: item.id,
          fromStatusId: existing.statusId,
          toStatusId: item.statusId,
          changedByUserId: currentUserId,
          reason: data.note ?? "Cập nhật trạng thái item",
          referenceType: ReferenceType.MANUAL,
          referenceId: item.id,
        });
      }

      return tx.item.findUniqueOrThrow({
        where: { id: item.id },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              hasSize: true,
              category: {
                select: { id: true, code: true, name: true },
              },
            },
          },
          size: {
            select: { id: true, code: true, name: true },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
          status: {
            select: { id: true, code: true, name: true, color: true },
          },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/items/[id] error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "item_code hoặc barcode đã tồn tại" }, { status: 409 });
    }

    return NextResponse.json({ error: "Không thể cập nhật item" }, { status: 500 });
  }
}