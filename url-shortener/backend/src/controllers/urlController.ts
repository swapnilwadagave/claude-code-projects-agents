import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { generateUniqueSlug, isValidCustomSlug } from '../services/slugService';
import { getClickStats } from '../services/analyticsService';
import { env } from '../config/env';
import prisma from '../config/prisma';

const createSchema = z.object({
  longUrl: z.string().url('Must be a valid URL'),
  slug: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateSchema = z.object({
  longUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function createUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { longUrl, slug: customSlug, expiresAt } = createSchema.parse(req.body);

    let slug: string;
    if (customSlug) {
      if (!req.user) {
        res.status(403).json({ error: 'Custom slugs require an account' });
        return;
      }
      if (!isValidCustomSlug(customSlug)) {
        res.status(400).json({ error: 'Slug must be 3–32 characters: letters, numbers, _ or -' });
        return;
      }
      const existing = await prisma.url.findUnique({ where: { slug: customSlug } });
      if (existing) {
        res.status(409).json({ error: 'That slug is already taken' });
        return;
      }
      slug = customSlug;
    } else {
      slug = await generateUniqueSlug();
    }

    const url = await prisma.url.create({
      data: {
        slug,
        longUrl,
        userId: req.user?.sub ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({
      id: url.id,
      slug: url.slug,
      shortUrl: `${env.BASE_URL}/${url.slug}`,
      longUrl: url.longUrl,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function listUrls(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const [urls, total] = await prisma.$transaction([
      prisma.url.findMany({
        where: { userId: req.user!.sub },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { clicks: true } } },
      }),
      prisma.url.count({ where: { userId: req.user!.sub } }),
    ]);

    res.json({
      data: urls.map((u) => ({
        id: u.id,
        slug: u.slug,
        shortUrl: `${env.BASE_URL}/${u.slug}`,
        longUrl: u.longUrl,
        clicks: u._count.clicks,
        expiresAt: u.expiresAt,
        createdAt: u.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const url = await prisma.url.findUnique({ where: { id: req.params.id } });
    if (!url) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }
    if (url.userId !== req.user!.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const stats = await getClickStats(url.id);

    res.json({
      id: url.id,
      slug: url.slug,
      shortUrl: `${env.BASE_URL}/${url.slug}`,
      longUrl: url.longUrl,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      analytics: stats,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.url.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }
    if (existing.userId !== req.user!.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const data = updateSchema.parse(req.body);
    const url = await prisma.url.update({
      where: { id: req.params.id },
      data: {
        ...(data.longUrl && { longUrl: data.longUrl }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
      },
    });

    res.json({ id: url.id, slug: url.slug, longUrl: url.longUrl, expiresAt: url.expiresAt });
  } catch (err) {
    next(err);
  }
}

export async function deleteUrl(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.url.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }
    if (existing.userId !== req.user!.sub) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await prisma.url.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
