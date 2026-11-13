# Fresh Fruit — Website Thương Mại Điện Tử Trái Cây Tươi

Nền tảng mua sắm trái cây tươi chạy thực tế trên MongoDB: React/Vite/Tailwind ở frontend, Express/Mongoose ở backend, JWT access + refresh token rotation, tồn kho và voucher được xử lý nguyên tử. Dự án phục vụ cả khu vực khách hàng mua sắm và khu vực Admin quản trị.

## Mục tiêu

Xây dựng một web thương mại điện tử hoàn chỉnh cho cửa hàng trái cây: từ duyệt sản phẩm, giỏ hàng, checkout, thanh toán đến quản lý đơn hàng, tồn kho, voucher và người dùng — với dữ liệu thật từ MongoDB, không dùng mock data.

## Chức năng User

- Đăng ký, đăng nhập, đăng xuất; khôi phục mật khẩu; phiên lưu trong `sessionStorage` (đóng tab là hết phiên, tự logout sau 30 phút không thao tác).
- Duyệt danh mục, tìm kiếm, lọc giá/danh mục, sắp xếp, phân trang sản phẩm.
- Chi tiết sản phẩm: ảnh, giá, tồn kho, đánh giá, sản phẩm tương tự, yêu thích.
- Giỏ hàng đồng bộ server: thêm/sửa số lượng/xóa/tải lại đúng tồn kho.
- Checkout: chọn địa chỉ có sẵn hoặc thêm mới, áp dụng/gỡ voucher (kiểm tra hạn dùng, đơn tối thiểu, lượt sử dụng), ghi chú, idempotency key chống tạo đơn trùng.
- Thanh toán: **COD** (trả khi nhận hàng) và **mock online** (demo, tự xác nhận đơn). Đơn mock lỗi có nút **Thanh toán lại** ở trang chi tiết đơn.
- Đơn hàng: danh sách, chi tiết, tiến trình trạng thái, hủy đơn khi còn `pending`/`confirmed` và chưa thanh toán.
- Wishlist, đánh giá sản phẩm (chỉ sau khi nhận hàng, chờ admin duyệt), quản lý địa chỉ và hồ sơ.

## Chức năng Admin

- Dashboard: KPI doanh thu/đơn/người dùng/sản phẩm, biểu đồ doanh thu 6 tháng, cơ cấu thanh toán, đơn theo trạng thái, top sản phẩm bán chạy, đơn gần đây, cảnh báo sắp hết hàng — tất cả aggregate từ MongoDB.
- Sản phẩm & danh mục: tìm kiếm, lọc, phân trang, thêm/sửa/ẩn-hiện.
- Đơn hàng: tìm kiếm, lọc trạng thái/thanh toán, chuyển trạng thái theo quy tắc (`pending→confirmed→shipping→delivered`, hủy hoàn stock + voucher).
- Người dùng: tìm kiếm, lọc vai trò/trạng thái, khóa-mở khóa, đổi vai trò; backend chặn tự hạ quyền và bảo vệ admin cuối cùng.
- Voucher: CRUD, bật/tắt, theo dõi `usedCount`; admin vẫn xem được voucher hết hạn/đã tắt.
- Đánh giá: kiểm duyệt, xóa; Inventory: xem/cập nhật số lượng và ngưỡng cảnh báo.

## Công nghệ

| Tầng | Công nghệ |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router 7, Axios, Lucide React, Vitest, ESLint |
| Backend | Node.js, Express, Mongoose (MongoDB), JWT HS256 tự cài, scrypt hash mật khẩu, rate limit in-memory |
| Database | MongoDB — 12 collections: users, auth_sessions, products, categories, carts, orders, payments, vouchers, wishlists, reviews, addresses, inventories |

Kiến trúc backend: `Route → Controller → Service → Model`, lỗi tập trung qua `asyncHandler` + `ApiError` + `errorHandler`. Tạo/hủy đơn dùng MongoDB transaction khi có replica set, fallback tuần tự an toàn trên standalone.

## Cấu trúc thư mục

```
├── be/
│   ├── src/modules/       # auth, users, products, categories, carts, orders,
│   │                      # payments, vouchers, wishlists, reviews, addresses,
│   │                      # inventory, admin — mỗi module route/controller/service/model
│   ├── src/middlewares/   # authMiddleware, errorHandler, notFound, rateLimit
│   ├── src/config/        # database connection
│   ├── seeds/             # seed danh mục/sản phẩm/voucher + tài khoản demo (idempotent)
│   ├── scripts/           # check-syntax, fix ảnh sản phẩm, start-dev
│   └── tests/             # node:test — auth, validation, commerce, business-logic
├── fe/
│   └── src/{pages,components,services,contexts,hooks,routes,layouts,utils}
├── docs/
│   ├── API_DOCUMENTATION.md   # đặc tả REST API
│   ├── DATABASE_DESIGN.md     # thiết kế schema & quan hệ
│   ├── TESTING_GUIDE.md       # hướng dẫn kiểm thử
│   └── PROJECT_GUIDELINES.md  # quy ước kiến trúc & code
├── .github/workflows/ci.yml
└── .env.example           # biến môi trường backend (copy thành .env ở root)
```

## Yêu cầu môi trường

- Node.js 18+
- MongoDB chạy local hoặc URI riêng
- Không cần tài khoản dịch vụ ngoài — thanh toán online là mock nội bộ

## Cài đặt

```bash
npm install
npm --prefix fe install
npm --prefix be install
cp .env.example .env        # file .env đặt ở ROOT repo (backend tự đọc)
npm --prefix be run seed    # danh mục + sản phẩm + voucher mẫu (idempotent)
npm run dev                 # chạy cả FE (:5173) và BE (:5001) song song
```

## Kiểm thử

```bash
npm --prefix be test        # backend: node:test (50 tests — auth, giỏ hàng, đơn, voucher, payment, admin)
npm --prefix be run check   # syntax check toàn bộ backend
npm --prefix fe test        # frontend: vitest
npm --prefix fe run lint    # eslint
npm --prefix fe run build   # production build
```

## Thanh toán

- **COD**: đơn ở `pending`, admin chuyển `confirmed → shipping → delivered`; khi giao admin đánh dấu đã thanh toán (tự tạo/cập nhật bản ghi Payment).
- **Mock**: mô phỏng cổng online — `POST /api/payments` với `method: 'mock'` trả `paid` ngay và xác nhận đơn. **Không phải tích hợp cổng thật.**

## Tài khoản & phân quyền

- Khách hàng đăng nhập tại `/login`, đăng ký tại `/register` (chỉ tạo role `customer`).
- Admin đăng nhập tại `/admin-login` — cổng riêng; backend từ chối đăng nhập sai cổng.
- API `/api/admin/*` yêu cầu role `admin`; API giỏ hàng/đơn/payment/wishlist/review/address yêu cầu role `customer`.

## Tài liệu liên quan

- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) — danh sách endpoint, request/response
- [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) — schema collections, index, quan hệ
- [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md) — kịch bản kiểm thử thủ công
- [`docs/PROJECT_GUIDELINES.md`](docs/PROJECT_GUIDELINES.md) — quy ước kiến trúc & code
