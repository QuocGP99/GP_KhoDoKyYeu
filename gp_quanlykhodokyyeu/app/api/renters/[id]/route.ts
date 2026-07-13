import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateRenterSchema } from "@/lib/renter-schemas";

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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const renter = await prisma.renter.findUnique({
      where: { id },
      include: {
        rentalGroup: {
          select: {
            id: true,
            groupName: true,
            groupCode: true,
            schoolName: true,
            shootDate: true,
            status: true,
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        importBatch: {
          select: {
            id: true,
            fileName: true,
            status: true,
            createdAt: true,
            uploadedByUser: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
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
        allocationItems: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            returnedAt: true,
            returnNote: true,
            assignedSize: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            item: {
              select: {
                id: true,
                itemCode: true,
                barcode: true,
                status: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
                product: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
                size: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
            allocationOrder: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                warehouse: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!renter) {
      return NextResponse.json(
        { error: "Không tìm thấy người mặc" },
        { status: 404 }
      );
    }

    return NextResponse.json(renter);
  } catch (error) {
    console.error("GET /api/renters/[id] error:", error);
    return NextResponse.json(
      { error: "Không thể lấy chi tiết người mặc" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.renter.findUnique({
      where: { id },
      select: {
        id: true,
        rentalGroupId: true,
        studentCode: true,
        fullName: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        suggestedSizeId: true,
        confirmedSizeId: true,
        note: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy người mặc" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const parsed = updateRenterSchema.safeParse(body);

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

    const nextRentalGroupId = data.rentalGroupId ?? existing.rentalGroupId;
    const nextSuggestedSizeId =
      data.suggestedSizeId !== undefined
        ? data.suggestedSizeId
        : existing.suggestedSizeId;
    const nextConfirmedSizeId =
      data.confirmedSizeId !== undefined
        ? data.confirmedSizeId
        : existing.confirmedSizeId;

    const validated = await validateRenterRelations({
      rentalGroupId: nextRentalGroupId,
      suggestedSizeId: nextSuggestedSizeId ?? null,
      confirmedSizeId: nextConfirmedSizeId ?? null,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const renter = await prisma.renter.update({
      where: { id },
      data: {
        ...(data.rentalGroupId !== undefined
          ? { rentalGroupId: data.rentalGroupId }
          : {}),
        ...(data.studentCode !== undefined
          ? { studentCode: data.studentCode ?? null }
          : {}),
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.gender !== undefined ? { gender: data.gender ?? null } : {}),
        ...(data.heightCm !== undefined ? { heightCm: data.heightCm } : {}),
        ...(data.weightKg !== undefined
          ? { weightKg: normalizeWeightForPrisma(data.weightKg) }
          : {}),
        ...(data.suggestedSizeId !== undefined
          ? { suggestedSizeId: data.suggestedSizeId ?? null }
          : {}),
        ...(data.confirmedSizeId !== undefined
          ? { confirmedSizeId: data.confirmedSizeId ?? null }
          : {}),
        ...(data.note !== undefined ? { note: data.note ?? null } : {}),
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
    });

    return NextResponse.json(renter);
  } catch (error) {
    console.error("PATCH /api/renters/[id] error:", error);

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
      { error: "Không thể cập nhật người mặc" },
      { status: 500 }
    );
  }
}