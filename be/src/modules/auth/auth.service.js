import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from '../users/user.model.js';
import { toPublicUser } from '../users/user.service.js';
import AuthSession from './auth.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken, verifyToken } from '../../utils/token.js';
import { ApiError } from '../../utils/ApiError.js';

const ACCESS_TOKEN_TTL = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 15 * 60;
const REFRESH_TOKEN_TTL = Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 7 * 24 * 60 * 60;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const requestMeta = (meta = {}) => ({
  userAgent: meta.userAgent ? String(meta.userAgent).slice(0, 255) : undefined,
  ip: meta.ip ? String(meta.ip).slice(0, 64) : undefined
});

function tokenMatches(storedHash, token) {
  if (typeof storedHash !== 'string') return false;
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashToken(token), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function issueAccessToken(user, sessionId) {
  return signToken({ sub: String(user._id), sid: String(sessionId), role: user.role, type: 'access' }, ACCESS_TOKEN_TTL);
}

async function createSession(user, meta) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
  const session = new AuthSession({ user: user._id, refreshTokenHash: 'pending', expiresAt, ...requestMeta(meta) });
  const refreshToken = signToken({ sub: String(user._id), sid: String(session._id), type: 'refresh' }, REFRESH_TOKEN_TTL);
  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();
  return { session, refreshToken };
}

function authPayload(user, session, refreshToken) {
  return {
    user: toPublicUser(user),
    accessToken: issueAccessToken(user, session._id),
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL
  };
}

export async function register(payload = {}, meta = {}) {
  const email = String(payload.email || '').trim().toLowerCase();
  const existing = await User.findOne({ email }).select('_id').lean();
  if (existing) throw new ApiError(409, 'Email đã được đăng ký');

  let user;
  try {
    user = await User.create({
      fullName: String(payload.fullName).trim(),
      email,
      password: await hashPassword(payload.password),
      phone: payload.phone ? String(payload.phone).trim() : undefined,
      role: 'customer',
      status: 'active'
    });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'Email đã được đăng ký');
    throw error;
  }

  const { session, refreshToken } = await createSession(user, meta);
  return authPayload(user, session, refreshToken);
}

export async function login(payload = {}, meta = {}) {
  const email = String(payload.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await verifyPassword(payload.password, user.password))) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
  }
  if (user.status !== 'active') throw new ApiError(403, 'Tài khoản chưa được kích hoạt');
  if (payload.role && payload.role !== user.role) {
    throw new ApiError(403, 'Tài khoản không có quyền truy cập cổng này');
  }

  const { session, refreshToken } = await createSession(user, meta);
  return authPayload(user, session, refreshToken);
}

export async function refreshSession(refreshToken, meta = {}) {
  const payload = verifyToken(refreshToken);
  if (payload.type !== 'refresh' || !mongoose.isValidObjectId(payload.sid) || !mongoose.isValidObjectId(payload.sub)) {
    throw new ApiError(401, 'Mã phiên làm mới không hợp lệ');
  }

  const session = await AuthSession.findOne({
    _id: payload.sid,
    user: payload.sub,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });
  if (!session || !tokenMatches(session.refreshTokenHash, refreshToken)) {
    throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  if (user.status !== 'active') throw new ApiError(403, 'Tài khoản chưa được kích hoạt');

  const remainingSeconds = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
  const nextRefreshToken = signToken(
    { sub: String(user._id), sid: String(session._id), type: 'refresh' },
    Math.max(remainingSeconds, 1)
  );
  const rotatedSession = await AuthSession.findOneAndUpdate(
    { _id: session._id, revokedAt: null, refreshTokenHash: hashToken(refreshToken), expiresAt: { $gt: new Date() } },
    { $set: { refreshTokenHash: hashToken(nextRefreshToken), ...requestMeta(meta) } },
    { new: true }
  );
  if (!rotatedSession) throw new ApiError(401, 'Phiên đăng nhập đã được làm mới hoặc đã hết hạn');

  return authPayload(user, rotatedSession, nextRefreshToken);
}

export async function logout(refreshToken) {
  if (!refreshToken) return { loggedOut: true };
  try {
    const payload = verifyToken(refreshToken);
    if (['access', 'refresh'].includes(payload.type) && mongoose.isValidObjectId(payload.sid)) {
      await AuthSession.updateOne(
        { _id: payload.sid, user: payload.sub, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }
  } catch {
    // Logout stays idempotent even when the token is already invalid or expired.
  }
  return { loggedOut: true };
}

export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail, status: 'active' });
  const response = { message: 'If the email exists, a password reset link has been created.' };
  if (!user) return response;

  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    response.resetToken = token;
    response.expiresInMinutes = RESET_TOKEN_TTL_MS / 60000;
    console.info(`[auth] Password reset token for ${normalizedEmail}: ${token}`);
  }
  return response;
}

export async function resetPassword(payload = {}) {
  const token = String(payload.token || '').trim();
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() }
  });
  if (!user) throw new ApiError(400, 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');

  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: await hashPassword(payload.password) },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 }
    }
  );
  await AuthSession.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });

  return { message: 'Password has been reset. Please sign in again.' };
}

export async function logoutAll(userId) {
  await AuthSession.updateMany({ user: userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return { loggedOut: true };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  if (!(await verifyPassword(currentPassword, user.password))) {
    throw new ApiError(400, 'Mật khẩu hiện tại không đúng');
  }
  await User.updateOne({ _id: user._id }, { $set: { password: await hashPassword(newPassword) } });
  await AuthSession.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return { message: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.' };
}
