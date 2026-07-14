import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, ProductGender, ItemCondition } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { suggestSizesForRenter } from "@/lib/size-rule-engine";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUsersAndAccess() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@khodo.vn" },
    update: {
      username: "admin01",
      fullName: "Quản trị viên",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email: "admin@khodo.vn",
      username: "admin01",
      fullName: "Quản trị viên",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@khodo.vn" },
    update: {
      username: "staff01",
      fullName: "Nhân viên kho",
      passwordHash,
      role: UserRole.STAFF,
      isActive: true,
    },
    create: {
      email: "staff@khodo.vn",
      username: "staff01",
      fullName: "Nhân viên kho",
      passwordHash,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  return { admin, staff };
}

async function seedBranchWarehouse() {
  const branch = await prisma.branch.upsert({
    where: { code: "DN" },
    update: {
      name: "Chi nhánh Đà Nẵng",
      address: "Đà Nẵng",
      phone: "0900000000",
      isActive: true,
    },
    create: {
      code: "DN",
      name: "Chi nhánh Đà Nẵng",
      address: "Đà Nẵng",
      phone: "0900000000",
      isActive: true,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: {
      branchId_code: {
        branchId: branch.id,
        code: "KHO-DN-01",
      },
    },
    update: {
      name: "Kho đồ Đà Nẵng",
      description: "Kho chính quản lý đồ kỷ yếu tại Đà Nẵng",
      isActive: true,
    },
    create: {
      branchId: branch.id,
      code: "KHO-DN-01",
      name: "Kho đồ Đà Nẵng",
      description: "Kho chính quản lý đồ kỷ yếu tại Đà Nẵng",
      isActive: true,
    },
  });

  return { branch, warehouse };
}

async function seedUserWarehouseAccess(params: {
  adminId: string;
  staffId: string;
  warehouseId: string;
}) {
  await prisma.userWarehouse.upsert({
    where: {
      userId_warehouseId: {
        userId: params.adminId,
        warehouseId: params.warehouseId,
      },
    },
    update: { isDefault: true },
    create: {
      userId: params.adminId,
      warehouseId: params.warehouseId,
      isDefault: true,
    },
  });

  await prisma.userWarehouse.upsert({
    where: {
      userId_warehouseId: {
        userId: params.staffId,
        warehouseId: params.warehouseId,
      },
    },
    update: { isDefault: true },
    create: {
      userId: params.staffId,
      warehouseId: params.warehouseId,
      isDefault: true,
    },
  });
}

async function seedCategories() {
  const shirt = await prisma.productCategory.upsert({
    where: { code: "SHIRT" },
    update: {
      name: "Áo",
      description: "Danh mục áo",
      isActive: true,
    },
    create: {
      code: "SHIRT",
      name: "Áo",
      description: "Danh mục áo",
      isActive: true,
    },
  });

  const pants = await prisma.productCategory.upsert({
    where: { code: "PANTS" },
    update: {
      name: "Quần",
      description: "Danh mục quần",
      isActive: true,
    },
    create: {
      code: "PANTS",
      name: "Quần",
      description: "Danh mục quần",
      isActive: true,
    },
  });

  const accessory = await prisma.productCategory.upsert({
    where: { code: "ACCESSORY" },
    update: {
      name: "Phụ kiện",
      description: "Danh mục phụ kiện",
      isActive: true,
    },
    create: {
      code: "ACCESSORY",
      name: "Phụ kiện",
      description: "Danh mục phụ kiện",
      isActive: true,
    },
  });

  return { shirt, pants, accessory };
}

async function seedSizes() {
  const s = await prisma.size.upsert({
    where: { code: "S" },
    update: { name: "S", sortOrder: 1, isActive: true },
    create: { code: "S", name: "S", sortOrder: 1, isActive: true },
  });

  const m = await prisma.size.upsert({
    where: { code: "M" },
    update: { name: "M", sortOrder: 2, isActive: true },
    create: { code: "M", name: "M", sortOrder: 2, isActive: true },
  });

  const l = await prisma.size.upsert({
    where: { code: "L" },
    update: { name: "L", sortOrder: 3, isActive: true },
    create: { code: "L", name: "L", sortOrder: 3, isActive: true },
  });

  const xl = await prisma.size.upsert({
    where: { code: "XL" },
    update: { name: "XL", sortOrder: 4, isActive: true },
    create: { code: "XL", name: "XL", sortOrder: 4, isActive: true },
  });

  return { s, m, l, xl };
}

async function seedProducts(params: {
  shirtCategoryId: string;
  pantsCategoryId: string;
  accessoryCategoryId: string;
}) {
  const shirtMale = await prisma.product.upsert({
    where: { code: "AO-SOMI-TRANG-NAM" },
    update: {
      categoryId: params.shirtCategoryId,
      name: "Áo sơ mi trắng nam",
      gender: ProductGender.MALE,
      description: "Áo sơ mi trắng nam dùng cho chụp kỷ yếu",
      isActive: true,
    },
    create: {
      code: "AO-SOMI-TRANG-NAM",
      categoryId: params.shirtCategoryId,
      name: "Áo sơ mi trắng nam",
      gender: ProductGender.MALE,
      description: "Áo sơ mi trắng nam dùng cho chụp kỷ yếu",
      isActive: true,
    },
  });

  const pantsMale = await prisma.product.upsert({
    where: { code: "QUAN-TAY-DEN-NAM" },
    update: {
      categoryId: params.pantsCategoryId,
      name: "Quần tây đen nam",
      gender: ProductGender.MALE,
      description: "Quần tây đen nam dùng cho chụp kỷ yếu",
      isActive: true,
    },
    create: {
      code: "QUAN-TAY-DEN-NAM",
      categoryId: params.pantsCategoryId,
      name: "Quần tây đen nam",
      gender: ProductGender.MALE,
      description: "Quần tây đen nam dùng cho chụp kỷ yếu",
      isActive: true,
    },
  });

  const shirtFemale = await prisma.product.upsert({
    where: { code: "AO-SOMI-TRANG-NU" },
    update: {
      categoryId: params.shirtCategoryId,
      name: "Áo sơ mi trắng nữ",
      gender: ProductGender.FEMALE,
      description: "Áo sơ mi trắng nữ dùng cho chụp kỷ yếu",
      isActive: true,
    },
    create: {
      code: "AO-SOMI-TRANG-NU",
      categoryId: params.shirtCategoryId,
      name: "Áo sơ mi trắng nữ",
      gender: ProductGender.FEMALE,
      description: "Áo sơ mi trắng nữ dùng cho chụp kỷ yếu",
      isActive: true,
    },
  });

  const tie = await prisma.product.upsert({
    where: { code: "PHU-KIEN-CAVAT" },
    update: {
      categoryId: params.accessoryCategoryId,
      name: "Cà vạt",
      gender: ProductGender.UNISEX,
      description: "Phụ kiện cà vạt",
      isActive: true,
    },
    create: {
      code: "PHU-KIEN-CAVAT",
      categoryId: params.accessoryCategoryId,
      name: "Cà vạt",
      gender: ProductGender.UNISEX,
      description: "Phụ kiện cà vạt",
      isActive: true,
    },
  });

  return { shirtMale, pantsMale, shirtFemale, tie };
}

async function seedProductSizes(params: {
  productId: string;
  sizeIds: { s: string; m: string; l: string; xl: string };
}) {
  const rows = [
    { productId: params.productId, sizeId: params.sizeIds.s, isDefault: false },
    { productId: params.productId, sizeId: params.sizeIds.m, isDefault: true },
    { productId: params.productId, sizeId: params.sizeIds.l, isDefault: false },
    { productId: params.productId, sizeId: params.sizeIds.xl, isDefault: false },
  ];

  for (const row of rows) {
    await prisma.productSize.upsert({
      where: {
        productId_sizeId: {
          productId: row.productId,
          sizeId: row.sizeId,
        },
      },
      update: { isDefault: row.isDefault },
      create: row,
    });
  }
}

async function seedItemStatuses() {
  const definitions = [
    { code: "AVAILABLE", name: "Sẵn sàng", color: "#22c55e" },
    { code: "RESERVED", name: "Đã giữ", color: "#f59e0b" },
    { code: "RENTED", name: "Đang cho thuê", color: "#3b82f6" },
    { code: "INACTIVE", name: "Ngưng sử dụng", color: "#6b7280" },
    { code: "DIRTY", name: "Bẩn", color: "#a855f7" },
    { code: "DAMAGED", name: "Hỏng", color: "#ef4444" },
    { code: "LOST", name: "Thất lạc", color: "#991b1b" },
  ] as const;

  const statuses: Record<string, { id: string; code: string }> = {};

  for (const s of definitions) {
    const status = await prisma.itemStatus.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        color: s.color,
        isActive: true,
      },
      create: {
        code: s.code,
        name: s.name,
        color: s.color,
        isActive: true,
      },
    });

    statuses[s.code] = { id: status.id, code: status.code };
  }

  return statuses;
}

