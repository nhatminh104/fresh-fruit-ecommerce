# Phân công phát triển Fresh Fruit

> Tài liệu được lập sau khi review repository hiện tại trên nhánh `main`.
> Nhánh tích hợp chung của nhóm là `develop`; không code trực tiếp trên `main`.

## 1. Kết quả review hiện trạng

- Repository đã có cấu trúc MERN + Vite/Tailwind, gồm `fe/`, `be/`, seed data và tài liệu.
- Backend đã có module/routes cho auth, users, products, categories, carts, orders, payments, vouchers, wishlists, reviews, addresses và inventory.
- Frontend đã có route/page/component cho user và admin, nhưng nhiều page mới là khung giao diện; cần nối API, state, loading/error/empty state và phân quyền.
- `fe/src/services/api.js` chưa có interceptor gắn token và xử lý lỗi dùng chung.
- `AuthContext`/`CartContext`, route guard, validation, CRUD admin và luồng checkout cần được hoàn thiện đồng bộ với backend.
- `docs/api-documentation.md` và `docs/development-plan.md` chưa phản ánh đầy đủ các module hiện có.
- Cần bổ sung kiểm thử tối thiểu cho API nghiệp vụ, build frontend, seed database và kiểm tra luồng chính trước khi merge vào `main`.

## 2. Phân công chính

### Minh — Backend nghiệp vụ, xác thực và đơn hàng

**Phạm vi code:**

- `be/src/modules/auth/**`
- `be/src/modules/users/**`
- `be/src/modules/addresses/**`
- `be/src/modules/carts/**`
- `be/src/modules/orders/**`
- `be/src/modules/payments/**`
- `be/src/middlewares/authMiddleware.js`
- `be/src/middlewares/errorHandler.js`
- `be/src/routes/index.js` nếu cần chỉnh wiring route

**Task phải hoàn thành:**

1. Hoàn thiện đăng ký, đăng nhập, hash mật khẩu, JWT, refresh/expiry và lấy user hiện tại.
2. Bổ sung auth middleware và phân quyền user/admin cho các endpoint tương ứng.
3. Hoàn thiện profile, địa chỉ và giỏ hàng; kiểm tra ownership để user không đọc/sửa dữ liệu người khác.
4. Hoàn thiện tạo đơn: kiểm tra product/stock, tính subtotal/discount/shipping/total ở server, transaction hoặc cơ chế chống trừ kho sai.
5. Hoàn thiện payment flow và trạng thái đơn; không tin giá/tổng tiền do frontend gửi lên.
6. Chuẩn hóa response/error code và bổ sung validation cho payload/query.
7. Cập nhật seed hoặc migration cần thiết và viết test cho auth, cart, order.

**Tiêu chí nghiệm thu:**

- Endpoint protected từ chối request thiếu/sai token.
- User chỉ truy cập được profile, cart, address, order của mình; admin mới thao tác endpoint quản trị.
- Không thể tạo đơn với sản phẩm không tồn tại, số lượng không hợp lệ hoặc vượt tồn kho.
- Test backend chạy ổn và lỗi được chuyển qua middleware chung.

### Quân — Frontend user journey và tích hợp API

**Phạm vi code:**

- `fe/src/pages/auth/**`
- `fe/src/pages/user/**`
- `fe/src/components/cart/**`
- `fe/src/components/order/**`
- `fe/src/components/payment/**`
- `fe/src/components/product/**`
- `fe/src/components/review/**`
- `fe/src/components/voucher/**`
- `fe/src/contexts/AuthContext.jsx`
- `fe/src/contexts/CartContext.jsx`
- `fe/src/hooks/**`
- `fe/src/services/**` và `fe/src/config/env.js`

**Task phải hoàn thành:**

1. Nối auth pages với API, lưu/khôi phục session và hiển thị lỗi validation.
2. Thêm interceptor token, xử lý 401/403, loading/error/empty state dùng nhất quán.
3. Hoàn thiện catalog: danh mục, tìm kiếm, filter, pagination, product detail và review.
4. Hoàn thiện cart, wishlist, voucher, checkout, chọn địa chỉ/phương thức thanh toán.
5. Hoàn thiện danh sách/chi tiết đơn và payment result theo trạng thái backend.
6. Bổ sung route guard cho user/admin theo context; đảm bảo refresh trang không mất trạng thái cần thiết.
7. Kiểm tra responsive, accessibility cơ bản, format tiền/ngày và thông báo thao tác.

**Tiêu chí nghiệm thu:**

- User có thể đi trọn luồng đăng ký/đăng nhập → xem sản phẩm → cart → checkout → xem order.
- Mọi request cần đăng nhập đều gửi token; 401 đưa user về login hợp lý.
- UI có trạng thái loading/error/empty và không crash khi API trả dữ liệu rỗng.
- `npm.cmd --prefix fe run build` chạy thành công.

### Thuận — Admin, catalog backend và tích hợp/QA

**Phạm vi code:**

- `be/src/modules/products/**`
- `be/src/modules/categories/**`
- `be/src/modules/inventory/**`
- `be/src/modules/vouchers/**`
- `be/src/modules/reviews/**`
- `be/seeds/**`
- `fe/src/pages/admin/**`
- `fe/src/components/admin/**`
- `fe/src/layouts/AdminLayout.jsx`
- `docs/**` (trừ file này nếu chỉ cập nhật phân công)

**Task phải hoàn thành:**

