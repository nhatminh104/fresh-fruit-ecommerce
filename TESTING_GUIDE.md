# Testing Guide — Fresh Fruit

## Backend (`be/`)

```bash
npm --prefix be test          # node:test — unit & contract tests
npm --prefix be run check     # syntax check toàn bộ src
```

Test hiện có (33 tests):
- `tests/auth.test.js` — password hashing (scrypt), JWT sign/verify/tamper/expiry, validators, middleware, token utils.
- `tests/business-logic.test.js` — nghiệp vụ cốt lõi (order/payment/review schema invariants, services).
- `tests/commerce.test.js` — order validator, product listing, schema indexes.
- `tests/validation.test.js` — address validator (create đủ field / PATCH một phần), rate limiter.

Lưu ý: test là unit/contract — chưa cần MongoDB thật. Integration test với MongoDB (kể cả replica set cho transaction) là việc nên bổ sung khi có môi trường CI có service MongoDB.

## Frontend (`fe/`)

```bash
npm --prefix fe test          # vitest — unit tests cho utils
npm --prefix fe run lint      # eslint
npm --prefix fe run build     # production build (bao gồm kiểm tra import)
```

`src/utils/utils.test.js` cover `formatCurrency`, `formatDate`, `validators`, `getErrorMessage`.

## E2E (đề xuất)

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
