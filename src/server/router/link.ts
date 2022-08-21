import * as trpc from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { prisma } from "src/server/db/client";
import { createRouter } from "./context";

export const protectedLinkRouter = createProtectedRouter()
  .mutation("createLink", {
    input: z.object({
      url: z.string().url(),
      slug: z.string().min(3).max(15),
    }),
    async resolve({ ctx, input }) {
      if (!input) {
        throw new trpc.TRPCError({ code: "BAD_REQUEST" });
      }

      const { url, slug } = input;

      try {
        await prisma.links.create({
          data: {
            url: url,
            slug: slug,
            uid: ctx.session.user.id,
          },
        });
      } catch (error) {
        console.error(error);
        throw new trpc.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  })
  .mutation("deleteLink", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (!input) {
        throw new trpc.TRPCError({ code: "BAD_REQUEST" });
      }

      const { id } = input;

      try {
        const link = await prisma.links.findUnique({
          where: {
            id: id,
          },
        });

        if (!link) {
          throw new trpc.TRPCError({ code: "BAD_REQUEST" });
        }

        if (link.uid !== ctx.session.user.id) {
          throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
        }

        await prisma.links.delete({
          where: {
            id: id,
          },
        });
      } catch (error) {
        console.error(error);
        throw new trpc.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  })
  .mutation("checkSlug", {
    input: z.object({
      slug: z.string().min(3).max(15),
    }),
    async resolve({ input }) {
      if (!input) {
        throw new trpc.TRPCError({ code: "BAD_REQUEST" });
      }

      try {
        const link = await prisma.links.findUnique({
          where: {
            slug: input.slug,
          },
        });

        return link ? true : false;
      } catch (error) {
        console.error(error);
        throw new trpc.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

export const unprotectedLinkRouter = createRouter().query("getLinks", {
  input: z.object({
    limit: z.number().nullish(),
    cursor: z.string().nullish(),
  }),
  async resolve({ ctx, input }) {
    const limit = input.limit ?? 3;
    const { cursor } = input;
    const user = ctx.session?.user || null;

    if (!user) {
      return {
        links: [],
        nextCursor: undefined,
      };
    }

    const links = await prisma.links.findMany({
      take: limit + 1,
      where: {
        uid: user.id,
      },
      orderBy: {
        id: "desc",
      },
      cursor: cursor ? { id: cursor } : undefined,
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (links.length > limit) {
      const nextLink = links.pop();
      nextCursor = nextLink?.id;
    }

    return {
      links,
      nextCursor,
    };
  },
});
