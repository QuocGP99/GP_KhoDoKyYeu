import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createRenterSchema,
  renterQuerySchema,
} from "@/lib/renter-schemas";

async function validateRenterRelations(input: {
  rentalGroupId: string;
  suggestedSizeId?: string | null;
  confirmedSizeId?: string | null;
}) {
  const [rentalGroup, suggestedSize, confirmedSize] = await Promise.all([
    prisma.rentalGroup.findUnique({
      where: { id: input.rentalGroupId },
      select: {
        id: true,
        groupName: true,
      },
    }),
    input.suggestedSizeId
      ? prisma.size.findUnique({
          where: { id: input.suggestedSizeId },
          select: {
            id: true,
            code: true,
            name: true,
            isActive: true,
          },
        })
      : Promise.resolve(null),
    input.confirmedSizeId
      ? prisma.size.findUnique({
          where: { id: input.confirmedSizeId },
          select: {
            id: true,
            code: true,
            name: true,
            isActive: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!rentalGroup) {
    return { error: "Nhóm thuê không tồn tại" as const };
  }

  if (input.suggestedSizeId && (!suggestedSize || !suggestedSize.isActive)) {
    return { error: "Size gợi ý không tồn tại hoặc đã ngưng hoạt động" as const };
  }

  if (input.confirmedSizeId && (!confirmedSize || !confirmedSize.isActive)) {
    return { error: "Size chốt không tồn tại hoặc đã ngưng hoạt động" as const };
  }

  return {
    rentalGroup,
    suggestedSize,
    confirmedSize,
  };
}

function normalizeWeightForPrisma(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = renterQuerySchema.safeParse({
      q: searchParams.get("q"),
      rentalGroupId: searchParams.get("rentalGroupId"),
      gender: searchParams.get("gender") ?? undefined,
      suggestedSizeId: searchParams.get("suggestedSizeId"),
      confirmedSizeId: searchParams.get("confirmedSizeId"),
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
      rentalGroupId,
      gender,
      suggestedSizeId,
      confirmedSizeId,
      page,
      pageSize,
    } = parsed.data;

    const where: Prisma.RenterWhereInput = {
      ...(rentalGroupId ? { rentalGroupId } : {}),
      ...(gender ? { gender } : {}),
      ...(suggestedSizeId ? { suggestedSizeId } : {}),
      ...(confirmedSizeId ? { confirmedSizeId } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { studentCode: { contains: q, mode: "insensitive" } },
              {
                rentalGroup: {
                  groupName: { contains: q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    const [renters, total] = await Promise.all([
      prisma.renter.findMany({
        where,
        include: {
          rentalGroup: {
            select: {
              id: true,
              groupName: true,
              groupCode: true,
              schoolName: true,
              status: true,
            },
          },
          suggestedSize: {
            select: {
              id: true,
              code: true,
              name: true,
              sortOrder: true,
            },
          },
          confirmedSize: {
            select: {
              id: true,
              code: true,
              name: true,
              sortOrder: true,
            },
          },
          importBatch: {
            select: {
              id: true,
              fileName: true,
              status: true,
            },
          },
          _count: {
            select: {
              allocationItems: true,
            },
          },
        },
        orderBy: [{ rentalGroup: { groupName: "asc" } }, { fullName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.renter.count({ where }),
    ]);

    return NextResponse.json({
      renters,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/renters error:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách người mặc" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createRenterSchema.safeParse(body);

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

    const validated = await validateRenterRelations({
      rentalGroupId: data.rentalGroupId,
      suggestedSizeId: data.suggestedSizeId ?? null,
      confirmedSizeId: data.confirmedSizeId ?? null,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const renter = await prisma.renter.create({
      data: {
        rentalGroupId: data.rentalGroupId,
        studentCode: data.studentCode ?? null,
        fullName: data.fullName,
        gender: data.gender ?? null,
        heightCm: data.heightCm,
        weightKg: normalizeWeightForPrisma(data.weightKg),
        suggestedSizeId: data.suggestedSizeId ?? null,
        confirmedSizeId: data.confirmedSizeId ?? null,
        note: data.note ?? null,
      },
      include: {
        rentalGroup: {
          select: {
            id: true,
            groupName: true,
            groupCode: true,
            schoolName: true,
            status: true,
          },
        },
        suggestedSize: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },
        confirmedSize: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json(renter, { status: 201 });
  } catch (error) {
    console.error("POST /api/renters error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Dữ liệu người mặc bị trùng unique constraint" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Không thể tạo người mặc" },
      { status: 500 }
    );
  }
}