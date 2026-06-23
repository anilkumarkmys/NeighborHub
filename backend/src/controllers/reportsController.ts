import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export async function createReport(req: AuthRequest, res: Response) {
  const { targetId, targetType, reason, description } = req.body;
  const report = await prisma.report.create({
    data: { targetId, targetType, reason, description, reporterId: req.userId!, status: 'pending' },
  });
  return res.status(201).json(report);
}