async function seedItems(params: {
  warehouseId: string;
  statusAvailableId: string;
  products: {
    shirtMaleId: string;
    pantsMaleId: string;
    shirtFemaleId: string;
    tieId: string;
  };
  sizes: {
    s: string;
    m: string;
    l: string;
    xl: string;
  };
}) {
  const rows = [
    { itemCode: "ASM-S-001", productId: params.products.shirtMaleId, sizeId: params.sizes.s, note: "Áo sơ mi nam size S" },
    { itemCode: "ASM-M-001", productId: params.products.shirtMaleId, sizeId: params.sizes.m, note: "Áo sơ mi nam size M" },
    { itemCode: "ASM-L-001", productId: params.products.shirtMaleId, sizeId: params.sizes.l, note: "Áo sơ mi nam size L" },
    { itemCode: "QTN-M-001", productId: params.products.pantsMaleId, sizeId: params.sizes.m, note: "Quần tây nam size M" },
    { itemCode: "QTN-L-001", productId: params.products.pantsMaleId, sizeId: params.sizes.l, note: "Quần tây nam size L" },
    { itemCode: "ASN-S-001", productId: params.products.shirtFemaleId, sizeId: params.sizes.s, note: "Áo sơ mi nữ size S" },
    { itemCode: "ASN-M-001", productId: params.products.shirtFemaleId, sizeId: params.sizes.m, note: "Áo sơ mi nữ size M" },
    { itemCode: "PK-CAVAT-001", productId: params.products.tieId, sizeId: null, note: "Cà vạt phụ kiện" },
  ];

  for (const row of rows) {
    await prisma.item.upsert({
      where: { itemCode: row.itemCode },
      update: {
        productId: row.productId,
        warehouseId: params.warehouseId,
        sizeId: row.sizeId,
        statusId: params.statusAvailableId,
        condition: ItemCondition.GOOD,
        note: row.note,
        isActive: true,
      },
      create: {
        itemCode: row.itemCode,
        productId: row.productId,
        warehouseId: params.warehouseId,
        sizeId: row.sizeId,
        statusId: params.statusAvailableId,
        condition: ItemCondition.GOOD,
        note: row.note,
        isActive: true,
      },
    });
  }
}

