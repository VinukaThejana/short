// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

// routers
import { protectedLinkRouter } from "./link";
import { unprotectedLinkRouter } from "./link";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("protectedLinks.", protectedLinkRouter)
  .merge("unprotectedLinks.", unprotectedLinkRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
