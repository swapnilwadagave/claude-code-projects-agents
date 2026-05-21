import { UAParser } from 'ua-parser-js';
import prisma from '../config/prisma';

export async function recordClick(
  urlId: string,
  userAgent: string | undefined,
  referrer: string | undefined,
): Promise<void> {
  const ua = userAgent ? UAParser(userAgent) : null;

  await prisma.click.create({
    data: {
      urlId,
      referrer: referrer || null,
      browser: ua?.browser.name ?? null,
      os: ua?.os.name ?? null,
      device: ua?.device.type ?? 'desktop',
    },
  });
}

export async function getClickStats(urlId: string) {
  const clicks = await prisma.click.findMany({
    where: { urlId },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: { referrer: true, browser: true, os: true, device: true, createdAt: true },
  });

  const total = clicks.length;

  const byBrowser = aggregate(clicks.map((c) => c.browser ?? 'Unknown'));
  const byOs = aggregate(clicks.map((c) => c.os ?? 'Unknown'));
  const byDevice = aggregate(clicks.map((c) => c.device ?? 'Unknown'));

  return { total, byBrowser, byOs, byDevice, recent: clicks.slice(0, 20) };
}

function aggregate(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
}
