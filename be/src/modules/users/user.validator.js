import { ApiError } from '../../utils/ApiError.js';

const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;

export function updateProfileValidator(req, res, next) {
  const { fullName, phone } = req.body || {};
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 120)) {
    throw new ApiError(400, 'Full name must be between 2 and 120 characters');
  }
  if (phone !== undefined && phone !== null && phone !== '' && !PHONE_PATTERN.test(String(phone).trim())) {
    throw new ApiError(400, 'Phone number is not valid');
  }
  if (fullName === undefined && phone === undefined) {
    throw new ApiError(400, 'At least one profile field is required');
  }
  next();
}
