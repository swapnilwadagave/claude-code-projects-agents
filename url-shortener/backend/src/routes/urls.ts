import { Router } from 'express';
import { createUrl, listUrls, getUrl, updateUrl, deleteUrl } from '../controllers/urlController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { createUrlLimiter, anonCreateUrlLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', optionalAuth, anonCreateUrlLimiter, createUrlLimiter, createUrl);
router.get('/', requireAuth, listUrls);
router.get('/:id', requireAuth, getUrl);
router.patch('/:id', requireAuth, updateUrl);
router.delete('/:id', requireAuth, deleteUrl);

export default router;
