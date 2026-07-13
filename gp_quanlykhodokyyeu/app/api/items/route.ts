import { NextRequest, NextResponse } from "next/server";
import { Prisma, ReferenceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createItemSchema, itemQuerySchema } from "@/lib/item-schemas";
import { createItemHistory } from "@/lib/item-history";

async function generateItemCode(params: {
  warehouseCode: string;
  productCode: string;
  sizeCode?: string | null;
}) {
  const prefix = [params.warehouseCode, params.productCode, params.sizeCode]
    .filter(Boolean)
    .join("-")
    .toUpperCase();

  for (let i = 0; i < 30; i++) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const itemCode = `${prefix}-${suffix}`;

    const exists = await prisma.item.findUnique({
      where: { itemCode },
      select: { id: true },
    });

    if (!exists) return itemCode;
  }

  throw new Error("Không thể tự sinh item_code duy nhất");
}

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
        category: true,
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = itemQuerySchema.safeParse({
      q: searchParams.get("q"),
      categoryId: searchParams.get("categoryId"),
      productId: searchParams.get("productId"),
      warehouseId: searchParams.get("warehouseId"),
      sizeId: searchParams.get("sizeId"),
      statusId: searchParams.get("statusId"),
      barcode: searchParams.get("barcode"),
      condition: searchParams.get("condition") ?? undefined,
      isActive: searchParams.get("isActive"),
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Query không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      q,
      categoryId,
      productId,
      warehouseId,
      sizeId,
      statusId,
      barcode,
      condition,
      isActive,
      page,
      pageSize,
    } = parsed.data;

    const where: Prisma.ItemWhereInput = {
      ...(productId ? { productId } : {}),
      ...(warehouseId ? { warehouseId } : {}),
      ...(sizeId ? { sizeId } : {}),
      ...(statusId ? { statusId } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(condition ? { condition } : {}),
      ...(barcode ? { barcode: { contains: barcode, mode: "insensitive" } } : {}),
      ...(categoryId
        ? {
            product: {
              categoryId,
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { itemCode: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
              { note: { contains: q, mode: "insensitive" } },
              { product: { name: { contains: q, mode: "insensitive" } } },
              { product: { code: { contains: q, mode: "insensitive" } } },
              { warehouse: { name: { contains: q, mode: "insensitive" } } },
              { warehouse: { code: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              hasSize: true,
              category: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json({ error: "Không thể lấy danh sách item" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Thiếu thông tin người dùng thao tác (x-user-id)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const validated = await validateItemRelations({
      productId: data.productId,
      warehouseId: data.warehouseId,
      statusId: data.statusId,
      sizeId: data.sizeId ?? null,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { product, warehouse } = validated;

    let itemCode = data.itemCode?.trim() || null;

    if (data.itemCodeMode === "AUTO") {
      const sizeCode =
        product.hasSize && data.sizeId
          ? product.productSizes.find((ps) => ps.sizeId === data.sizeId)?.size.code ?? null
          : null;

      itemCode = await generateItemCode({
        warehouseCode: warehouse.code,
        productCode: product.code,
        sizeCode,
      });
    }

    if (!itemCode) {
      return NextResponse.json({ error: "item_code không hợp lệ" }, { status: 400 });
    }

    const existedCode = await prisma.item.findUnique({
      where: { itemCode },
      select: { id: true },
    });

    if (existedCode) {
      return NextResponse.json({ error: "item_code đã tồn tại" }, { status: 409 });
    }

    if (data.barcode) {
      const existedBarcode = await prisma.item.findUnique({
        where: { barcode: data.barcode },
        select: { id: true },
      });

      if (existedBarcode) {
        return NextResponse.json({ error: "barcode đã tồn tại" }, { status: 409 });
      }
    }

    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.item.create({
        data: {
          itemCode,
          productId: data.productId,
          warehouseId: data.warehouseId,
          sizeId: data.sizeId ?? null,
          statusId: data.statusId,
          barcode: data.barcode ?? null,
          condition: data.condition,
          purchaseDate: data.purchaseDate ?? null,
          note: data.note ?? null,
          isActive: data.isActive ?? true,
        },
      });

      await createItemHistory({
        tx,
        itemId: created.id,
        fromStatusId: null,
        toStatusId: created.statusId,
        changedByUserId: currentUserId,
        reason: "Tạo item mới",
        referenceType: ReferenceType.MANUAL,
        referenceId: created.id,
      });

      return tx.item.findUniqueOrThrow({
        where: { id: created.id },
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/items error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "item_code hoặc barcode đã tồn tại" }, { status: 409 });
    }

    return NextResponse.json({ error: "Không thể tạo item" }, { status: 500 });
  }
}