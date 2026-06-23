import { Response } from 'express';
import { Expo } from 'expo-server-sdk';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const expo = new Expo();

export async function listNotifications(req: AuthRequest, res: Response) {
  const { page = 1, limit = 30 } = req.query;
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.notification.count({ where: { userId: req.userId!, isRead: false } }),
  ]);
  return res.json({ notifications, unreadCount });
}

export async function markRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.userId! },
    data: { isRead: true },
  });
  return res.json({ message: 'Marked as read' });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.userId!, isRead: false },
    data: { isRead: true },
  });
  return res.json({ message: 'All marked as read' });
}

export async function sendPushNotification(userIds: string[], title: string, body: string, data?: Record<string, unknown>) {
  const users = await prisma.user.findMany({ where: { id: { in: userIds }, pushToken: { not: null }, isActive: true } });
  const messages = users
    .filter(u => u.pushToken && Expo.isExpoPushToken(u.pushToken))
    .map(u => ({ to: u.pushToken!, title, body, data }));
  if (!messages.length) return;
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try { await expo.sendPushNotificationsAsync(chunk); } catch { /* non-fatal */ }
  }
}
