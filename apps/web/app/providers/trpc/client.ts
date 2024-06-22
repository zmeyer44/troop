import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/lib/trpc/root";
import type * as _ from "@/node_modules/@trpc/react-query/dist/createTRPCReact";

export const trpc = createTRPCReact<AppRouter>({});
