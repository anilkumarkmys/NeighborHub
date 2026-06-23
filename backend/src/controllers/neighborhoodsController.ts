import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listNeighborhoods(_req: AuthRequest, res: Response) {
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { isActive: true },
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' },
  });
  return res.json(neighborhoods.map(n => ({ ...n, memberCount: n._count.members })));
}

export async function myNeighborhood(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, include: { neighborhood: true } });
  if (!user?.neighborhood) return res.status(404).json({ message: 'Neighborhood not found' });
  const memberCount = await prisma.user.count({ where: { neighborhoodId: user.neighborhoodId! } });
  return res.json({ ...user.neighborhood, memberCount });
}
