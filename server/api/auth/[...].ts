import GithubProvider from 'next-auth/providers/github';
import { PrismaClient } from '@prisma/client';
import { DefaultSession, Awaitable } from 'next-auth';
import { NuxtAuthHandler } from '#auth';
import yeetCreateUser from '~/server/utils/createUser';

export interface IdSession extends DefaultSession {
  userId: number;
}

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      const isSignIn = !!user;
      if (isSignIn && user.name !== undefined && user.name !== null) {
        if (trigger === 'signUp' || trigger === 'signIn') {
          const dbUser = await yeetCreateUser(new PrismaClient(), user.name, user.email ?? '');
          token.id = dbUser.id;
          user.id = dbUser.id.toString();
        }
      }
      return token;
    },
    session: ({ session, token }): Awaitable<IdSession> => {
      const sessionWithId = session as IdSession;
      if (sessionWithId?.user) {
        sessionWithId.userId = token.id as number;
      } else {
        sessionWithId.userId = 0;
      }
      return sessionWithId;
    }
  }
});
