import { authorize } from '@liveblocks/node';
// import getServerSessionWrapper from '~/server/utils/wrapSession';
import type { DefaultSession } from 'next-auth';
import { getServerSession } from '#auth';
const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
const API_KEY_WARNING = process.env.CODESANDBOX_SSE
  ? 'Add your secret key from https://liveblocks.io/dashboard/apikeys as the `LIVEBLOCKS_SECRET_KEY` secret in CodeSandbox.\n' +
    'Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nuxtjs-live-avatars#codesandbox.'
  : 'Create an `.env` file and add your secret key from https://liveblocks.io/dashboard/apikeys as the `LIVEBLOCKS_SECRET_KEY` environment variable.\n' +
    'Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nuxtjs-live-avatars#getting-started.';

interface IdSession extends DefaultSession {
  userId: number;
}

export default defineEventHandler(async (event) => {
  getServerSession(event);
  const sessionPromise = getServerSession(event) as Promise<IdSession | null>;
  const session = await sessionPromise;
  if (!session?.expires || new Date(session?.expires) < new Date() || !session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
  if (!API_KEY) {
    console.warn(API_KEY_WARNING);
    throw createError({ statusCode: 401, statusMessage: API_KEY_WARNING });
  }
  const body = await readBody(event);

  try {
    const authResponse = await authorize({
      room: body?.room,
      secret: API_KEY,
      userId: session.userId.toString()
    });
    setResponseStatus(event, 202);
    return authResponse.body;
  } catch (er) {
    throw createError({ statusCode: 403 });
  }
});
