import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const authReq = req as AuthRequest;
    return authReq.user ? `user:${authReq.user.sub}` : req.ip ?? 'unknown';
  },
  skip: (req) => {
    const authReq = req as AuthRequest;
    // authenticated users get 100/15min; anonymous users get 10/15min (separate limiter below)
    return !!authReq.user;
  },
  message: { error: 'Too many requests, please try again later.' },
});

export const anonCreateUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!(req as AuthRequest).user,
  message: { error: 'Too many requests. Sign in to create more links.' },
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
