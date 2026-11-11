import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middlewares/authMiddleware.js';
import { listController } from './inventory.controller.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/', listController);

export default router;
