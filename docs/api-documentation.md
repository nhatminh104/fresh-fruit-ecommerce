# API documentation

## Health

`GET /api/health` trả về trạng thái API và timestamp. Các route nghiệp vụ sẽ được thêm theo module ở Task 02–10.

## Authentication

Các route auth dùng JSON. Response thành công có dạng `{ "success": true, "data": ... }`, lỗi có dạng `{ "success": false, "message": "..." }`.

### `POST /api/auth/register`

Body: `fullName`, `email`, `password`, `phone` (không bắt buộc). Mật khẩu 8–128 ký tự, có ít nhất một chữ cái và một chữ số. Tài khoản mới luôn có role `customer`.

Trả về `201` với `user`, `accessToken`, `refreshToken`, `expiresIn` (giây).

### `POST /api/auth/login`

Body: `email`, `password`. Trả về `user`, `accessToken`, `refreshToken`, `expiresIn`.

### `POST /api/auth/refresh`

Body: `refreshToken`. Refresh token được xoay vòng mỗi lần gọi. Trả về bộ token mới.

### `POST /api/auth/logout`

Body: `refreshToken` (hoặc gửi access token qua header). Thu hồi session hiện tại. Route idempotent.

### `POST /api/auth/forgot-password`

Body: `email`. Luôn trả về thông báo chung để tránh lộ email tồn tại. Ở môi trường không phải `production`, response có thêm `resetToken` và `expiresInMinutes` để phục vụ phát triển khi chưa cấu hình email.

### `POST /api/auth/reset-password`

Body: `token`, `password`, `confirmPassword` (không bắt buộc). Đặt lại mật khẩu và thu hồi toàn bộ session cũ.

### `GET /api/auth/me`

Yêu cầu header `Authorization: Bearer <accessToken>`. Trả về user hiện tại.

### `GET /api/users/me`

Yêu cầu header `Authorization: Bearer <accessToken>`. Trả về hồ sơ user hiện tại.

## Authorization

- Access token là JWT HS256, mặc định hết hạn sau 15 phút (`ACCESS_TOKEN_TTL_SECONDS`).
- Refresh token mặc định hết hạn sau 7 ngày (`REFRESH_TOKEN_TTL_SECONDS`) và được lưu dưới dạng hash trong collection `auth_sessions`.
- Mọi route admin phải dùng `requireAuth` + `requireAdmin`; user role `customer` nhận `403`.
- Đăng xuất hoặc đặt lại mật khẩu sẽ thu hồi session tương ứng, access token cũ không còn dùng được.

## Profile update

`PATCH /api/users/me` yêu cầu header `Authorization: Bearer <accessToken>`.
Body cho phép `fullName` và/hoặc `phone`; email, role và status không được cập nhật qua endpoint này.
