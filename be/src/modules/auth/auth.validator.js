import { ApiError } from '../../utils/ApiError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;

const bodyOf = (req) => req.body || {};

function requireEmail(email) {
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new ApiError(400, 'Email không hợp lệ');
  }
}

function requirePassword(password, { strict = true } = {}) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Mật khẩu là bắt buộc');
  }
  if (strict && !PASSWORD_PATTERN.test(password)) {
    throw new ApiError(400, 'Mật khẩu phải dài 8-128 ký tự, có ít nhất một chữ cái và một chữ số');
  }
}

export function registerValidator(req, res, next) {
  const { fullName, email, password, phone } = bodyOf(req);
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 120) {
    throw new ApiError(400, 'Họ tên phải dài từ 2 đến 120 ký tự');
  }
  requireEmail(email);
  requirePassword(password);
  if (phone !== undefined && phone !== null && phone !== '' && !PHONE_PATTERN.test(String(phone).trim())) {
    throw new ApiError(400, 'Số điện thoại không hợp lệ');
  }
  next();
}

export function loginValidator(req, res, next) {
  const { email, password } = bodyOf(req);
  requireEmail(email);
  requirePassword(password, { strict: false });
  next();
}

export function refreshValidator(req, res, next) {
  const { refreshToken } = bodyOf(req);
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    throw new ApiError(400, 'Mã phiên làm mới là bắt buộc');
  }
  next();
}

export function forgotPasswordValidator(req, res, next) {
  requireEmail(bodyOf(req).email);
  next();
}

export function resetPasswordValidator(req, res, next) {
  const { token, password, confirmPassword } = bodyOf(req);
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new ApiError(400, 'Mã đặt lại mật khẩu là bắt buộc');
  }
  requirePassword(password);
  if (confirmPassword !== undefined && confirmPassword !== password) {
    throw new ApiError(400, 'Mật khẩu xác nhận không khớp');
  }
  next();
}

export function changePasswordValidator(req, res, next) {
  const { currentPassword, newPassword, confirmPassword } = bodyOf(req);
  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    throw new ApiError(400, 'Mật khẩu hiện tại là bắt buộc');
  }
  requirePassword(newPassword);
  if (confirmPassword !== undefined && confirmPassword !== newPassword) {
    throw new ApiError(400, 'Mật khẩu xác nhận không khớp');
  }
  next();
}
