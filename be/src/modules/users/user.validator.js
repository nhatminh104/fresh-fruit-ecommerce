import { ApiError } from '../../utils/ApiError.js';

const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;

export function updateProfileValidator(req, res, next) {
  const { fullName, phone } = req.body || {};
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 120)) {
    throw new ApiError(400, 'Họ tên phải dài từ 2 đến 120 ký tự');
  }
  if (phone !== undefined && phone !== null && phone !== '' && !PHONE_PATTERN.test(String(phone).trim())) {
    throw new ApiError(400, 'Số điện thoại không hợp lệ');
  }
  if (fullName === undefined && phone === undefined) {
    throw new ApiError(400, 'Cần cập nhật ít nhất một trường thông tin');
  }
  next();
}
