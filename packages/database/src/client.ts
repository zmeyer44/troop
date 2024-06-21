import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// @ts-ignore
export const prisma = global.prisma || new PrismaClient();

// @ts-ignore
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export * from "@prisma/client";
