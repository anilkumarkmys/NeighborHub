import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function listPosts(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, category } = req.query;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  const where = {
    neighborhoodId: user?.neighborhoodId || undefined,
    status: 'active' as const,
    ...(category && category !== 'all' ? { category: category as string } : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: { select: { id: true, displayName: true, avatarUrl: true } }, _count: { select: { replies: true, thanks: true } }, thanks: { where: { userId: req.userId! } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.post.count({ where }),
  ]);
  const formatted = posts.map(p => ({ ...p, thankCount: p._count.thanks, replyCount: p._count.replies, isThankedByMe: p.thanks.length > 0, _count: undefined, thanks: undefined }));
  return res.json({ posts: formatted, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
}

export async function createPost(req: AuthRequest, res: Response) {
  const { title, body, category, images } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.neighborhoodId) return res.status(400).json({ message: 'Address not verified' });
  const post = await prisma.post.create({
    data: { title, body, category, images: images || [], authorId: req.userId!, neighborhoodId: user.neighborhoodId, status: 'active' },
    include: { author: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.status(201).json(post);
}

export async function getPost(req: AuthRequest, res: Response) {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, displayName: true, avatarUrl: true } }, _count: { select: { replies: true, thanks: true } }, thanks: { where: { userId: req.userId! } } },
  });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  return res.json({ ...post, thankCount: post._count.thanks, replyCount: post._count.replies, isThankedByMe: post.thanks.length > 0 });
}

export async function updatePost(req: AuthRequest, res: Response) {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.authorId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.post.update({ where: { id: req.params.id }, data: req.body });
  return res.json(updated);
}

export async function deletePost(req: AuthRequest, res: Response) {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.authorId !== req.userId && req.userRole !== 'admin' && req.userRole !== 'moderator') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await prisma.post.update({ where: { id: req.params.id }, data: { status: 'removed' } });
  return res.json({ message: 'Post removed' });
}

export async function thankPost(req: AuthRequest, res: Response) {
  const existing = await prisma.thank.findUnique({ where: { userId_postId: { userId: req.userId!, postId: req.params.id } } });
  if (existing) {
    await prisma.thank.delete({ where: { userId_postId: { userId: req.userId!, postId: req.params.id } } });
  } else {
    await prisma.thank.create({ data: { userId: req.userId!, postId: req.params.id } });
  }
  const count = await prisma.thank.count({ where: { postId: req.params.id } });
  return res.json({ thanked: !existing, thankCount: count });
}

export async function getReplies(req: AuthRequest, res: Response) {
  const replies = await prisma.reply.findMany({
    where: { postId: req.params.id },
    include: { author: { select: { id: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(replies);
}

export async function addReply(req: AuthRequest, res: Response) {
  const { body } = req.body;
  const reply = await prisma.reply.create({
    data: { body, postId: req.params.id, authorId: req.userId! },
    include: { author: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.status(201).json(reply);
}

export async function reportPost(req: AuthRequest, res: Response) {
  const { reason, description } = req.body;
  const report = await prisma.report.create({
    data: { targetId: req.params.id, targetType: 'post', reason, description, reporterId: req.userId!, status: 'pending' },
  });
  return res.status(201).json(report);
}
