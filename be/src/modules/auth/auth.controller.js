import { asyncHandler } from '../../utils/asyncHandler.js';
import { toPublicUser } from '../users/user.service.js';
import {
  login,
  logout,
  refreshSession,
  register,
  requestPasswordReset,
  resetPassword
} from './auth.service.js';

const metaOf = (req) => ({ userAgent: req.get('user-agent'), ip: req.ip });

export const registerController = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await register(req.body, metaOf(req)) });
});

export const loginController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await login(req.body, metaOf(req)) });
});

export const refreshController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await refreshSession(req.body?.refreshToken, metaOf(req)) });
});

export const logoutController = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  res.json({ success: true, data: await logout(refreshToken) });
});

export const meController = (req, res) => {
  res.json({ success: true, data: toPublicUser(req.user) });
};

export const forgotPasswordController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await requestPasswordReset(req.body?.email) });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await resetPassword(req.body) });
});
