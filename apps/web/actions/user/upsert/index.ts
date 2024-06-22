"use server";
import { type User, prisma } from "@repo/database";

export async function upsertUser(
  userData: { pubkey: string; name: string } & Partial<User>,
) {
  return await prisma.user.upsert({
    where: {
      pubkey: userData.pubkey,
    },
    create: {
      ...userData,
    },
    update: {
      ...userData,
    },
  });
}