async function seedSizeRuleSetAndRules(params: {
  shirtMaleProductId: string;
  shirtFemaleProductId: string;
  sizeIds: { s: string; m: string; l: string; xl: string };
}) {
  const ruleSet = await prisma.sizeRuleSet.upsert({
    where: { id: "default-size-rule-set" },
    update: {
      name: "Bộ quy tắc mặc định",
      description: "Gợi ý size theo chiều cao và cân nặng",
      isActive: true,
      isDefault: true,
    },
    create: {
      id: "default-size-rule-set",
      name: "Bộ quy tắc mặc định",
      description: "Gợi ý size theo chiều cao và cân nặng",
      isActive: true,
      isDefault: true,
    },
  });

  const rules = [
    { gender: "MALE" as const, productId: params.shirtMaleProductId, minHeightCm: 150, maxHeightCm: 164, minWeightKg: "40", maxWeightKg: "54.99", sizeId: params.sizeIds.s, priority: 1 },
    { gender: "MALE" as const, productId: params.shirtMaleProductId, minHeightCm: 165, maxHeightCm: 171, minWeightKg: "55", maxWeightKg: "64.99", sizeId: params.sizeIds.m, priority: 2 },
    { gender: "MALE" as const, productId: params.shirtMaleProductId, minHeightCm: 172, maxHeightCm: 178, minWeightKg: "65", maxWeightKg: "74.99", sizeId: params.sizeIds.l, priority: 3 },
    { gender: "MALE" as const, productId: params.shirtMaleProductId, minHeightCm: 179, maxHeightCm: 190, minWeightKg: "75", maxWeightKg: "100", sizeId: params.sizeIds.xl, priority: 4 },
    { gender: "FEMALE" as const, productId: params.shirtFemaleProductId, minHeightCm: 145, maxHeightCm: 156, minWeightKg: "35", maxWeightKg: "46.99", sizeId: params.sizeIds.s, priority: 5 },
    { gender: "FEMALE" as const, productId: params.shirtFemaleProductId, minHeightCm: 157, maxHeightCm: 163, minWeightKg: "47", maxWeightKg: "54.99", sizeId: params.sizeIds.m, priority: 6 },
    { gender: "FEMALE" as const, productId: params.shirtFemaleProductId, minHeightCm: 164, maxHeightCm: 170, minWeightKg: "55", maxWeightKg: "64.99", sizeId: params.sizeIds.l, priority: 7 },
    { gender: "FEMALE" as const, productId: params.shirtFemaleProductId, minHeightCm: 171, maxHeightCm: 185, minWeightKg: "65", maxWeightKg: "100", sizeId: params.sizeIds.xl, priority: 8 },
  ];

  for (const rule of rules) {
    await prisma.sizeRule.create({
      data: {
        ruleSetId: ruleSet.id,
        gender: rule.gender,
        productId: rule.productId,
        minHeightCm: rule.minHeightCm,
        maxHeightCm: rule.maxHeightCm,
        minWeightKg: rule.minWeightKg,
        maxWeightKg: rule.maxWeightKg,
        sizeId: rule.sizeId,
        priority: rule.priority,
      },
    }).catch(() => null);
  }

  return ruleSet;
}

