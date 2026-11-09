import crypto from 'node:crypto';
import { ApiError } from './ApiError.js';

function getSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new ApiError(500, 'Máy chủ chưa cấu hình khóa bảo mật');
  return secret;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

export function signToken(payload, expiresInSeconds = 900) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...payload, iat: now, exp: now + Number(expiresInSeconds) });
  const signature = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string') throw new ApiError(401, 'Thiếu mã xác thực');
  const parts = token.split('.');
  if (parts.length !== 3) throw new ApiError(401, 'Mã xác thực không hợp lệ');

  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
  const provided = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (provided.length !== expectedBytes.length || !crypto.timingSafeEqual(provided, expectedBytes)) {
    throw new ApiError(401, 'Chữ ký mã xác thực không hợp lệ');
  }

  let headerData;
  let payload;
  try {
    headerData = decode(header);
    payload = decode(body);
  } catch {
    throw new ApiError(401, 'Mã xác thực không hợp lệ');
  }
  if (headerData.alg !== 'HS256') throw new ApiError(401, 'Loại mã xác thực không được hỗ trợ');
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Mã xác thực đã hết hạn');
  }
  return payload;
}
