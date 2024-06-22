import { createTRPCRouter } from "@/lib/trpc/trpc";
import { userRouter } from "@/lib/trpc/router/userRouter";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
