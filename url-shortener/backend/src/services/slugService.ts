import { customAlphabet } from 'nanoid';
import prisma from '../config/prisma';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generate = customAlphabet(alphabet, 6);

export async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generate();
    const existing = await prisma.url.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error('Failed to generate a unique slug after 5 attempts');
}

export function isValidCustomSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(slug);
}
