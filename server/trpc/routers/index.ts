import { topicRouter } from './topic';
import { voteRouter } from './vote';
import { roomRouter } from '~/server/trpc/routers/rooms';
import { userRouter } from '~/server/trpc/routers/users';
import { router } from '~/server/trpc/trpc';

export const appRouter = router({
  room: roomRouter,
  user: userRouter,
  topic: topicRouter,
  vote: voteRouter
});

// export type definition of API
export type AppRouter = typeof appRouter
