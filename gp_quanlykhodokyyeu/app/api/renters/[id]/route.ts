import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateRenterSchema } from "@/lib/renter-schemas";
import { suggestSizesForRenter } from "@/lib/size-rule-engine";

function normalizeWeightForPrisma(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function validateRenterRelations(input: {
  rentalGroupId: string;
  confirmedSizeId?: string | null;
}) {
  const rentalGroup = await prisma.rentalGroup.findUnique({
    where: { id: input.rentalGroupId },
    select: {
      id: true,
      groupName: true,
    },
  });

  if (!rentalGroup) {
    return { error: "Nhóm thuê không tồn tại" as const };
  }

  if (input.confirmedSizeId) {
    const confirmedSize = await prisma.size.findUnique({
      where: { id: input.confirmedSizeId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!confirmedSize || !confirmedSize.isActive) {
      return { error: "Size chốt không tồn tại hoặc đã ngưng hoạt động" as const };
    }
  }

  return { rentalGroup };
}

function mapRenterResponse<
  T extends {
    weightKg?: { toString(): string } | string | number | null;
    productSizes: Array<{
      id: string;
      rentalGroupProductId: string;
      rentalGroupProduct: {
        product: {
          id: string;
          code: string;
          name: string;
          gender: unknown;
        };
      };
      suggestedSize: {
        id: string;
        code: string;
        name: string;
        sortOrder: number;
      } | null;
      confirmedSize: {
        id: string;
        code: string;
        name: string;
        sortOrder: number;
      } | null;
      matchedRule: {
        id: string;
        priority: number;
        sizeId?: string | null;
      } | null;
      note?: string | null;
    }>;
  }
>(renter: T) {
  const firstProductSize = renter.productSizes[0] ?? null;

  return {
    ...renter,
    weightKg:
      renter.weightKg == null
        ? null
        : typeof renter.weightKg === "object" &&
          "toString" in renter.weightKg
        ? renter.weightKg.toString()
        : String(renter.weightKg),
    suggestedSize: firstProductSize?.suggestedSize ?? null,
    confirmedSize: firstProductSize?.confirmedSize ?? null,
    sizeAssignments: renter.productSizes.map((productSize) => ({
      id: productSize.id,
      rentalGroupProductId: productSize.rentalGroupProductId,
      product: productSize.rentalGroupProduct.product,
      suggestedSize: productSize.suggestedSize,
      confirmedSize: productSize.confirmedSize,
      matchedRule: productSize.matchedRule,
      note: productSize.note ?? null,
    })),
  };
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
        productSizes: {
          include: {
            rentalGroupProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    gender: true,
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
            matchedRule: {
              select: {
                id: true,
                priority: true,
                sizeId: true,
              },
            },
          },
          orderBy: {
            rentalGroupProduct: {
              sortOrder: "asc",
            },
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
      return NextResponse.json({ error: "Không tìm thấy người mặc" }, { status: 404 });
    }

    return NextResponse.json(mapRenterResponse(renter));
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
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy người mặc" }, { status: 404 });
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
    const nextConfirmedSizeId =
      data.confirmedSizeId !== undefined ? data.confirmedSizeId ?? null : undefined;

    const validated = await validateRenterRelations({
      rentalGroupId: nextRentalGroupId,
      confirmedSizeId: nextConfirmedSizeId ?? null,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.renter.update({
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
          ...(data.note !== undefined ? { note: data.note ?? null } : {}),
        },
      });

      if (
        data.rentalGroupId !== undefined &&
        data.rentalGroupId !== existing.rentalGroupId
      ) {
        const nextGroupProducts = await tx.rentalGroupProduct.findMany({
          where: {
            rentalGroupId: data.rentalGroupId,
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
          },
        });

        await tx.renterProductSize.deleteMany({
          where: {
            renterId: id,
          },
        });

        if (nextGroupProducts.length) {
          await tx.renterProductSize.createMany({
            data: nextGroupProducts.map((item, index) => ({
              renterId: id,
              rentalGroupProductId: item.id,
              confirmedSizeId: index === 0 ? data.confirmedSizeId ?? null : null,
            })),
          });
        }
      } else if (data.confirmedSizeId !== undefined) {
        const targetRows = await tx.renterProductSize.findMany({
          where: { renterId: id },
          orderBy: {
            rentalGroupProduct: { sortOrder: "asc" },
          },
          select: {
            id: true,
          },
        });

        const firstRow = targetRows[0] ?? null;

        if (firstRow) {
          await tx.renterProductSize.update({
            where: { id: firstRow.id },
            data: { confirmedSizeId: data.confirmedSizeId ?? null },
          });
        }
      }
    });

    const refreshed = await suggestSizesForRenter({ renterId: id });

    if (!refreshed) {
      return NextResponse.json(
        { error: "Không thể làm mới size gợi ý sau cập nhật" },
        { status: 500 }
      );
    }

    return NextResponse.json(mapRenterResponse(refreshed));
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