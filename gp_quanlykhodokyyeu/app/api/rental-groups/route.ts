import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildRentalGroupName,
  createRentalGroupSchema,
  rentalGroupQuerySchema,
} from "@/lib/rental-group-schemas";

async function validateRentalGroupRelations(input: {
  branchId: string;
  warehouseId: string;
  createdByUserId: string;
}) {
  const [branch, warehouse, user] = await Promise.all([
    prisma.branch.findUnique({
      where: { id: input.branchId },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    }),
    prisma.warehouse.findUnique({
      where: { id: input.warehouseId },
      select: {
        id: true,
        code: true,
        name: true,
        branchId: true,
        isActive: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: input.createdByUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        isActive: true,
      },
    }),
  ]);

  if (!branch || !branch.isActive) {
    return { error: "Chi nhánh không tồn tại hoặc đã ngưng hoạt động" };
  }

  if (!warehouse || !warehouse.isActive) {
    return { error: "Kho không tồn tại hoặc đã ngưng hoạt động" };
  }

  if (warehouse.branchId !== branch.id) {
    return { error: "Kho được chọn không thuộc chi nhánh đã chọn" };
  }

  if (!user || !user.isActive) {
    return { error: "Người tạo nhóm thuê không tồn tại hoặc đã ngưng hoạt động" };
  }

  return { branch, warehouse, user };
}

function buildShootDateRange(from?: Date, to?: Date) {
  if (!from && !to) return undefined;

  const gte = from
    ? new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
        0,
        0,
        0,
        0
      )
    : undefined;

  const lte = to
    ? new Date(
        to.getFullYear(),
        to.getMonth(),
        to.getDate(),
        23,
        59,
        59,
        999
      )
    : undefined;

  return {
    ...(gte ? { gte } : {}),
    ...(lte ? { lte } : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = rentalGroupQuerySchema.safeParse({
      q: searchParams.get("q"),
      branchId: searchParams.get("branchId"),
      warehouseId: searchParams.get("warehouseId"),
      status: searchParams.get("status") ?? undefined,
      shootDateFrom: searchParams.get("shootDateFrom"),
      shootDateTo: searchParams.get("shootDateTo"),
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Query không hợp lệ",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      q,
      branchId,
      warehouseId,
      status,
      shootDateFrom,
      shootDateTo,
      page,
      pageSize,
    } = parsed.data;

    const shootDateFilter = buildShootDateRange(shootDateFrom, shootDateTo);

    const where: Prisma.RentalGroupWhereInput = {
      ...(branchId ? { branchId } : {}),
      ...(warehouseId ? { warehouseId } : {}),
      ...(status ? { status } : {}),
      ...(shootDateFilter ? { shootDate: shootDateFilter } : {}),
      ...(q
        ? {
            OR: [
              { groupName: { contains: q, mode: "insensitive" } },
              { schoolName: { contains: q, mode: "insensitive" } },
              { groupCode: { contains: q, mode: "insensitive" } },
              { warehouse: { name: { contains: q, mode: "insensitive" } } },
              { warehouse: { code: { contains: q, mode: "insensitive" } } },
              { branch: { name: { contains: q, mode: "insensitive" } } },
              { branch: { code: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [rentalGroups, total] = await Promise.all([
      prisma.rentalGroup.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              renters: true,
              importBatches: true,
              allocationOrders: true,
            },
          },
        },
        orderBy: [{ shootDate: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.rentalGroup.count({ where }),
    ]);

    return NextResponse.json({
      rentalGroups,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/rental-groups error:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách nhóm thuê" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createRentalGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const validated = await validateRentalGroupRelations({
      branchId: data.branchId,
      warehouseId: data.warehouseId,
      createdByUserId: data.createdByUserId,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const normalizedGroupName = buildRentalGroupName(
      data.className,
      data.schoolName
    );

    if (data.groupName !== normalizedGroupName) {
      return NextResponse.json(
        {
          error: "Tên nhóm không đúng định dạng chuẩn",
        },
        { status: 400 }
      );
    }

    if (data.groupCode) {
      const existedGroupCode = await prisma.rentalGroup.findUnique({
        where: { groupCode: data.groupCode },
        select: { id: true },
      });

      if (existedGroupCode) {
        return NextResponse.json(
          { error: "Mã nhóm đã tồn tại" },
          { status: 409 }
        );
      }
    }

    const rentalGroup = await prisma.rentalGroup.create({
      data: {
        branchId: data.branchId,
        warehouseId: data.warehouseId,
        groupCode: data.groupCode ?? null,
        groupName: data.groupName,
        schoolName: data.schoolName,
        shootDate: data.shootDate,
        status: data.status,
        note: data.note ?? null,
        createdByUserId: data.createdByUserId,
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(rentalGroup, { status: 201 });
  } catch (error) {
    console.error("POST /api/rental-groups error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Mã nhóm hoặc dữ liệu unique đã tồn tại" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Không thể tạo nhóm thuê" },
      { status: 500 }
    );
  }
}