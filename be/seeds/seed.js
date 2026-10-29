import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { connectDatabase, closeDatabase } from '../src/config/database.js';
import User from '../src/modules/users/user.model.js';
import Category from '../src/modules/categories/category.model.js';
import Product from '../src/modules/products/product.model.js';
import Voucher from '../src/modules/vouchers/voucher.model.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => fs.readFile(path.join(here, 'data', name), 'utf8').then(JSON.parse);
const hashPassword = (password) => new Promise((resolve, reject) => crypto.scrypt(password, process.env.SEED_PASSWORD_SALT || 'fresh-fruit-demo-salt', 64, (error, key) => error ? reject(error) : resolve(`scrypt:${key.toString('hex')}`)));

async function upsert(Model, filter, document) {
  const result = await Model.findOneAndUpdate(filter, { $set: document }, { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true });
  return result.lastErrorObject?.updatedExisting ? 'updated' : 'created';
}

async function main() {
  await connectDatabase();
  const [categories, products, users, vouchers] = await Promise.all([readJson('categories.json'), readJson('products.json'), readJson('users.json'), readJson('vouchers.json')]);
  const categoryIds = new Map();
  const counts = { created: 0, updated: 0 };
  for (const data of categories) { const state = await upsert(Category, { slug: data.slug }, data); categoryIds.set(data.slug, (await Category.findOne({ slug: data.slug }).select('_id'))._id); counts[state]++; }
  for (const data of products) { const { categorySlug, ...product } = data; product.category = categoryIds.get(categorySlug); const state = await upsert(Product, { slug: product.slug }, product); counts[state]++; }
  for (const data of users) { const { passwordEnv, ...user } = data; const password = process.env[passwordEnv]; if (!password) throw new Error(`${passwordEnv} is not configured; set demo passwords in .env before seeding`); user.password = await hashPassword(password); const state = await upsert(User, { email: user.email }, user); counts[state]++; }
  for (const data of vouchers) { const state = await upsert(Voucher, { code: data.code }, data); counts[state]++; }
  console.log(`Seed complete: ${counts.created} created, ${counts.updated} updated, 0 deleted.`);
  console.log('Demo accounts seeded: admin@freshfruit.local and customer@freshfruit.local (passwords supplied through environment)');
}

try { await main(); } catch (error) { console.error('Seed failed:', error.message); process.exitCode = 1; } finally { await closeDatabase(); }
