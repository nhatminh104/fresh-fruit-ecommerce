# Phân công task Fresh Fruit

Mỗi người phụ trách trọn chức năng của mình: giao diện FE, API/BE, validation, phân quyền, test và tài liệu liên quan.

## Minh — Auth, tài khoản và Admin

### FE Minh code

- `fe/src/pages/auth/Login.jsx`
- `fe/src/pages/auth/Register.jsx`
- `fe/src/pages/auth/ForgotPassword.jsx`
- `fe/src/pages/user/Profile.jsx`
- `fe/src/pages/user/Addresses.jsx`
- Toàn bộ `fe/src/pages/admin/**`
- Toàn bộ `fe/src/components/admin/**`
- `fe/src/layouts/AdminLayout.jsx`
- `fe/src/contexts/AuthContext.jsx`
- `fe/src/hooks/useAuth.js`
- `fe/src/services/authService.js`
- `fe/src/services/userService.js`
- `fe/src/services/addressService.js`
- Route guard user/admin trong `fe/src/routes/index.jsx`.

### BE Minh code

- `be/src/modules/auth/**`
- `be/src/modules/users/**`
- `be/src/modules/addresses/**`
- `be/src/middlewares/authMiddleware.js`
- API admin cho sản phẩm, danh mục, voucher, inventory, order, user và review.
- Phần permission/role admin và các route admin liên quan.

### Minh phải hoàn thành

- Register, login, JWT, lấy user hiện tại, profile, địa chỉ và logout/session.
- Admin dashboard, CRUD và quản lý các màn hình trong `fe/src/pages/admin/**`.
- Validation form, loading/error/empty state, pagination và confirm thao tác xóa/cập nhật.
- User thường không thể truy cập trang hoặc API admin.
- Test auth, permission và các luồng admin chính.

## Quân — Cart, Checkout, Payment và Order

### FE Quân code

- `fe/src/pages/user/Cart.jsx`
- `fe/src/pages/user/Checkout.jsx`
- `fe/src/pages/user/PaymentResult.jsx`
- `fe/src/pages/user/Orders.jsx`
- `fe/src/pages/user/OrderDetail.jsx`
- `fe/src/components/cart/**`
- `fe/src/components/order/**`
- `fe/src/components/payment/**`
- `fe/src/contexts/CartContext.jsx`
- `fe/src/services/cartService.js`
- `fe/src/services/orderService.js`
- `fe/src/services/paymentService.js`

### BE Quân code

- `be/src/modules/carts/**`
- `be/src/modules/orders/**`
- `be/src/modules/payments/**`
- `be/src/modules/orders/order.validator.js`
- Phần kiểm tra và cập nhật tồn kho khi tạo đơn.

### Quân phải hoàn thành

- Luồng hoàn chỉnh: xem sản phẩm → thêm cart → checkout → payment → order.
- Backend tự tính giá, subtotal, discount, shipping và total.
- Kiểm tra user, quantity, product, stock và trạng thái payment/order.
- Không tin giá hoặc total do frontend gửi lên.
- Test cart, order, payment, stock và smoke test checkout.

## Thuận — Catalog và các chức năng sản phẩm

### FE Thuận code

- `fe/src/pages/user/Home.jsx`
- `fe/src/pages/user/Products.jsx`
- `fe/src/pages/user/Categories.jsx`
- `fe/src/pages/user/ProductDetail.jsx`
- `fe/src/pages/user/SearchResults.jsx`
- `fe/src/pages/user/Wishlist.jsx`
- `fe/src/pages/user/Vouchers.jsx`
- `fe/src/pages/user/Reviews.jsx`
- `fe/src/components/product/**`
- `fe/src/components/review/**`
- `fe/src/components/voucher/**`
- `fe/src/services/productService.js`
- `fe/src/services/categoryService.js`
- `fe/src/services/wishlistService.js`
- `fe/src/services/voucherService.js`
- `fe/src/services/reviewService.js`

### BE Thuận code

- `be/src/modules/products/**`
- `be/src/modules/categories/**`
- `be/src/modules/wishlists/**`
- `be/src/modules/vouchers/**`
- `be/src/modules/reviews/**`
- `be/seeds/data/products.json`
- `be/seeds/data/categories.json`
- `be/seeds/data/vouchers.json`

### Thuận phải hoàn thành

- Product list/detail, category, search, filter, sort và pagination.
- Wishlist thêm/xóa/xem theo user.
- Voucher list/chi tiết/kiểm tra điều kiện sử dụng theo contract của Quân.
- Review xem/tạo và giới hạn quyền theo user/business rule.
- Loading/error/empty state, giữ query khi chuyển trang.
- Test product, category, wishlist, voucher và review.

## Quy tắc làm việc

- Branch cá nhân:
  - `feature/minh-auth-admin`
  - `feature/quan-commerce`
  - `feature/thuan-catalog`
- Luồng merge: `feature/*` → `develop` → `main`.
- Mỗi task phải có cả FE, BE và test; không chỉ làm giao diện giả hoặc API riêng lẻ.
- Minh chốt permission/admin, Quân chốt cart/order/payment, Thuận chốt catalog/wishlist/voucher/review.
- Trước khi merge vào `develop`: build pass, test pass, có người khác review và không còn conflict.
- Chỉ merge `develop` vào `main` khi cả ba nhóm hoàn tất và smoke test toàn bộ hệ thống pass.
