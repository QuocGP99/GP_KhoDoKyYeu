import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildRentalGroupName,
  updateRentalGroupSchema,
} from "@/lib/rental-group-schemas";

async function validateRentalGroupRelations(input: {
  branchId: string;
  warehouseId: string;
}) {
  const [branch, warehouse] = await Promise.all([
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

  return { branch, warehouse };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const rentalGroup = await prisma.rentalGroup.findUnique({
      where: { id },
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
            branchId: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        importBatches: {
          select: {
            id: true,
            fileName: true,
            status: true,
            totalRows: true,
            successRows: true,
            errorRows: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        allocationOrders: {
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
            allocatedByUser: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            renters: true,
            importBatches: true,
            allocationOrders: true,
          },
        },
      },
    });

    if (!rentalGroup) {
      return NextResponse.json(
        { error: "Không tìm thấy nhóm thuê" },
        { status: 404 }
      );
    }

    return NextResponse.json(rentalGroup);
  } catch (error) {
    console.error("GET /api/rental-groups/[id] error:", error);
    return NextResponse.json(
      { error: "Không thể lấy chi tiết nhóm thuê" },
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

    const existing = await prisma.rentalGroup.findUnique({
      where: { id },
      select: {
        id: true,
        branchId: true,
        warehouseId: true,
        groupCode: true,
        groupName: true,
        schoolName: true,
        shootDate: true,
        status: true,
        note: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy nhóm thuê" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateRentalGroupSchema.safeParse(body);

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

    const nextBranchId = data.branchId ?? existing.branchId;
    const nextWarehouseId = data.warehouseId ?? existing.warehouseId;

    const validated = await validateRentalGroupRelations({
      branchId: nextBranchId,
      warehouseId: nextWarehouseId,
    });

    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    if (data.groupCode) {
      const duplicateGroupCode = await prisma.rentalGroup.findFirst({
        where: {
          groupCode: data.groupCode,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateGroupCode) {
        return NextResponse.json(
          { error: "Mã nhóm đã tồn tại" },
          { status: 409 }
        );
      }
    }

    let nextGroupName = existing.groupName;
    let nextSchoolName = existing.schoolName;

    if (data.className && data.schoolName) {
      nextGroupName = buildRentalGroupName(data.className, data.schoolName);
      nextSchoolName = data.schoolName.trim().replace(/\s+/g, " ");
    } else if (data.groupName) {
      nextGroupName = data.groupName.trim().replace(/\s+/g, " ");

      const matchedSchoolName = nextGroupName.match(/\-\s*Trường\s+(.+)$/i);
      if (matchedSchoolName?.[1]) {
        nextSchoolName = matchedSchoolName[1].trim();
      }
    } else if (data.schoolName) {
      nextSchoolName = data.schoolName.trim().replace(/\s+/g, " ");
    }

    const updated = await prisma.rentalGroup.update({
      where: { id },
      data: {
        ...(data.branchId !== undefined ? { branchId: data.branchId } : {}),
        ...(data.warehouseId !== undefined ? { warehouseId: data.warehouseId } : {}),
        ...(data.groupCode !== undefined ? { groupCode: data.groupCode ?? null } : {}),
        ...(nextGroupName !== existing.groupName ? { groupName: nextGroupName } : {}),
        ...(nextSchoolName !== existing.schoolName ? { schoolName: nextSchoolName } : {}),
        ...(data.shootDate !== undefined ? { shootDate: data.shootDate } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.note !== undefined ? { note: data.note ?? null } : {}),
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
            branchId: true,
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
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/rental-groups/[id] error:", error);

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
      { error: "Không thể cập nhật nhóm thuê" },
      { status: 500 }
    );
  }
}