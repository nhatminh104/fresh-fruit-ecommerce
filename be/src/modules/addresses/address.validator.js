import { ApiError } from '../../utils/ApiError.js';

const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;
const fields = ['recipientName', 'phone', 'province', 'district', 'ward', 'streetAddress'];

export function addressValidator(req, res, next) {
  const body = req.body || {};
  const labels = { recipientName: 'Tên người nhận', phone: 'Số điện thoại', province: 'Tỉnh/thành phố', district: 'Quận/huyện', ward: 'Phường/xã', streetAddress: 'Địa chỉ cụ thể' };
  for (const field of fields) if (typeof body[field] !== 'string' || body[field].trim().length < 2) throw new ApiError(400, `${labels[field]} là bắt buộc`);
  if (!PHONE_PATTERN.test(body.phone.trim())) throw new ApiError(400, 'Số điện thoại không hợp lệ');
  next();
}
