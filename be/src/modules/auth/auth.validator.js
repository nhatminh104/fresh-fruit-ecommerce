import { ApiError } from '../../utils/ApiError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;

const bodyOf = (req) => req.body || {};

function requireEmail(email) {
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw new ApiError(400, 'A valid email is required');
  }
}

function requirePassword(password, { strict = true } = {}) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Password is required');
  }
  if (strict && !PASSWORD_PATTERN.test(password)) {
    throw new ApiError(400, 'Password must be 8-128 characters and include at least one letter and one number');
  }
}

export function registerValidator(req, res, next) {
  const { fullName, email, password, phone } = bodyOf(req);
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 120) {
    throw new ApiError(400, 'Full name must be between 2 and 120 characters');
  }
  requireEmail(email);
  requirePassword(password);
  if (phone !== undefined && phone !== null && phone !== '' && !PHONE_PATTERN.test(String(phone).trim())) {
    throw new ApiError(400, 'Phone number is not valid');
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
    throw new ApiError(400, 'Refresh token is required');
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
    throw new ApiError(400, 'Reset token is required');
  }
  requirePassword(password);
  if (confirmPassword !== undefined && confirmPassword !== password) {
    throw new ApiError(400, 'Password confirmation does not match');
  }
  next();
}
