import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';
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

router.post('/register', registerValidator, registerController);
router.post('/login', loginValidator, loginController);
router.post('/refresh', refreshValidator, refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordValidator, forgotPasswordController);
router.post('/reset-password', resetPasswordValidator, resetPasswordController);
router.get('/me', requireAuth, meController);

export default router;
