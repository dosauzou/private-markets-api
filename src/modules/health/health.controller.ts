import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.client';

export async function healthCheck(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ok', db: 'connected' } });
  } catch {
    res.status(503).json({ success: false, error: 'Database unreachable' });
  }
}
