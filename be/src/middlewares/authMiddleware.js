import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';
import User from '../modules/users/user.model.js';
import AuthSession from '../modules/auth/auth.model.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const match = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization || ''));
  if (!match) throw new ApiError(401, 'Authentication required');

  const payload = verifyToken(match[1]);
  if (
    payload.type !== 'access' ||
    !mongoose.isValidObjectId(payload.sub) ||
    !mongoose.isValidObjectId(payload.sid)
  ) {
    throw new ApiError(401, 'Invalid access token');
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

  if (!user || !session) throw new ApiError(401, 'Session is invalid or expired');
  if (user.status !== 'active') throw new ApiError(403, 'Account is not active');

  req.user = user;
  req.auth = { sessionId: String(session._id) };
  next();
});

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
