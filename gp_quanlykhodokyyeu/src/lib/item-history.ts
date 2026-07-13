import { Prisma, ReferenceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateItemHistoryInput = {
  tx?: Prisma.TransactionClient;
  itemId: string;
  fromStatusId?: string | null;
  toStatusId: string;
  changedByUserId: string;
  reason?: string | null;
  referenceType?: ReferenceType | null;
  referenceId?: string | null;
};

export async function createItemHistory(input: CreateItemHistoryInput) {
  const db = input.tx ?? prisma;

  return db.itemStatusHistory.create({
    data: {
      itemId: input.itemId,
      fromStatusId: input.fromStatusId ?? null,
      toStatusId: input.toStatusId,
      changedByUserId: input.changedByUserId,
      reason: input.reason ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
    },
  });
}

export async function getItemHistories(itemId: string) {
  return prisma.itemStatusHistory.findMany({
    where: { itemId },
    include: {
      fromStatus: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },
      toStatus: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },
      changedByUser: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}