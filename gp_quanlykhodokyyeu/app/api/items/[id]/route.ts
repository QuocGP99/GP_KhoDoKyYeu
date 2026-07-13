import {NextRequest, NextResponse} from "next/server";
import {prisma} from "../../../../src/lib/prisma";

type Context = {
    params: Promise<{ id: string }>;
};

function toDecimalValue(value: unknown) {
    if (value === null || value === undefined || value === "") return null;
    return Number(value);
}

export async function GET(_: NextRequest, {params}: Context) {
    try {
        const {id} = await params;

        const item = await prisma.item.findUnique({
            where: {id},
            include: {
                product: true,
                warehouse: true,
                size: true,
                status: true,
                createdBy: true,
                updatedBy: true,
            },
        });

        if (!item) {
            return NextResponse.json(
                {message: "Không tìm thấy sản phẩm"},
                {status: 404}
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json(
            {message: "Lấy chi tiết sản phẩm thất bại", error},
            {status: 500}
        );
    }
}

    export async function PUT(req: NextRequest, {params}: Context) {
        try {
            const {id} = await params;
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
                updatedById,
                isActive,
            } = body;

            const item = await prisma.item.update({
                where: {id},
                data: {
                    itemCode,
                    barcode: barcode ?? null,
                    productId,
                    warehouseId,
                    sizeId: sizeId ?? null,
                    statusId,
                    condition,
                    purchasePrice: toDecimalValue(purchasePrice),
                    rentalPrice: toDecimalValue(rentalPrice),
                    note: note ?? null,
                    updatedById: updatedById ?? null,
                    isActive,
                },
                include: {
                    product: true,
                    warehouse: true,
                    size: true,
                    status: true,
                },
            });
            return NextResponse.json(item);
        } catch (error) {
            return NextResponse.json(
                {message: "Cập nhật sản phẩm thất bại", error},
                {status: 500}
            );
        }
    }

    export async function DELETE(_: NextRequest, {params}: Context) {
        try {
            const {id} = await params;
                
            await prisma.item.delete({
                where: {id},
            });

            return NextResponse.json(
                {message: "Xóa sản phẩm thành công"});
                {status: 200}
            } catch (error) {
                return NextResponse.json(
                    {message: "Xóa sản phẩm thất bại", error},  
                    {status: 500}
                );
            }
        }
