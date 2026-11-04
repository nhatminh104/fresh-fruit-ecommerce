import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import { profileController, updateProfileController } from './user.controller.js';
import { updateProfileValidator } from './user.validator.js';

const router = Router();

router.get('/me', requireAuth, profileController);
router.patch('/me', requireAuth, updateProfileValidator, updateProfileController);

export default router;
