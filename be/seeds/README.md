# Database seed

The seed data is explicitly demo data for development and UI testing. Product images are public Unsplash URLs and product prices are illustrative, not verified current market prices.

From the repository root:

```bash
npm run seed
```

The script upserts by category slug, product slug, user email, and voucher code. It never drops a collection or deletes existing records. Set `SEED_ADMIN_PASSWORD` and `SEED_CUSTOMER_PASSWORD` in `.env` before seeding. Passwords are intentionally not stored in Git.

Seed contents: 3 categories, 11 products (Vietnamese + imported + combos), 2 vouchers (`WELCOME10`, `FREESHIP30`), and 2 demo accounts (admin/customer). For each product an `Inventory` record is created if missing — existing inventory quantities set by admin are preserved. On re-seed, product `stock`/`soldCount` are only set on insert so real sales data is never overwritten.