async function seedStockAlertRules(params: {
  warehouseId: string;
  productIds: { shirtMaleId: string; pantsMaleId: string };
  sizeIds: { m: string; l: string };
}) {
  const rules = [
    {
      warehouseId: params.warehouseId,
      productId: params.productIds.shirtMaleId,
      sizeId: params.sizeIds.m,
      minGreenQty: 5,
      minYellowQty: 2,
    },
    {
      warehouseId: params.warehouseId,
      productId: params.productIds.pantsMaleId,
      sizeId: params.sizeIds.l,
      minGreenQty: 5,
      minYellowQty: 2,
    },
  ];

  for (const rule of rules) {
    await prisma.stockAlertRule.create({ data: rule }).catch(() => null);
  }
}

async function seedRentalDemo(params: {
  branchId: string;
  warehouseId: string;
  adminId: string;
  staffId: string;
  sizeMId: string;
  shirtMaleProductId: string;
  shirtFemaleProductId: string;
}) {

  const group = await prisma.rentalGroup.upsert({
    where: { groupCode: "12A1-THPT-ABC-2026" },
    update: {
      groupName: "12A1 - THPT ABC - 2026",
      schoolName: "THPT ABC",
      status: "DRAFT",
      note: "Phiếu thuê demo",
      warehouseId: params.warehouseId,
      branchId: params.branchId,
      createdByUserId: params.adminId,
    },
    create: {
      groupCode: "12A1-THPT-ABC-2026",
      groupName: "12A1 - THPT ABC - 2026",
      schoolName: "THPT ABC",
      status: "DRAFT",
      note: "Phiếu thuê demo",
      warehouseId: params.warehouseId,
      branchId: params.branchId,
      createdByUserId: params.adminId,
    },
  });

  const shirtMaleRgp = await prisma.rentalGroupProduct.upsert({
    where: {
      rentalGroupId_productId: {
        rentalGroupId: group.id,
        productId: params.shirtMaleProductId,
      },
    },
    update: {
      quantityPlan: 1,
      isActive: true,
      sortOrder: 1,
      note: "Áo sơ mi nam demo",
    },
    create: {
      rentalGroupId: group.id,
      productId: params.shirtMaleProductId,
      quantityPlan: 1,
      isActive: true,
      sortOrder: 1,
      note: "Áo sơ mi nam demo",
    },
  });

  const shirtFemaleRgp = await prisma.rentalGroupProduct.upsert({
    where: {
      rentalGroupId_productId: {
        rentalGroupId: group.id,
        productId: params.shirtFemaleProductId,
      },
    },
    update: {
      quantityPlan: 1,
      isActive: true,
      sortOrder: 2,
      note: "Áo sơ mi nữ demo",
    },
    create: {
      rentalGroupId: group.id,
      productId: params.shirtFemaleProductId,
      quantityPlan: 1,
      isActive: true,
      sortOrder: 2,
      note: "Áo sơ mi nữ demo",
    },
  });

  const existingBatch = await prisma.importBatch.findFirst({
    where: {
      rentalGroupId: group.id,
      fileName: "lop-12a1-demo.xlsx",
    },
  });

  const batch =
    existingBatch ??
    (await prisma.importBatch.create({
      data: {
        rentalGroupId: group.id,
        uploadedByUserId: params.staffId,
        fileName: "lop-12a1-demo.xlsx",
        totalRows: 2,
        successRows: 2,
        errorRows: 0,
        status: "COMPLETED",
        finishedAt: new Date(),
      },
    }));

  const renter1 =
    (await prisma.renter.findFirst({
      where: { rentalGroupId: group.id, rowNo: 1 },
    })) ??
    (await prisma.renter.create({
      data: {
        rentalGroupId: group.id,
        importBatchId: batch.id,
        rowNo: 1,
        studentCode: "12A1-001",
        fullName: "Nguyễn Văn A",
        gender: "MALE",
        heightCm: 170,
        weightKg: "60",
      },
    }));

  const renter2 =
    (await prisma.renter.findFirst({
      where: { rentalGroupId: group.id, rowNo: 2 },
    })) ??
    (await prisma.renter.create({
      data: {
        rentalGroupId: group.id,
        importBatchId: batch.id,
        rowNo: 2,
        studentCode: "12A1-002",
        fullName: "Trần Thị B",
        gender: "FEMALE",
        heightCm: 160,
        weightKg: "50",
      },
    }));

  await prisma.renterProductSize.upsert({
    where: {
      renterId_rentalGroupProductId: {
        renterId: renter1.id,
        rentalGroupProductId: shirtMaleRgp.id,
      },
    },
    update: {
      confirmedSizeId: params.sizeMId,
      note: "Size demo nam",
    },
    create: {
      renterId: renter1.id,
      rentalGroupProductId: shirtMaleRgp.id,
      confirmedSizeId: params.sizeMId,
      note: "Size demo nam",
    },
  });

  await prisma.renterProductSize.upsert({
    where: {
      renterId_rentalGroupProductId: {
        renterId: renter2.id,
        rentalGroupProductId: shirtFemaleRgp.id,
      },
    },
    update: {
      confirmedSizeId: params.sizeMId,
      note: "Size demo nữ",
    },
    create: {
      renterId: renter2.id,
      rentalGroupProductId: shirtFemaleRgp.id,
      confirmedSizeId: params.sizeMId,
      note: "Size demo nữ",
    },
  });

  const existingAllocationOrder = await prisma.allocationOrder.findFirst({
    where: {
      rentalGroupId: group.id,
      warehouseId: params.warehouseId,
      note: "Phiếu cấp phát demo",
    },
  });

  const allocationOrder =
    existingAllocationOrder ??
    (await prisma.allocationOrder.create({
      data: {
        rentalGroupId: group.id,
        warehouseId: params.warehouseId,
        allocatedByUserId: params.staffId,
        status: "DRAFT",
        note: "Phiếu cấp phát demo",
      },
    }));

  await prisma.auditLog.createMany({
    data: [
      {
        userId: params.adminId,
        action: "SEED_INIT",
        entityType: "RENTAL_GROUP",
        entityId: group.id,
        newData: { groupCode: group.groupCode, status: group.status },
      },
      {
        userId: params.staffId,
        action: "SEED_IMPORT",
        entityType: "IMPORT_BATCH",
        entityId: batch.id,
        newData: { fileName: batch.fileName, totalRows: batch.totalRows },
      },
      {
        userId: params.staffId,
        action: "SEED_ALLOCATION_ORDER",
        entityType: "ALLOCATION_ORDER",
        entityId: allocationOrder.id,
        newData: { status: allocationOrder.status },
      },
    ],
  });

  return { group, batch, renter1, renter2, allocationOrder };
}

