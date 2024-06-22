import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { AuthUserType } from "@repo/database";
export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        pubkey: ctx.session.user.pubkey,
      },
    });
  }),
  getUserCalendars: protectedProcedure.query(async ({ ctx }) => {
    const roles = await ctx.prisma.authRole.findMany({
      where: {
        pubkey: ctx.session.user.pubkey,
        target: {
          type: AuthUserType.CALENDAR,
        },
      },
    });

    return ctx.prisma.calendar.findMany({
      where: {
        pubkey: {
          in: roles.map((r) => r.targetPubkey),
        },
      },
      include: {
        user: true,
      },
    });
  }),
});
