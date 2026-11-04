import { ApiError } from '../../utils/ApiError.js';

const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;
const fields = ['recipientName', 'phone', 'province', 'district', 'ward', 'streetAddress'];

export function addressValidator(req, res, next) {
  const body = req.body || {};
  for (const field of fields) if (typeof body[field] !== 'string' || body[field].trim().length < 2) throw new ApiError(400, `${field} is required`);
  if (!PHONE_PATTERN.test(body.phone.trim())) throw new ApiError(400, 'Phone number is not valid');
  next();
}
