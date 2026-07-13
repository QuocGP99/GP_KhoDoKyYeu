import {NextRequest, NextResponse} from "next/server";
import {prisma} from "../../../src/lib/prisma";

function toDecimalValue(value: unknown) {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
}

export async function GET() {
    try{
        const items = await prisma.item.findMany({
            include: {
                product: true,
                warehouse: true,
                size: true,
                status: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { message: "Không lấy được danh sách sản phẩm", error },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            itemCode,
            barcode,
            productId,
            warehouseId,
            sizeId,
            statusId,
            condition,
            purchasePrice,
            rentalPrice,
            note,
            createdById,
            updatedById,
            isActive,
        } = body;
        if (!itemCode || !productId || !warehouseId || !statusId) {
            return NextResponse.json(
                { message: "Thiếu thông tin bắt buộc" },
                { status: 400 }
            );
        }
        const item = await prisma.item.create({
            data: {
                itemCode,
                barcode: barcode ?? null,
                productId,
                warehouseId,
                sizeId: sizeId ?? null,
                statusId,
                condition: condition ?? null,
                purchasePrice: toDecimalValue(purchasePrice),
                rentalPrice: toDecimalValue(rentalPrice),
                note: note ?? null,
                createdById: createdById ?? null,
                updatedById: updatedById ?? null,
                isActive: isActive ?? true,
            },
            include: {
                product: true,
                warehouse: true,
                size: true,
                status: true,
            },
        });
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Tạo sản phẩm thất bại", error },
            { status: 500 }
        );
    }
}
