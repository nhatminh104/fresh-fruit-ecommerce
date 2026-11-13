# Fresh Fruit – Project Guidelines

## Tổng quan

Fresh Fruit là website thương mại điện tử trái cây tươi, gồm:

- `fe/`: React, Vite, Tailwind CSS, React Router, Axios và Lucide React.
- `be/`: Node.js, Express, MongoDB/Mongoose, JWT và middleware phân quyền.
- Backend giữ kiến trúc `Route → Controller → Service → Model`.
- Không tạo frontend/backend song song và không coi dữ liệu trình bày Home là dữ liệu sản phẩm thật.

## Chạy project

```bash
npm install
npm --prefix fe install
npm --prefix be install
npm run dev
```

Sao chép `.env.example` thành `.env` ở root và cấu hình `MONGODB_URI`. Backend cũng hỗ trợ `.env` cũ trong `be/`.

```bash
npm --prefix be test
npm --prefix be run check
npm --prefix fe run build
```

Production nên dùng MongoDB replica set để transaction Order, stock và voucher có tính nguyên tử đầy đủ.

## Quy tắc backend

- Route chỉ khai báo endpoint và middleware.
- Controller nhận request, gọi service và trả response.
- Service xử lý nghiệp vụ; Model định nghĩa schema, validation, index và reference.
- Lỗi tập trung qua `asyncHandler`, `ApiError` và `errorHandler`.
- Response thành công: `{ success: true, data: ... }`.
- Response lỗi: `{ success: false, message: ... }`.
- API admin luôn được bảo vệ bằng `requireAuth` và `requireAdmin` ở backend.
- Không tin giá, tổng tiền, tồn kho hoặc trạng thái do frontend gửi lên.
- Không trả password, refresh token hash hoặc reset token hash ra API.
- Kiểm tra ownership với cart, order, payment, address, wishlist và review.
- `Product.stock` là nguồn tồn kho chính; `inventory.quantity` chỉ là dữ liệu tương thích cho admin.
- Order phải snapshot thông tin sản phẩm và địa chỉ tại thời điểm checkout.
- Tạo order dùng idempotency key, kiểm tra stock/voucher tại backend và rollback khi thất bại.
- Chỉ cho hủy order ở `pending` hoặc `confirmed`; hủy phải hoàn stock và voucher đúng một lần.
- Review chỉ được tạo bởi người đã mua sản phẩm trong order `delivered`, mặc định chờ admin duyệt.
- Mock payment chỉ mô phỏng, không mô tả là giao dịch thật.

## Quy tắc frontend

- Ưu tiên component dùng chung, mobile-first và accessibility.
- Ảnh phải có `alt`, dùng `object-fit` phù hợp; không dùng emoji thay icon giao diện.
- Các page nghiệp vụ phải có loading, empty, error và thông báo thao tác phù hợp.
- Dùng Header/Footer chung theo layout hiện tại; không tạo page implementation trùng chức năng.
- Nội dung hiển thị cho người dùng dùng tiếng Việt.
- Không đưa logic nghiệp vụ quan trọng vào React component nếu backend phải chịu trách nhiệm.
- Không dùng dữ liệu mock cho các màn hình sản phẩm, cart, checkout, order, payment, voucher, review hoặc admin.
- Design system dùng forest `#245C3A`, leaf `#4F8A52`, cream `#FAF8F1`, orange `#F2A65A`.
- Kiểm tra responsive tại 1440px, 1280px, 768px, 390px và 375px.

## API chính

- Auth: `/api/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/me`.
- User/address: `/api/users/me`, `/api/addresses`.
- Catalog: `/api/products`, `/api/categories`.
- Cart: `/api/carts`, `/api/carts/items`.
- Order: `/api/orders`; tạo order nhận `idempotencyKey`; hủy order qua `POST /api/orders/:id/cancel`.
- Payment: `/api/payments`, hỗ trợ `cod` và `mock`, chống tạo payment trùng theo order.
- Voucher: `/api/vouchers`.
- Wishlist: `/api/wishlists`.
- Review: `/api/reviews/product/:productId`, `/api/reviews/mine`, `POST /api/reviews`.
- Admin: `/api/admin/*`, bắt buộc admin role.

## Quy trình làm việc

1. Kiểm tra `git status`, cấu trúc file và API liên quan trước khi sửa.
2. Tái sử dụng implementation hiện có, không tạo file duplicate.
3. Sửa nguyên nhân gốc và các module bị ảnh hưởng.
4. Chạy test backend, syntax check và frontend build.
5. Ghi nhận giới hạn nếu cần MongoDB thật, replica set hoặc external payment provider.
6. Luồng merge: `feature/* → develop → main`; chỉ merge `develop` vào `main` sau smoke test toàn hệ thống.

## Trạng thái hiện tại

- Backend controllers đã dùng `asyncHandler` và response lỗi được chuẩn hóa.
- Auth dùng JWT access token, refresh token rotation và session lưu hash; auth/order/payment endpoints có rate limit.
- Cart, catalog, checkout (có voucher), order, payment, voucher, review, wishlist, address và admin đã có API chính.
- Frontend dùng `MainLayout` chung cho mọi page (kể cả Home); admin có CRUD sản phẩm/danh mục/voucher, chuyển trạng thái đơn, sửa tồn kho và phân quyền người dùng.
- Test hiện tại là unit/contract test; integration test với MongoDB thật vẫn cần bổ sung.
- ESLint/Prettier đã cấu hình ở `fe/`; CI chạy ở `.github/workflows/ci.yml`.
