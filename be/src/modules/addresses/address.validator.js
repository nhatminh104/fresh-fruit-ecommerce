import { ApiError } from '../../utils/ApiError.js';

const PHONE_PATTERN = /^[0-9+\-\s]{8,15}$/;
const ADDRESS_FIELDS = ['recipientName', 'phone', 'province', 'district', 'ward', 'streetAddress'];
const FIELD_LABELS = {
  recipientName: 'Tên người nhận',
  phone: 'Số điện thoại',
  province: 'Tỉnh/thành phố',
  district: 'Quận/huyện',
  ward: 'Phường/xã',
  streetAddress: 'Địa chỉ cụ thể'
};

function validateField(field, value) {
  if (typeof value !== 'string' || value.trim().length < 2) {
    throw new ApiError(400, `${FIELD_LABELS[field]} là bắt buộc`);
  }
  if (field === 'phone' && !PHONE_PATTERN.test(value.trim())) {
    throw new ApiError(400, 'Số điện thoại không hợp lệ');
  }
}

export function addressValidator(req, res, next) {
  const body = req.body || {};
  if (req.method === 'PATCH') {
    const provided = ADDRESS_FIELDS.filter((field) => body[field] !== undefined);
    if (!provided.length && body.isDefault === undefined) {
      throw new ApiError(400, 'Cần cập nhật ít nhất một trường địa chỉ');
    }
    for (const field of provided) validateField(field, body[field]);
    if (body.isDefault !== undefined && typeof body.isDefault !== 'boolean') {
      throw new ApiError(400, 'Giá trị isDefault không hợp lệ');
    }
    return next();
  }
  for (const field of ADDRESS_FIELDS) validateField(field, body[field]);
  if (body.isDefault !== undefined && typeof body.isDefault !== 'boolean') {
    throw new ApiError(400, 'Giá trị isDefault không hợp lệ');
  }
  next();
}
