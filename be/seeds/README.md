# Database seed

The seed data is explicitly demo data for development and UI testing. Product images are public Unsplash URLs and product prices are illustrative, not verified current market prices.

From the repository root:

```bash
npm run seed
```

The script upserts by category slug, product slug, user email, and voucher code. It never drops a collection or deletes existing records. Set `SEED_ADMIN_PASSWORD` and `SEED_CUSTOMER_PASSWORD` in `.env` before seeding. Passwords are intentionally not stored in Git.

Seed contents: 3 categories, 11 products (Vietnamese + imported + combos), 2 vouchers (`WELCOME10`, `FREESHIP30`), and 2 demo accounts (admin/customer). For each product an `Inventory` record is created if missing — existing inventory quantities set by admin are preserved. On re-seed, product `stock`/`soldCount` are only set on insert so real sales data is never overwritten.

## Demo data (`demo-data.js`)

```bash
npm --prefix be run seed:demo
```

Expands the database for full-flow testing: ~20 demo customers (`khachNN@freshfruit.local`, password from `SEED_CUSTOMER_PASSWORD`), additional categories/products/vouchers, addresses, carts, wishlists, ~30 orders across all statuses, matching payments, and ~20 reviews. Orders/payments/reviews are created through the real service layer so stock, totals, snapshots and payment state stay consistent. Fully idempotent: orders are keyed by `idempotencyKey` (`demo-order-*`), users by email, catalogs by slug/code — safe to re-run; it never deletes or overwrites existing user data.

## Product images (`product-images.json`)

Product/category images are CC-licensed photos fetched via the Openverse API and stored in `data/product-images.json` (slug → verified URLs). Regenerate or refresh with:

```bash
node scripts/update-product-images.mjs --apply
```

The script queries Openverse per product keyword, keeps only reachable URLs, deduplicates across products, and writes up to 2 images per product (main + gallery) plus one image per category. `seed.js` and `demo-data.js` read this file so fresh setups get the same images.
