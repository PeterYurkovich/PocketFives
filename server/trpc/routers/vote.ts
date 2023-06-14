import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { DefaultSession } from 'next-auth';
import { publicProcedure, router } from '~/server/trpc/trpc';

interface IdSession extends DefaultSession {
  userId: number;
}

export const voteRouter = router({
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
      const topic = await ctx.ctx.prisma.topic.findFirst({
        where: {
          roomId: ctx.input.roomId,
          name: ctx.input.name,
          description: ctx.input.description
        }
      });
      if (!topic) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Topic not found' });
      }
      return ctx.ctx.prisma.vote.upsert({
        where: {
          userId_topicId: {
            userId: session.userId,
            topicId: topic.id
          }
        },
        create: {
          userId: session.userId,
          topicId: topic.id,
          vote: ctx.input.vote
        },
        update: {
          vote: ctx.input.vote
        }
      });
    })
});

// export type definition of API
export type RoomRouter = typeof voteRouter
