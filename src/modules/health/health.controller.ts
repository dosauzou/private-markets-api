import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.client';
import { env } from '../../config/env';

export async function healthCheck(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      data: {
        status: 'ok',
        environment: env.NODE_ENV,
        uptime_seconds: Math.round(process.uptime()),
        db: { status: 'connected' },
        server_time: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({ success: false, error: 'Database unreachable' });
  }
}
