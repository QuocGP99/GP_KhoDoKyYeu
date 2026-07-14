import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createRenterSchema,
  renterQuerySchema,
} from "@/lib/renter-schemas";
import { suggestSizesForRenter } from "@/lib/size-rule-engine";

function normalizeWeightForPrisma(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function validateRenterRelations(input: {
  rentalGroupId: string;
  confirmedSizeId?: string | null;
}) {
  const [rentalGroup, confirmedSize] = await Promise.all([
    prisma.rentalGroup.findUnique({
      where: { id: input.rentalGroupId },
      select: {
        id: true,
        groupName: true,
      },
    }),
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

  if (input.confirmedSizeId && (!confirmedSize || !confirmedSize.isActive)) {
    return { error: "Size chốt không tồn tại hoặc đã ngưng hoạt động" as const };
  }

  return {
    rentalGroup,
    confirmedSize,
  };
}

function mapRenterResponse<
  T extends {
    weightKg: { toString(): string } | string | number;
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
      typeof renter.weightKg === "object" &&
      renter.weightKg !== null &&
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
      ...(suggestedSizeId
        ? {
            productSizes: {
              some: {
                suggestedSizeId,
              },
            },
          }
        : {}),
      ...(confirmedSizeId
        ? {
            productSizes: {
              some: {
                confirmedSizeId,
              },
            },
          }
        : {}),
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

    const [rentersRaw, total] = await Promise.all([
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

    const renters = rentersRaw.map(mapRenterResponse);

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
      confirmedSizeId: data.confirmedSizeId ?? null,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const rentalGroupProducts = await prisma.rentalGroupProduct.findMany({
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

    const renter = await prisma.renter.create({
      data: {
        rentalGroupId: data.rentalGroupId,
        studentCode: data.studentCode ?? null,
        fullName: data.fullName,
        gender: data.gender ?? null,
        heightCm: data.heightCm,
        weightKg: normalizeWeightForPrisma(data.weightKg),
        note: data.note ?? null,
        productSizes: rentalGroupProducts.length
          ? {
              create: rentalGroupProducts.map((item, index) => ({
                rentalGroupProductId: item.id,
                confirmedSizeId: index === 0 ? data.confirmedSizeId ?? null : null,
              })),
            }
          : undefined,
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
      },
    });

    const refreshed = await suggestSizesForRenter({ renterId: renter.id });

    return NextResponse.json(
      mapRenterResponse(refreshed ?? renter),
      { status: 201 }
    );
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