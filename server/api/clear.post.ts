import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  await event.context.prisma.room.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  await event.context.prisma.user.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  await event.context.prisma.topic.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  await event.context.prisma.vote.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  return true;
});
