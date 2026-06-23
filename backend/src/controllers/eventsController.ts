import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listEvents(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, upcoming } = req.query;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  const where = {
    neighborhoodId: user?.neighborhoodId || undefined,
    ...(upcoming === 'true' ? { startDate: { gte: new Date() } } : {}),
  };
  const events = await prisma.event.findMany({
    where,
    include: { organizer: { select: { id: true, displayName: true, avatarUrl: true } }, _count: { select: { attendees: true } }, attendees: { where: { userId: req.userId! } } },
    orderBy: { startDate: 'asc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
  return res.json(events.map(e => ({ ...e, attendeeCount: e._count.attendees, isAttending: e.attendees.length > 0 })));
}

export async function createEvent(req: AuthRequest, res: Response) {
  const { title, description, category, startDate, endDate, location, address, maxAttendees, coverImage, isVirtual, virtualLink } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.neighborhoodId) return res.status(400).json({ message: 'Address not verified' });
  const event = await prisma.event.create({
    data: { title, description, category, startDate: new Date(startDate), endDate: new Date(endDate), location, address, maxAttendees, coverImage, isVirtual, virtualLink, organizerId: req.userId!, neighborhoodId: user.neighborhoodId },
    include: { organizer: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.status(201).json(event);
}

export async function getEvent(req: AuthRequest, res: Response) {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { organizer: { select: { id: true, displayName: true, avatarUrl: true } }, attendees: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } } },
  });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  return res.json(event);
}

export async function updateEvent(req: AuthRequest, res: Response) {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (event.organizerId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
  return res.json(updated);
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (event.organizerId !== req.userId && req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await prisma.event.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Event deleted' });
}

export async function rsvpEvent(req: AuthRequest, res: Response) {
  const { attending } = req.body;
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (attending) {
    await prisma.eventAttendee.upsert({
      where: { userId_eventId: { userId: req.userId!, eventId: req.params.id } },
      update: {},
      create: { userId: req.userId!, eventId: req.params.id },
    });
  } else {
    await prisma.eventAttendee.deleteMany({ where: { userId: req.userId!, eventId: req.params.id } });
  }
  const count = await prisma.eventAttendee.count({ where: { eventId: req.params.id } });
  return res.json({ attending, attendeeCount: count });
}
