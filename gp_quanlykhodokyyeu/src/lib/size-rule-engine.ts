import { Prisma, Gender, ProductGender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

type MatchableRule = {
  id: string;
  productId: string;
  gender: Gender | null;
  sizeId: string;
  priority: number;
  minHeightCm: number | null;
  maxHeightCm: number | null;
  minWeightKg: Prisma.Decimal | null;
  maxWeightKg: Prisma.Decimal | null;
};

function toNumber(value: DecimalLike): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return Number(value.toString());
}

function isWithinRange(
  value: number | null,
  min: number | null,
  max: number | null
) {
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function scoreRule(params: {
  renterGender: Gender | null;
  productGender: ProductGender | null;
  heightCm: number | null;
  weightKg: number | null;
  rule: MatchableRule;
}) {
  const { renterGender, productGender, heightCm, weightKg, rule } = params;

  if (rule.gender && renterGender && rule.gender !== renterGender) {
    return null;
  }

  if (rule.gender && !renterGender) {
    return null;
  }

  const weightMin = toNumber(rule.minWeightKg);
  const weightMax = toNumber(rule.maxWeightKg);

  const heightMatched = isWithinRange(heightCm, rule.minHeightCm, rule.maxHeightCm);
  const weightMatched = isWithinRange(weightKg, weightMin, weightMax);

  if (!heightMatched || !weightMatched) {
    return null;
  }

  let score = 0;

  if (rule.gender && renterGender && rule.gender === renterGender) {
    score += 1000;
  }

  if (!rule.gender) {
    score += 100;
  }

  if (productGender && renterGender) {
    if (
      productGender === ProductGender.UNISEX ||
      (productGender === ProductGender.MALE && renterGender === Gender.MALE) ||
      (productGender === ProductGender.FEMALE && renterGender === Gender.FEMALE)
    ) {
      score += 50;
    }
  }

  score += Math.max(0, 100 - rule.priority);

  return score;
}

function pickBestRule(params: {
  renterGender: Gender | null;
  productGender: ProductGender | null;
  heightCm: number | null;
  weightKg: number | null;
  rules: MatchableRule[];
}) {
  const ranked = params.rules
    .map((rule) => ({
      rule,
      score: scoreRule({
        renterGender: params.renterGender,
        productGender: params.productGender,
        heightCm: params.heightCm,
        weightKg: params.weightKg,
        rule,
      }),
    }))
    .filter(
      (item): item is { rule: MatchableRule; score: number } =>
        item.score !== null
    )
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.rule.priority - b.rule.priority;
    });

  return ranked[0]?.rule ?? null;
}

async function getActiveRuleSetId(ruleSetId?: string) {
  if (ruleSetId) return ruleSetId;

  const defaultRuleSet = await prisma.sizeRuleSet.findFirst({
    where: {
      isActive: true,
      isDefault: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
    },
  });

  return defaultRuleSet?.id ?? null;
}

