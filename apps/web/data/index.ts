"use server";

import { prisma } from "@repo/database";

export const fetchPosts = async () => {
  return prisma.event.findMany();
};
