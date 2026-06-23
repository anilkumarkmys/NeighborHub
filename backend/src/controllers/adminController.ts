import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendPushNotification } from './notificationsController';
import { AuthRequest } from '../middleware/auth';

export async function listUsers(req: AuthRequest, res: Response) {
  const { page = 1, limit = 30, search, status, role } = req.query;
  const where = {
    ...(search ? { OR: [{ displayName: { contains: search as string, mode: 'insensitive' as const } }, { email: { contains: search as string, mode: 'insensitive' as const } }] } : {}),
    ...(status === 'suspended' ? { isSuspended: true } : status === 'banned' ? { isBanned: true } : status === 'active' ? { isActive: true, isSuspended: false, isBanned: false } : {}),
    ...(role ? { role: role as string } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, displayName: true, email: true, role: true, isActive: true, isSuspended: true, isBanned: true, isAddressVerified: true, createdAt: true, neighborhood: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (Number(page) - 1) * Number(limit), take: Number(limit) }),
    prisma.user.count({ where }),
  ]);
  return res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
}

export async function getUser(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { neighborhood: true, _count: { select: { posts: true } } } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { passwordHash: _, ...safe } = user;
  return res.json(safe);
}

export async function suspendUser(req: AuthRequest, res: Response) {
  const { reason, duration } = req.body;
  const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: true, suspendedUntil, suspensionReason: reason, isActive: false } });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'suspend_user', targetId: req.params.id, details: { reason, duration } } });
  return res.json({ message: 'User suspended', user });
}

export async function banUser(req: AuthRequest, res: Response) {
  const { reason } = req.body;
  await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: true, isActive: false, banReason: reason } });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'ban_user', targetId: req.params.id, details: { reason } } });
  return res.json({ message: 'User banned' });
}

export async function reactivateUser(req: AuthRequest, res: Response) {
  await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: false, isBanned: false, isActive: true, suspendedUntil: null, suspensionReason: null } });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'reactivate_user', targetId: req.params.id, details: {} } });
  return res.json({ message: 'User reactivated' });
}

export async function listFlaggedContent(req: AuthRequest, res: Response) {
  const { page = 1, limit = 30 } = req.query;
  const posts = await prisma.post.findMany({ where: { status: 'flagged' }, include: { author: { select: { id: true, displayName: true } }, _count: { select: { reports: true } } }, orderBy: { updatedAt: 'desc' }, skip: (Number(page) - 1) * Number(limit), take: Number(limit) });
  return res.json(posts);
}

export async function approveContent(req: AuthRequest, res: Response) {
  await prisma.post.update({ where: { id: req.params.id }, data: { status: 'active' } });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'approve_content', targetId: req.params.id, details: {} } });
  return res.json({ message: 'Content approved' });
}

export async function removeContent(req: AuthRequest, res: Response) {
  const { reason } = req.body;
  await prisma.post.update({ where: { id: req.params.id }, data: { status: 'removed' } });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'remove_content', targetId: req.params.id, details: { reason } } });
  return res.json({ message: 'Content removed' });
}

export async function pinContent(req: AuthRequest, res: Response) {
  await prisma.post.update({ where: { id: req.params.id }, data: { isPinned: true } });
  return res.json({ message: 'Content pinned' });
}

export async function listReports(req: AuthRequest, res: Response) {
  const { page = 1, limit = 30, status = 'pending' } = req.query;
  const [reports, total] = await Promise.all([
    prisma.report.findMany({ where: { status: status as string }, include: { reporter: { select: { id: true, displayName: true } } }, orderBy: { createdAt: 'desc' }, skip: (Number(page) - 1) * Number(limit), take: Number(limit) }),
    prisma.report.count({ where: { status: status as string } }),
  ]);
  return res.json({ reports, total });
}

export async function resolveReport(req: AuthRequest, res: Response) {
  const { action, adminNote } = req.body;
  await prisma.report.update({ where: { id: req.params.id }, data: { status: action, adminNote, resolvedAt: new Date(), resolvedById: req.userId! } });
  return res.json({ message: 'Report resolved' });
}

