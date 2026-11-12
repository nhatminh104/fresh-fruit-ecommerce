# Fresh Fruit — Website Thương Mại Điện Tử Trái Cây Tươi

Nền tảng mua sắm trái cây tươi MERN stack: React/Vite/Tailwind ở frontend, Express/Mongoose/MongoDB ở backend, JWT access + refresh token rotation, transaction cho tạo/hủy đơn, tồn kho và voucher.

## Công nghệ

- **Frontend**: React 18, Vite, Tailwind CSS, React Router 7, Axios, Lucide React, Vitest, ESLint + Prettier.
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT tự cài (HS256), scrypt password hashing, rate limit in-memory.
- **Kiến trúc backend**: `Route → Controller → Service → Model`, lỗi tập trung qua `asyncHandler` + `ApiError` + `errorHandler`.

## Chức năng chính

- Đăng ký/đăng nhập, refresh token rotation, quên/đặt lại mật khẩu.
- Phiên đăng nhập lưu trong `sessionStorage`: đóng tab/trình duyệt là hết phiên; tự đăng xuất sau 30 phút không thao tác; logout xóa token và vô hiệu refresh token phía server.
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
cp .env.example .env     
npm run seed            
npm --prefix be run seed:demo  
npm run dev              
```

## Kiểm tra & kiểm thử

```bash
npm --prefix be test        # backend tests (node:test)
npm --prefix be run check   # backend syntax check
npm --prefix fe test        # frontend unit tests (vitest)
npm --prefix fe run lint    # eslint
npm --prefix fe run build   # production build
```

