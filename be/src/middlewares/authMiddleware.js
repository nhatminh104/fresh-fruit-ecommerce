import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';
import User from '../modules/users/user.model.js';
import AuthSession from '../modules/auth/auth.model.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const match = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization || ''));
  if (!match) throw new ApiError(401, 'Vui lòng đăng nhập');

  const payload = verifyToken(match[1]);
  if (
    payload.type !== 'access' ||
    !mongoose.isValidObjectId(payload.sub) ||
    !mongoose.isValidObjectId(payload.sid)
  ) {
    throw new ApiError(401, 'Phiên đăng nhập không hợp lệ');
  }

  const [user, session] = await Promise.all([
    User.findById(payload.sub),
    AuthSession.findOne({
      _id: payload.sid,
      user: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).select('_id')
  ]);

  if (!user || !session) throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  if (user.status !== 'active') throw new ApiError(403, 'Tài khoản chưa được kích hoạt');

  req.user = user;
  req.auth = { sessionId: String(session._id) };
  next();
});

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Vui lòng đăng nhập'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Bạn không có quyền thực hiện thao tác này'));
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');
