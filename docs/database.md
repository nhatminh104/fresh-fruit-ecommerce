# Fresh Fruit database

The backend uses MongoDB through Mongoose. The primary collections are `users`, `categories`, `products`, `carts`, `addresses`, `orders`, `vouchers`, `reviews`, and `wishlists`. `auth_sessions` stores hashed refresh tokens and session expiry for login/logout. `payments` stores one payment record per order. `Product.stock` is the authoritative inventory value; `inventory.quantity` is maintained as a compatibility mirror for the admin screen.

## Setup

Copy `.env.example` to `.env` at the repository root and set `MONGODB_URI` to a local MongoDB or Atlas connection string. The server and seed script also support the legacy `be/.env` location. Credentials must stay in `.env`, which is ignored by Git.

```bash
npm install
npm --prefix be install
npm run seed
npm run server
```

The server starts only after MongoDB connects. `GET /api/health` returns HTTP 200 when connected and HTTP 503 otherwise, including the database state.

## Seed data

Seed files are under `be/seeds/data`. They are explicitly demo data for development and UI testing, not a verified live product catalogue. Product prices are illustrative and image URLs are public Unsplash URLs. The script upserts categories by slug, products by slug, users by email, and vouchers by code; it does not drop collections or delete existing data.

Demo account emails are `admin@freshfruit.local` and `customer@freshfruit.local`. Set their passwords locally through `SEED_ADMIN_PASSWORD` and `SEED_CUSTOMER_PASSWORD` in `.env`; credentials are not stored in Git. Passwords are hashed with Node's built-in `scrypt` before storage.

## Data rules

Products reference `categories` by ObjectId. Orders copy product name, image, unit, price, line subtotal, and shipping address at checkout. Order totals, voucher eligibility, and stock are calculated in backend services; frontend prices are never trusted. Product list queries support `search`, `category`, `minPrice`, `maxPrice`, `page`, and `limit`.

Authentication now uses JWT access tokens, rotating refresh tokens and the `auth_sessions` collection. Refresh rotation uses an atomic hash match so concurrent reuse of one refresh token is rejected. Passwords and reset tokens are hashed; reset tokens are only returned directly in non-production environments until an email provider is configured.