1. Hoàn thiện API catalog: list/detail/filter/search/pagination, category và dữ liệu seed hợp lệ.
2. Hoàn thiện CRUD admin cho sản phẩm, danh mục, voucher và inventory; kiểm tra role admin ở backend.
3. Hoàn thiện duyệt/ẩn/xóa review, quản lý order/user ở admin theo API đã thống nhất với Minh.
4. Hoàn thiện dashboard và các bảng admin: loading, error, empty, pagination, form validation và confirm destructive action.
5. Cập nhật API documentation, database/folder docs và hướng dẫn chạy project.
6. Thiết lập checklist QA, chạy build/seed, smoke test các route và ghi nhận lỗi cần sửa trước merge.

**Tiêu chí nghiệm thu:**

- Admin CRUD không cho phép dữ liệu sai schema hoặc âm tồn kho/giá.
- User thường không truy cập được API/UI admin.
- Catalog hỗ trợ filter/search/pagination mà không làm mất query khi chuyển trang.
- Tài liệu khớp endpoint thực tế; smoke test và build được ghi rõ kết quả.

## 3. Quy ước branch và merge

Tạo branch cá nhân từ `develop`:

```bash
git switch develop
git pull origin develop
git switch -c feature/minh-backend-auth-orders
git switch -c feature/quan-frontend-user-flow
git switch -c feature/thuan-admin-catalog-qa
```

Mỗi người chỉ commit trong phạm vi được giao, dùng commit nhỏ và rõ nghĩa, ví dụ:

```text
feat(auth): implement JWT login and protected routes
feat(cart): connect cart context with API
feat(admin): complete product CRUD
```

Pull request đi theo luồng:

```text
feature/* -> develop -> main
```

- PR vào `develop` cần ít nhất một người khác review, build pass và không có conflict.
- Không force-push `develop`/`main`; không merge trực tiếp vào `main` trong lúc phát triển.
- Chỉ merge `develop` vào `main` khi toàn bộ task hoàn tất, smoke test pass và nhóm xác nhận release.

## 4. Checklist trước khi merge vào main

- [ ] Backend start được khi có `MONGODB_URI` và `CLIENT_URL`.
- [ ] Seed chạy được trên database test.
- [ ] Auth, catalog, cart, checkout/order và admin smoke test pass.
- [ ] Frontend build pass.
- [ ] Không commit `.env`, secret hoặc dữ liệu nhạy cảm.
- [ ] API docs và README được cập nhật.
- [ ] Đã review diff của từng PR và xử lý conflict trên `develop`.

## 6. Phân công mới theo vertical slice FE + BE

> **Mục này thay thế toàn bộ mục 2–5 ở phía trên.** Mỗi thành viên làm cả giao diện FE, API/module BE, validation, seed/test và tài liệu cho cùng một nhóm chức năng.

### Minh — Auth, tài khoản và hồ sơ người dùng

**FE:** `fe/src/pages/auth/**`, `fe/src/pages/user/Profile.jsx`, `fe/src/pages/user/Addresses.jsx`, `fe/src/contexts/AuthContext.jsx`, `fe/src/hooks/useAuth.js`, `fe/src/services/authService.js`, `userService.js`, `addressService.js`, route guard.

**BE:** `be/src/modules/auth/**`, `users/**`, `addresses/**`, `be/src/middlewares/authMiddleware.js`, `errorHandler.js`.

**Đầu việc:** hoàn thiện register/login/JWT/me/forgot-password, profile, địa chỉ, phân quyền user/admin, khôi phục session, interceptor token/401 dùng chung; viết test cho auth/profile/address. User chỉ được truy cập dữ liệu của mình.

### Quân — Catalog, tìm kiếm và đánh giá sản phẩm

**FE:** `fe/src/pages/user/Home.jsx`, `Products.jsx`, `Categories.jsx`, `ProductDetail.jsx`, `SearchResults.jsx`, `Reviews.jsx`, `fe/src/components/product/**`, `review/**`, các service product/category/review.

**BE:** `be/src/modules/products/**`, `categories/**`, `reviews/**`, seed `be/seeds/data/products.json` và `categories.json`.

**Đầu việc:** hoàn thiện list/detail/category/search/filter/sort/pagination, review theo quyền, response/query validation, loading/error/empty state, seed và test product/category/review. Query filter phải được giữ khi chuyển trang.

### Thuận — Giỏ hàng, checkout, đơn hàng, thanh toán và quản trị

**FE:** `fe/src/pages/user/Cart.jsx`, `Checkout.jsx`, `PaymentResult.jsx`, `Orders.jsx`, `OrderDetail.jsx`, `Wishlist.jsx`, `Vouchers.jsx`, toàn bộ `fe/src/pages/admin/**`, `components/cart/**`, `order/**`, `payment/**`, `admin/**`, `CartContext.jsx`, cart/order/payment/voucher/wishlist services.

**BE:** `be/src/modules/carts/**`, `orders/**`, `payments/**`, `vouchers/**`, `wishlists/**`, `inventory/**`, endpoint admin và seed liên quan.

**Đầu việc:** hoàn thiện cart/wishlist/voucher/checkout/payment/order, server tự tính tiền và kiểm tra stock, admin CRUD sản phẩm/category/voucher/inventory và quản lý order/user/review, role admin, test cart/order/voucher/inventory và smoke test product → cart → checkout → order.

### Quy tắc phối hợp và merge

- Minh chốt contract auth/user/address trước khi Quân và Thuận tích hợp API protected.
- Quân chốt contract product/category/review; Thuận chốt contract cart/order/payment/voucher/inventory.
- Branch cá nhân: `feature/minh-auth-account`, `feature/quan-catalog-review`, `feature/thuan-commerce-admin`.
- Luồng merge: `feature/* -> develop -> main`; mỗi PR phải ghi page FE, endpoint BE, test đã chạy và cần một người khác review.
- Không code trực tiếp hoặc force-push `develop`/`main`. Chỉ merge `develop` vào `main` sau khi cả ba vertical slice, build và smoke test đều pass.
