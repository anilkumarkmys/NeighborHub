import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listListings(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, category, condition } = req.query;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  const where = {
    neighborhoodId: user?.neighborhoodId || undefined,
    status: 'active' as const,
    ...(category ? { category: category as string } : {}),
    ...(condition ? { condition: condition as string } : {}),
  };
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { seller: { select: { id: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.listing.count({ where }),
  ]);
  return res.json({ listings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
}

export async function createListing(req: AuthRequest, res: Response) {
  const { title, description, price, category, condition, images, isFree, isNegotiable } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.neighborhoodId) return res.status(400).json({ message: 'Address not verified' });
  const listing = await prisma.listing.create({
    data: { title, description, price: parseFloat(price) || 0, category, condition, images: images || [], isFree, isNegotiable, sellerId: req.userId!, neighborhoodId: user.neighborhoodId, status: 'active' },
    include: { seller: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.status(201).json(listing);
}

export async function getListing(req: AuthRequest, res: Response) {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { seller: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  return res.json(listing);
}

export async function updateListing(req: AuthRequest, res: Response) {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.sellerId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.listing.update({ where: { id: req.params.id }, data: req.body });
  return res.json(updated);
}

export async function deleteListing(req: AuthRequest, res: Response) {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.sellerId !== req.userId && req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'removed' } });
  return res.json({ message: 'Listing removed' });
}

export async function contactSeller(req: AuthRequest, res: Response) {
  const { message } = req.body;
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  let conversation = await prisma.conversation.findFirst({
    where: { listingId: req.params.id, participants: { every: { id: { in: [req.userId!, listing.sellerId] } } } },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { listingId: req.params.id, participants: { connect: [{ id: req.userId! }, { id: listing.sellerId }] } },
    });
  }
  const msg = await prisma.message.create({
    data: { body: message, conversationId: conversation.id, senderId: req.userId! },
  });
  return res.status(201).json({ conversation, message: msg });
}
