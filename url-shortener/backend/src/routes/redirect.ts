import { Router } from 'express';
import { redirect } from '../controllers/redirectController';
import { redirectLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/:slug', redirectLimiter, redirect);

export default router;
