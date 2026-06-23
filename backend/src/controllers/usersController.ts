import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    include: { neighborhood: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { passwordHash: _, ...safe } = user;
  return res.json(safe);
}

export async function updateMe(req: AuthRequest, res: Response) {
  const { displayName, bio, avatarUrl, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { displayName, bio, avatarUrl, phone },
  });
  const { passwordHash: _, ...safe } = user;
  return res.json(safe);
}

export async function updatePushToken(req: AuthRequest, res: Response) {
  const { pushToken } = req.body;
  await prisma.user.update({ where: { id: req.userId! }, data: { pushToken } });
  return res.json({ message: 'Push token updated' });
}

export async function getNeighbors(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.neighborhoodId) return res.json([]);
  const neighbors = await prisma.user.findMany({
    where: { neighborhoodId: user.neighborhoodId, id: { not: req.userId! }, isActive: true },
    select: { id: true, displayName: true, avatarUrl: true, lat: true, lng: true },
    take: 100,
  });
  return res.json(neighbors);
}

export async function getUser(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, displayName: true, avatarUrl: true, bio: true, neighborhoodId: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
}