export async function suggestSizesForRenter(params: {
  renterId: string;
  ruleSetId?: string;
}) {
  const activeRuleSetId = await getActiveRuleSetId(params.ruleSetId);

  if (!activeRuleSetId) {
    throw new Error("Không tìm thấy bộ quy tắc size mặc định đang hoạt động.");
  }

  const renter = await prisma.renter.findUnique({
    where: { id: params.renterId },
    include: {
      rentalGroup: {
        select: {
          id: true,
        },
      },
      productSizes: {
        include: {
          rentalGroupProduct: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  gender: true,
                  hasSize: true,
                },
              },
            },
          },
          confirmedSize: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!renter) {
    throw new Error("Không tìm thấy người mặc.");
  }

  const rentalGroupProducts = await prisma.rentalGroupProduct.findMany({
    where: {
      rentalGroupId: renter.rentalGroupId,
      isActive: true,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          code: true,
          gender: true,
          hasSize: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const existingByGroupProductId = new Map(
    renter.productSizes.map((item) => [item.rentalGroupProductId, item])
  );

  const rules = await prisma.sizeRule.findMany({
    where: {
      ruleSetId: activeRuleSetId,
      isActive: true,
    },
    select: {
      id: true,
      productId: true,
      gender: true,
      sizeId: true,
      priority: true,
      minHeightCm: true,
      maxHeightCm: true,
      minWeightKg: true,
      maxWeightKg: true,
    },
    orderBy: [{ productId: "asc" }, { priority: "asc" }],
  });

  const rulesByProductId = new Map<string, MatchableRule[]>();
  for (const rule of rules) {
    const current = rulesByProductId.get(rule.productId) ?? [];
    current.push(rule);
    rulesByProductId.set(rule.productId, current);
  }

  const heightCm = renter.heightCm ?? null;
  const weightKg = toNumber(renter.weightKg);

  const updates: {
    rentalGroupProductId: string;
    suggestedSizeId: string | null;
    matchedRuleId: string | null;
  }[] = [];

  for (const groupProduct of rentalGroupProducts) {
    const product = groupProduct.product;

    if (!product.hasSize) {
      updates.push({
        rentalGroupProductId: groupProduct.id,
        suggestedSizeId: null,
        matchedRuleId: null,
      });
      continue;
    }

    const productRules = rulesByProductId.get(product.id) ?? [];
    const bestRule = pickBestRule({
      renterGender: renter.gender ?? null,
      productGender: product.gender ?? null,
      heightCm,
      weightKg,
      rules: productRules,
    });

    updates.push({
      rentalGroupProductId: groupProduct.id,
      suggestedSizeId: bestRule?.sizeId ?? null,
      matchedRuleId: bestRule?.id ?? null,
    });
  }

  await prisma.$transaction(
    updates.map((item) =>
      prisma.renterProductSize.upsert({
        where: {
          renterId_rentalGroupProductId: {
            renterId: renter.id,
            rentalGroupProductId: item.rentalGroupProductId,
          },
        },
        update: {
          suggestedSizeId: item.suggestedSizeId,
          matchedRuleId: item.matchedRuleId,
        },
        create: {
          renterId: renter.id,
          rentalGroupProductId: item.rentalGroupProductId,
          suggestedSizeId: item.suggestedSizeId,
          matchedRuleId: item.matchedRuleId,
        },
      })
    )
  );

  return prisma.renter.findUnique({
    where: { id: renter.id },
    include: {
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
}

export async function suggestSizesForRentalGroup(params: {
  rentalGroupId: string;
  ruleSetId?: string;
}) {
  const renters = await prisma.renter.findMany({
    where: {
      rentalGroupId: params.rentalGroupId,
    },
    select: {
      id: true,
    },
    orderBy: [{ rowNo: "asc" }, { fullName: "asc" }],
  });

  const results = [];
  for (const renter of renters) {
    const updated = await suggestSizesForRenter({
      renterId: renter.id,
      ruleSetId: params.ruleSetId,
    });
    results.push(updated);
  }

  return results;
}

export async function suggestSizesForRentalGroups(params: {
  rentalGroupIds: string[];
  ruleSetId?: string;
}) {
  const uniqueRentalGroupIds = Array.from(
    new Set(params.rentalGroupIds.map((id) => id.trim()).filter(Boolean))
  );

  const summary: {
    rentalGroupId: string;
    ok: boolean;
    renterCount: number;
    error: string | null;
  }[] = [];

  for (const rentalGroupId of uniqueRentalGroupIds) {
    try {
      const results = await suggestSizesForRentalGroup({
        rentalGroupId,
        ruleSetId: params.ruleSetId,
      });

      summary.push({
        rentalGroupId,
        ok: true,
        renterCount: results.length,
        error: null,
      });
    } catch (error) {
      summary.push({
        rentalGroupId,
        ok: false,
        renterCount: 0,
        error:
          error instanceof Error
            ? error.message
            : "Không thể tính size gợi ý cho nhóm thuê",
      });
    }
  }

  return {
    totalGroups: uniqueRentalGroupIds.length,
    successGroups: summary.filter((item) => item.ok).length,
    failedGroups: summary.filter((item) => !item.ok).length,
    results: summary,
  };
}