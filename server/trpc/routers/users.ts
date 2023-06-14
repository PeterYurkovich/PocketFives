import { z } from 'zod';
import { publicProcedure, router } from '~/server/trpc/trpc';
import yeetCreateUser from '~/server/utils/createUser';

export const userRouter = router({
  create: publicProcedure
    .input(
      z.object({
        displayName: z.string(),
        email: z.string()
      })
    )
    .query((ctx) => {
      return yeetCreateUser(ctx.ctx.prisma, ctx.input.displayName, ctx.input.email);
    })
});

// export type definition of API
export type UserRouter = typeof userRouter