async function main() {
  const { admin, staff } = await seedUsersAndAccess();
  const { branch, warehouse } = await seedBranchWarehouse();

  await seedUserWarehouseAccess({
    adminId: admin.id,
    staffId: staff.id,
    warehouseId: warehouse.id,
  });

  const categories = await seedCategories();
  const sizes = await seedSizes();
  const statuses = await seedItemStatuses();

  const products = await seedProducts({
    shirtCategoryId: categories.shirt.id,
    pantsCategoryId: categories.pants.id,
    accessoryCategoryId: categories.accessory.id,
  });

  await seedProductSizes({
    productId: products.shirtMale.id,
    sizeIds: { s: sizes.s.id, m: sizes.m.id, l: sizes.l.id, xl: sizes.xl.id },
  });

  await seedProductSizes({
    productId: products.pantsMale.id,
    sizeIds: { s: sizes.s.id, m: sizes.m.id, l: sizes.l.id, xl: sizes.xl.id },
  });

  await seedProductSizes({
    productId: products.shirtFemale.id,
    sizeIds: { s: sizes.s.id, m: sizes.m.id, l: sizes.l.id, xl: sizes.xl.id },
  });

  await seedItems({
    warehouseId: warehouse.id,
    statusAvailableId: statuses.AVAILABLE.id,
    products: {
      shirtMaleId: products.shirtMale.id,
      pantsMaleId: products.pantsMale.id,
      shirtFemaleId: products.shirtFemale.id,
      tieId: products.tie.id,
    },
    sizes: {
      s: sizes.s.id,
      m: sizes.m.id,
      l: sizes.l.id,
      xl: sizes.xl.id,
    },
  });

  await seedSizeRuleSetAndRules({
    shirtMaleProductId: products.shirtMale.id,
    shirtFemaleProductId: products.shirtFemale.id,
    sizeIds: {
      s: sizes.s.id,
      m: sizes.m.id,
      l: sizes.l.id,
      xl: sizes.xl.id,
    },
  });

  await seedStockAlertRules({
    warehouseId: warehouse.id,
    productIds: {
      shirtMaleId: products.shirtMale.id,
      pantsMaleId: products.pantsMale.id,
    },
    sizeIds: {
      m: sizes.m.id,
      l: sizes.l.id,
    },
  });

  const demo = await seedRentalDemo({
    branchId: branch.id,
    warehouseId: warehouse.id,
    adminId: admin.id,
    staffId: staff.id,
    sizeMId: sizes.m.id,
    shirtMaleProductId: products.shirtMale.id,
    shirtFemaleProductId: products.shirtFemale.id,
  });

  console.log("Seed hoàn tất");
  console.log("Admin: admin@khodo.vn / 123456");
  console.log("Staff: staff@khodo.vn / 123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });