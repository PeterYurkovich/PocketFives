import { PrismaClient } from '@prisma/client';

const yeetCreateUser = (client: PrismaClient, displayName: string, email: string) => {
  if (email === '') { throw new Error('Email cannot be empty'); }
  const user = client.user.upsert({
    where: { email },
    create: { displayName, email },
    update: { displayName, email }
  });
  return user;
};

export default yeetCreateUser;
