import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function checkVersion(req: Request, res: Response) {
  const { appType, platform, currentVersion } = req.query as Record<string, string>;
  const latest = await prisma.appVersion.findFirst({
    where: { appType, platform: { in: [platform, 'both'] }, status: 'released' },
    orderBy: { releasedAt: 'desc' },
  });
  if (!latest) return res.json({ upToDate: true });
  const isForceUpdate = latest.isForceUpdate && latest.version !== currentVersion;
  const hasUpdate = latest.version !== currentVersion;
  return res.json({ upToDate: !hasUpdate, latestVersion: latest.version, isForceUpdate, releaseNotes: latest.releaseNotes, downloadUrl: latest.downloadUrl });
}

export async function listVersions(_req: AuthRequest, res: Response) {
  const versions = await prisma.appVersion.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(versions);
}
