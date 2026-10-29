# Fresh Fruit database

The backend uses MongoDB through Mongoose. The nine primary collections are `users`, `categories`, `products`, `carts`, `addresses`, `orders`, `vouchers`, `reviews`, and `wishlists`. `payments` and `inventory` modules remain available in the existing project, but the current checkout stores simple payment state in `orders` and current stock in `products`.

## Setup

Copy `.env.example` to `.env` at the repository root and set `MONGODB_URI` to a local MongoDB or Atlas connection string. Credentials must stay in `.env`, which is ignored by Git.

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

The current repository still needs a complete authentication/session implementation and protected admin controllers before it is suitable for deployment. The existing route skeleton is preserved; no fake admin API was added as part of this database task.