export async function getAnalytics(_req: AuthRequest, res: Response) {
  const [totalUsers, activeUsersToday, totalPosts, postsToday, totalNeighborhoods, totalEvents, totalListings, pendingReports, userGrowth, postActivity] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.neighborhood.count({ where: { isActive: true } }),
    prisma.event.count(),
    prisma.listing.count(),
    prisma.report.count({ where: { status: 'pending' } }),
    getLast14Days('user'),
    getLast14Days('post'),
  ]);
  const categoryDist = await prisma.post.groupBy({ by: ['category'], _count: { id: true } });
  return res.json({
    summary: { totalUsers, activeUsersToday, activeUsersWeek: activeUsersToday * 3, totalPosts, postsToday, totalNeighborhoods, totalEvents, totalListings, pendingReports },
    userGrowth,
    postActivity,
    categoryDistribution: categoryDist.map(c => ({ category: c.category, count: c._count.id })),
  });
}

async function getLast14Days(type: 'user' | 'post') {
  const result = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const count = type === 'user'
      ? await prisma.user.count({ where: { createdAt: { gte: date, lt: next } } })
      : await prisma.post.count({ where: { createdAt: { gte: date, lt: next } } });
    result.push({ date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count });
  }
  return result;
}

export async function sendNotification(req: AuthRequest, res: Response) {
  const { title, body, target, neighborhoods, isUrgent } = req.body;
  let userIds: string[];
  if (target === 'all') {
    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
    userIds = users.map(u => u.id);
  } else if (target === 'admins') {
    const users = await prisma.user.findMany({ where: { role: { in: ['admin', 'moderator'] } }, select: { id: true } });
    userIds = users.map(u => u.id);
  } else {
    const where = neighborhoods?.length ? { neighborhood: { name: { in: neighborhoods } } } : {};
    const users = await prisma.user.findMany({ where: { isActive: true, ...where }, select: { id: true } });
    userIds = users.map(u => u.id);
  }
  await sendPushNotification(userIds, title, body, { isUrgent });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'send_notification', targetId: null, details: { title, target, userCount: userIds.length } } });
  return res.json({ message: 'Notification sent', recipientCount: userIds.length });
}

export async function listNeighborhoods(_req: AuthRequest, res: Response) {
  const neighborhoods = await prisma.neighborhood.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' },
  });
  return res.json(neighborhoods.map(n => ({ ...n, memberCount: n._count.members })));
}

export async function toggleNeighborhood(req: AuthRequest, res: Response) {
  const { isActive } = req.body;
  await prisma.neighborhood.update({ where: { id: req.params.id }, data: { isActive } });
  return res.json({ message: 'Neighborhood updated' });
}

export async function listVersions(_req: AuthRequest, res: Response) {
  const versions = await prisma.appVersion.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(versions);
}

export async function createVersion(req: AuthRequest, res: Response) {
  const { version, appType, platform, releaseNotes, downloadUrl } = req.body;
  const appVersion = await prisma.appVersion.create({
    data: { version, appType, platform, releaseNotes, downloadUrl, status: 'draft', createdById: req.userId! },
  });
  return res.status(201).json(appVersion);
}

export async function releaseVersion(req: AuthRequest, res: Response) {
  const appVersion = await prisma.appVersion.update({
    where: { id: req.params.id },
    data: { status: 'released', releasedAt: new Date() },
  });
  await prisma.adminLog.create({ data: { adminId: req.userId!, action: 'release_version', targetId: req.params.id, details: { version: appVersion.version } } });
  return res.json(appVersion);
}

export async function setForceUpdate(req: AuthRequest, res: Response) {
  const { isForceUpdate } = req.body;
  const appVersion = await prisma.appVersion.update({ where: { id: req.params.id }, data: { isForceUpdate } });
  return res.json(appVersion);
}

export async function deprecateVersion(req: AuthRequest, res: Response) {
  const appVersion = await prisma.appVersion.update({ where: { id: req.params.id }, data: { status: 'deprecated' } });
  return res.json(appVersion);
}
