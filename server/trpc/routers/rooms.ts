import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '~/server/trpc/trpc';

export const roomRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        maxUsers: z.number()
      })
    )
    .query(async (ctx) => {
      const session = await ctx.ctx.session;
      if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
      }
      return ctx.ctx.prisma.room.create({
        data: {
          name: ctx.input.name,
          maxUsers: ctx.input.maxUsers
        }
      });
    }),
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query((ctx) => {
      return ctx.ctx.prisma.room.findUnique({
        where: { id: ctx.input.id }
      });
    })
});

// export type definition of API
export type RoomRouter = typeof roomRouter
