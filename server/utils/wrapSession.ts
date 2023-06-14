import type { H3Event } from 'h3';
import type { DefaultSession } from 'next-auth';
import { getServerSession } from '#auth';

export interface IdSession extends DefaultSession {
  userId: number;
}

const getServerSessionWrapper = (event: H3Event) => {
  const session = getServerSession(event) as Promise<IdSession | null>;

  return session;
};

export default getServerSessionWrapper;
