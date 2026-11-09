# Refactor status

## Completed in the current refactor pass

- Backend controllers use `asyncHandler` for async request failures.
- Error responses normalize CastError, validation errors and duplicate keys.
- Product detail accepts both slug and ObjectId and returns a clean 404.
- Order stock reservation uses atomic conditional updates and rollback on failure.
- Voucher usage is incremented conditionally and rolled back when order creation fails.
- Payment API checks order ownership and avoids creating duplicate active payments.
- Reviews require an authenticated user who has a delivered order containing the product; duplicate reviews are rejected.
- Frontend has one routed implementation per business page, shared header/footer, toast provider and useful fallback content for information pages.

## Verification

```bash
npm.cmd --prefix be test
npm.cmd --prefix be run check
npm.cmd --prefix fe run build
```

ESLint and Prettier are not currently dependencies in this repository. The syntax check and production build are available now; adding ESLint/Prettier should be a separate dependency-install change.

## Remaining production hardening

- Run order/stock/voucher writes inside a MongoDB replica-set transaction in production.
- Add integration tests backed by a disposable MongoDB instance for cart, order, stock, payment, voucher, wishlist and review rules.
- Add ESLint and Prettier after agreeing on the team configuration.
