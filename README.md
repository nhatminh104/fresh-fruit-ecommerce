# Fresh Fruit — Website Thương Mại Điện Tử Trái Cây Tươi

Nền tảng mua sắm trái cây tươi MERN stack: React/Vite/Tailwind ở frontend, Express/Mongoose/MongoDB ở backend, JWT access + refresh token rotation, transaction cho tạo/hủy đơn, tồn kho và voucher.

## Công nghệ

- **Frontend**: React 18, Vite, Tailwind CSS, React Router 7, Axios, Lucide React, Vitest, ESLint + Prettier.
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT tự cài (HS256), scrypt password hashing, rate limit in-memory.
- **Kiến trúc backend**: `Route → Controller → Service → Model`, lỗi tập trung qua `asyncHandler` + `ApiError` + `errorHandler`.

## Chức năng chính

- Đăng ký/đăng nhập, refresh token rotation, quên/đặt lại mật khẩu.
- Danh mục & sản phẩm: tìm kiếm, lọc danh mục/giá, sắp xếp, phân trang.
- Giỏ hàng, checkout (địa chỉ, COD / thanh toán online demo, mã giảm giá), idempotency key chống tạo đơn trùng.
- Đơn hàng: xem danh sách/chi tiết, hủy đơn (hoàn stock + voucher đúng một lần).
- Voucher, wishlist, đánh giá (chỉ sau khi nhận hàng, chờ admin duyệt).
- Admin: dashboard, CRUD sản phẩm/danh mục/voucher, quản lý đơn (chuyển trạng thái), người dùng, đánh giá, tồn kho.

## Cấu trúc thư mục

```
├── be/                  # Backend Express
│   ├── src/modules/     # auth, users, products, categories, carts, orders,
│   │                    # payments, vouchers, wishlists, reviews, addresses,
│   │                    # inventory, admin (route/controller/service/model)
│   ├── src/middlewares/ # auth, error handler, rate limit
│   ├── seeds/           # dữ liệu mẫu + tài khoản demo
│   └── tests/           # node:test unit & contract tests
├── fe/                  # Frontend React + Vite
│   └── src/{pages,components,services,contexts,hooks,routes,layouts}
├── PROJECT_GUIDELINES.md
├── API_DOCUMENTATION.md
├── DATABASE_DESIGN.md
└── TESTING_GUIDE.md
```

## Cài đặt & chạy

```bash
npm install
npm --prefix fe install
npm --prefix be install
cp .env.example .env     # điền MONGODB_URI, JWT_SECRET, SEED_*_PASSWORD
npm run seed             # nạp dữ liệu mẫu (cần MongoDB đang chạy)
npm run dev              # fe: http://localhost:5173 — be: http://localhost:5001
```

Biến môi trường quan trọng: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS`, `SEED_ADMIN_PASSWORD`, `SEED_CUSTOMER_PASSWORD`, `SEED_PASSWORD_SALT`. Frontend dùng `VITE_API_URL` (mặc định `http://localhost:5001/api`).

Production nên dùng MongoDB **replica set** để transaction tạo/hủy đơn, stock và voucher có tính nguyên tử đầy đủ (code đã fallback an toàn cho standalone).

## Tài khoản demo (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@freshfruit.local` | `SEED_ADMIN_PASSWORD` |
| Customer | `customer@freshfruit.local` | `SEED_CUSTOMER_PASSWORD` |

Dữ liệu seed gồm 3 danh mục, 11 sản phẩm, 2 voucher (`WELCOME10`, `FREESHIP30`), bản ghi `Inventory` cho từng sản phẩm và 2 tài khoản demo. Seed idempotent — chạy lại không tạo trùng, không ghi đè `stock`/`soldCount`/tồn kho admin đã chỉnh.

## Kiểm tra & kiểm thử

```bash
npm --prefix be test        # backend tests (node:test)
npm --prefix be run check   # backend syntax check
npm --prefix fe test        # frontend unit tests (vitest)
npm --prefix fe run lint    # eslint
npm --prefix fe run build   # production build
```

Chi tiết: [TESTING_GUIDE.md](TESTING_GUIDE.md) · API: [API_DOCUMENTATION.md](API_DOCUMENTATION.md) · DB: [DATABASE_DESIGN.md](DATABASE_DESIGN.md) · Quy tắc nhóm: [PROJECT_GUIDELINES.md](PROJECT_GUIDELINES.md)
