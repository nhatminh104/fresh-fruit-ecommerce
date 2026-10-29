# Database seed

The seed data is explicitly demo data for development and UI testing. Product images are public Unsplash URLs and product prices are illustrative, not verified current market prices.

From the repository root:

```bash
npm run seed
```

The script upserts by category slug, product slug, user email, and voucher code. It never drops a collection or deletes existing records. Set `SEED_ADMIN_PASSWORD` and `SEED_CUSTOMER_PASSWORD` in `.env` before seeding. Passwords are intentionally not stored in Git.
