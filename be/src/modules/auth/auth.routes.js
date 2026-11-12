import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController
} from './auth.controller.js';
import {
  forgotPasswordValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  resetPasswordValidator
} from './auth.validator.js';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 40 });

router.post('/register', authLimiter, registerValidator, registerController);
router.post('/login', authLimiter, loginValidator, loginController);
router.post('/refresh', authLimiter, refreshValidator, refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPasswordController);
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPasswordController);
router.get('/me', requireAuth, meController);

export default router;
