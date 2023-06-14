import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { DefaultSession } from 'next-auth';
import { publicProcedure, router } from '~/server/trpc/trpc';

interface IdSession extends DefaultSession {
  userId: number;
}

export const topicRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        roomId: z.number(),
        vote: z.number()
      })
    )
    .query(async (ctx) => {
      const session = await ctx.ctx.session as IdSession | null;
      if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
      }
      const topic = await ctx.ctx.prisma.topic.create({
        data: {
          name: ctx.input.name,
          description: ctx.input.description,
          roomId: ctx.input.roomId
        }
      });
      return ctx.ctx.prisma.vote.create({
        data: {
          topicId: topic.id,
          userId: session.userId,
          vote: ctx.input.vote
        }
      });
    })
});

// export type definition of API
export type RoomRouter = typeof topicRouter
