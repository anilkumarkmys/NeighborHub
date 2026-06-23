import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listConversations(req: AuthRequest, res: Response) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { id: req.userId! } } },
    include: {
      participants: { select: { id: true, displayName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      listing: { select: { id: true, title: true, images: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json(conversations);
}

export async function createConversation(req: AuthRequest, res: Response) {
  const { recipientId, message } = req.body;
  let conversation = await prisma.conversation.findFirst({
    where: { participants: { every: { id: { in: [req.userId!, recipientId] } } }, listingId: null },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { participants: { connect: [{ id: req.userId! }, { id: recipientId }] } },
    });
  }
  const msg = await prisma.message.create({
    data: { body: message, conversationId: conversation.id, senderId: req.userId! },
    include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.status(201).json({ conversation, message: msg });
}

export async function getConversation(req: AuthRequest, res: Response) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      participants: { select: { id: true, displayName: true, avatarUrl: true } },
      messages: { include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
  const isParticipant = conversation.participants.some(p => p.id === req.userId);
  if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });
  return res.json(conversation);
}

export async function sendMessage(req: AuthRequest, res: Response) {
  const { body, imageUrl } = req.body;
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { participants: true } });
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
  if (!conversation.participants.some(p => p.id === req.userId)) return res.status(403).json({ message: 'Forbidden' });
  const message = await prisma.message.create({
    data: { body, imageUrl, conversationId: req.params.id, senderId: req.userId! },
    include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
  return res.status(201).json(message);
}

export async function markRead(req: AuthRequest, res: Response) {
  await prisma.message.updateMany({
    where: { conversationId: req.params.id, senderId: { not: req.userId! }, isRead: false },
    data: { isRead: true },
  });
  return res.json({ message: 'Marked as read' });
}
