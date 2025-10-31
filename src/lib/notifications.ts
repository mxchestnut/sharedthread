import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type CreateNotificationInput = {
  userId: string;
  actorId?: string;
  type: 'COMMENT' | 'LIKE' | 'FOLLOW' | 'MENTION' | 'WORK' | 'SYSTEM';
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(input: CreateNotificationInput) {
  const { userId, actorId, type, message, link, metadata } = input;
  return prisma.notification.create({
    data: { userId, actorId, type, message, link, metadata },
  });
}

export async function listNotifications(params: {
  userId: string;
  filter?: 'all' | 'unread' | 'mentions' | 'interactions';
  take?: number;
  skip?: number;
}) {
  const { userId, filter = 'all', take = 50, skip = 0 } = params;

  const whereBase: Prisma.NotificationWhereInput = { userId };
  const where: Prisma.NotificationWhereInput = { ...whereBase };

  if (filter === 'unread') {
    where.read = false;
  } else if (filter === 'mentions') {
    where.type = 'MENTION';
  } else if (filter === 'interactions') {
    where.type = { in: ['COMMENT', 'LIKE'] };
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        type: true,
        message: true,
        link: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...whereBase, read: false } }),
  ]);

  return { items, total, unreadCount };
}

export async function markNotificationsRead(params: {
  userId: string;
  ids?: string[];
  all?: boolean;
}) {
  const { userId, ids, all } = params;
  if (all) {
    const res = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return res.count;
  }

  if (ids && ids.length > 0) {
    const res = await prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { read: true },
    });
    return res.count;
  }
  return 0;
}
