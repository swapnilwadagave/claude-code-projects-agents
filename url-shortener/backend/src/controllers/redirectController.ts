import { Request, Response, NextFunction } from 'express';
import { recordClick } from '../services/analyticsService';
import prisma from '../config/prisma';

export async function redirect(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const url = await prisma.url.findUnique({ where: { slug } });

    if (!url) {
      res.status(404).json({ error: 'Short URL not found' });
      return;
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      res.status(410).json({ error: 'This link has expired' });
      return;
    }

    // Fire-and-forget click recording; don't block the redirect
    recordClick(
      url.id,
      req.headers['user-agent'],
      req.headers['referer'] ?? req.headers['referrer'] as string | undefined,
    ).catch(console.error);

    res.redirect(302, url.longUrl);
  } catch (err) {
    next(err);
  }
}
