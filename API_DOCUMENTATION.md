# Fresh Fruit – API Documentation

Base URL: `http://localhost:5001/api` (cấu hình qua `VITE_API_URL` ở frontend).

## Quy ước response

- Thành công: `{ "success": true, "data": ... }`
- Lỗi: `{ "success": false, "message": "..." }` kèm HTTP status phù hợp (400/401/403/404/409/429/500).
- Xác thực: header `Authorization: Bearer <accessToken>` cho các API cần đăng nhập.
- Admin: bắt buộc user có `role = 'admin'`.

## Auth — `/api/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký (fullName, email, password, phone?). Trả về user + accessToken + refreshToken. |
| POST | `/login` | Đăng nhập (email, password). |
| POST | `/refresh` | Đổi refresh token (rotation, token cũ bị vô hiệu). Body: `{ refreshToken }`. |
| POST | `/logout` | Thu hồi session. Body: `{ refreshToken }` (idempotent). |
| POST | `/forgot-password` | Gửi reset token (dev: trả `resetToken` trong response). |
| POST | `/reset-password` | Đặt lại mật khẩu `{ token, password, confirmPassword? }`, thu hồi mọi session. |
| GET | `/me` | Thông tin user hiện tại. |

Auth endpoints có rate limit 40 req / 15 phút / IP.

## Users & Addresses

- `GET /api/users/me`, `PATCH /api/users/me` — hồ sơ (fullName, phone).
- `GET|POST /api/addresses`, `PATCH|DELETE /api/addresses/:id` — sổ địa chỉ. PATCH hỗ trợ cập nhật một phần; `isDefault` chỉ được set boolean.

## Catalog

- `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=newest|price_asc|price_desc|popular&featured=true&page=&limit=` → `{ items, pagination }`.
- `GET /api/products/:idOrSlug`.
- `GET /api/categories`.

## Cart — `/api/carts` (auth)

- `GET /` — giỏ hàng (items đã populate product).
- `POST /items` `{ product, quantity }`.
- `PATCH /items` `{ product, quantity }`.
- `DELETE /items/:productId`, `DELETE /` (xóa toàn bộ).

## Orders — `/api/orders` (auth)

- `GET /` — đơn của user. `GET /:id` — chi tiết (kiểm tra ownership).
- `POST /` — tạo đơn. Body: `{ items: [{product, quantity}], shippingAddress: {recipientName, phone, province, district, ward, streetAddress}, paymentMethod: 'cod'|'mock', voucherCode?, note?, idempotencyKey }`. `idempotencyKey` (8–120 ký tự) chống tạo đơn trùng. Giá/tổng tiền do server tính; tồn kho trừ nguyên tử.
- `POST /:id/cancel` — hủy đơn ở `pending`/`confirmed`, hoàn stock + voucher đúng một lần.

Rate limit tạo đơn: 30 req / 15 phút / user-IP.

## Payments — `/api/payments` (auth)

- `POST /` `{ orderId, method: 'cod'|'mock', amount? }` — `mock` mô phỏng thanh toán online (tự động `paid` + order → `confirmed`); `cod` tạo payment `pending`. Một payment / order (unique index). `amount` nếu gửi phải khớp `order.totalAmount`.

## Vouchers — `/api/vouchers`

- `GET /` — voucher đang active (public).

## Wishlists — `/api/wishlists` (auth)

- `GET /`, `POST /items { product }`, `DELETE /items/:productId`.

## Reviews — `/api/reviews`

- `GET /product/:productId` — review đã duyệt.
- `GET /mine` (auth) — review của tôi.
- `POST /` (auth) `{ product, rating 1-5, comment?, order? }` — chỉ cho đơn `delivered` chứa sản phẩm; mỗi user 1 review / sản phẩm; mặc định chờ duyệt.

## Inventory — `/api/inventory` (admin)

- `GET /` — tồn kho theo sản phẩm (`quantity` = `Product.stock`, `lowStockAt`).

## Admin — `/api/admin/*` (admin)

| Resource | Endpoints |
|---|---|
| `/dashboard` | GET — users, products, orders, revenue |
| `/products` | GET, POST; `/products/:id` PATCH, DELETE (archive = isActive:false) |
| `/categories` | GET, POST; `/categories/:id` PATCH, DELETE |
| `/orders` | GET, `/orders/:id` GET; `/orders/:id` PATCH `{status}` — chuyển trạng thái theo `Order.allowedTransitions` |
| `/users` | GET, `/users/:id` GET; `/users/:id` PATCH `{fullName, phone, role, status}` — admin không thể tự đổi `role`/`status` của chính mình (400) |
| `/reviews` | GET; `/reviews/:id` PATCH `{isApproved}`, DELETE |
| `/vouchers` | GET, POST; `/vouchers/:id` PATCH, DELETE |
| `/inventory` | GET; `/inventory/:productId` PATCH `{quantity, lowStockAt}` |

## Trạng thái đơn hàng

`pending → confirmed → shipping → delivered`, hoặc `pending|confirmed → cancelled`. `delivered` + COD tự động `paymentStatus = paid`.
