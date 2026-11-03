# Phân công task Fresh Fruit

Nhóm gồm Minh, Quân, Thuận. Mỗi người làm trọn phần FE + BE + validation + test của chức năng được giao.

## Minh — Auth, tài khoản và Admin

### Frontend

- Auth: `fe/src/pages/auth/**`
- Tài khoản: `fe/src/pages/user/Profile.jsx`, `Addresses.jsx`
- Toàn bộ admin: `fe/src/pages/admin/**`, `fe/src/components/admin/**`, `fe/src/layouts/AdminLayout.jsx`
- `AuthContext`, `useAuth`, route guard và service auth/user/address.

### Backend

- `be/src/modules/auth/**`
- `be/src/modules/users/**`
- `be/src/modules/addresses/**`
- `be/src/middlewares/authMiddleware.js`
- API admin cho sản phẩm, danh mục, voucher, inventory, order, user và review.

### Kết quả cần đạt

- Đăng ký, đăng nhập, JWT, profile, địa chỉ và phân quyền user/admin.
- Admin dashboard và CRUD quản trị có validation, pagination, loading/error/empty state.
- User thường không truy cập được admin API.
- Test auth, permission và các luồng admin chính.

## Quân — Cart, Checkout, Payment và Order

### Frontend

- `fe/src/pages/user/Cart.jsx`
- `fe/src/pages/user/Checkout.jsx`
- `fe/src/pages/user/PaymentResult.jsx`
- `fe/src/pages/user/Orders.jsx`, `OrderDetail.jsx`
- `fe/src/components/cart/**`, `order/**`, `payment/**`
- `CartContext`, cart/order/payment service.

### Backend

- `be/src/modules/carts/**`
- `be/src/modules/orders/**`
- `be/src/modules/payments/**`
- Order validator và phần kiểm tra/trừ tồn kho khi tạo đơn.

### Kết quả cần đạt

- Luồng hoàn chỉnh: sản phẩm → cart → checkout → payment → order.
- Backend tự tính tiền, kiểm tra quantity/stock/ownership; không tin total từ FE.
- Xử lý đúng trạng thái order/payment và lỗi.
- Test cart, order, payment, stock và smoke test checkout.

## Thuận — Catalog và tính năng hậu mãi

### Frontend

- Catalog: `Home.jsx`, `Products.jsx`, `Categories.jsx`, `ProductDetail.jsx`, `SearchResults.jsx`
- `fe/src/components/product/**`
- Hậu mãi: `Wishlist.jsx`, `Vouchers.jsx`, `Reviews.jsx`
- `fe/src/components/review/**`, `voucher/**`
- Product/category/review/voucher/wishlist service.

### Backend

- Catalog: `be/src/modules/products/**`, `categories/**`
- Hậu mãi: `be/src/modules/reviews/**`, `vouchers/**`, `wishlists/**`
- Seed products, categories và vouchers.

### Kết quả cần đạt

- Catalog có list/detail/category/search/filter/sort/pagination.
- Wishlist, voucher và review hoạt động đúng theo user/business rule.
- Có loading/error/empty state và giữ query khi chuyển trang.
- Test product, category, review, voucher, wishlist.

## Quy tắc phối hợp và merge

- Branch cá nhân tạo từ `develop`:

  - `feature/minh-auth-admin`
  - `feature/quan-commerce-flow`
  - `feature/thuan-catalog-engagement`

- Luồng merge: `feature/*` → `develop` → `main`.
- Mỗi người phải có cả thay đổi FE, BE và test tương ứng.
- Minh chốt contract auth/permission/admin; Quân chốt cart/order/payment; Thuận chốt catalog/hậu mãi.
- PR phải được người khác review, build/test pass và không còn conflict mới merge vào `develop`.
- Chỉ merge `develop` vào `main` khi cả ba phần hoàn thành và smoke test toàn bộ hệ thống pass.
