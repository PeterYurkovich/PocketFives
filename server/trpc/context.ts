import { inferAsyncReturnType } from '@trpc/server';
import type { H3Event } from 'h3';
import { getServerSession } from '#auth';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export function createContext (_event: H3Event) {
  return {
    prisma: _event.context.prisma,
    session: getServerSession(_event)
  };
}

export type Context = inferAsyncReturnType<typeof createContext>
