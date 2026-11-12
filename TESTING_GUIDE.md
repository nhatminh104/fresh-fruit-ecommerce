# Testing Guide — Fresh Fruit

## Backend (`be/`)

```bash
npm --prefix be test          # node:test — unit + integration tests
npm --prefix be run check     # syntax check toàn bộ src
```

**Yêu cầu:** MongoDB đang chạy tại `127.0.0.1:27017` (mặc định `MONGODB_URI` trỏ tới `mongodb://127.0.0.1:27017/fresh-fruit-test`). Có thể override bằng biến môi trường `MONGODB_URI`.

Test hiện có (42 tests):
- `tests/auth.test.js` — password hashing (scrypt), JWT sign/verify/tamper/expiry, validators, middleware, token utils.
- `tests/business-logic.test.js` — **integration test với MongoDB thật**: tạo đơn, trừ kho atomic, race condition mua sản phẩm cuối, idempotency key (kể cả request đồng thời), hủy đơn 1 lần, thanh toán trùng/đồng thời, phân quyền ownership, admin auth, rollback fallback.
- `tests/commerce-flow.test.js` — **integration test với MongoDB thật** (database `fresh-fruit-test-flow`): voucher percent/fixed/maxDiscount/minOrder/usageLimit/expiry, hoàn lượt voucher khi hủy, review chỉ sau khi delivered + chống trùng, ownership địa chỉ, giỏ hàng, chuyển trạng thái đơn theo `allowedTransitions`, chặn customer tự nâng quyền admin.
- `tests/commerce.test.js` — order validator, product listing, schema indexes.
- `tests/validation.test.js` — address validator (create đủ field / PATCH một phần), rate limiter.

Lưu ý: `business-logic.test.js` và `commerce-flow.test.js` chạy song song trên 2 database riêng (`fresh-fruit-test` / `fresh-fruit-test-flow`) và tự drop database sau khi chạy.

CI (`.github/workflows/ci.yml`) provision service `mongo:7` với health check `mongosh ping` trước khi chạy `npm --prefix be test`.

## Frontend (`fe/`)

```bash
npm --prefix fe test          # vitest — unit tests cho utils
npm --prefix fe run lint      # eslint
npm --prefix fe run format    # prettier --write
npm --prefix fe run build     # production build (bao gồm kiểm tra import)
```

`src/utils/utils.test.js` cover `formatCurrency`, `formatDate`, `validators`, `getErrorMessage`.

## E2E (đề xuất — chưa triển khai)

Playwright cho luồng mua hàng và admin:

1. `npm --prefix fe i -D @playwright/test && npx playwright install chromium`
2. `webServer` trong `playwright.config.js` chạy `npm run seed` + `npm --prefix be start` + `npm --prefix fe run dev`.
3. Kịch bản tối thiểu: đăng ký → đăng nhập → thêm giỏ → checkout COD → xem đơn → admin xác nhận → giao → đánh giá.

## Smoke test thủ công

```bash
npm install && npm --prefix fe install && npm --prefix be install
cp .env.example .env   # cấu hình MONGODB_URI + JWT_SECRET + SEED_*_PASSWORD
npm run seed           # nạp danh mục, sản phẩm, voucher, tài khoản demo
npm run dev
```

Tài khoản demo (sau khi seed): `admin@freshfruit.local`, `customer@freshfruit.local` — mật khẩu lấy từ `SEED_ADMIN_PASSWORD` / `SEED_CUSTOMER_PASSWORD`.
