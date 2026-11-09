import Product from './product.model.js';
import Category from '../categories/category.model.js';
import mongoose from 'mongoose';
export async function listProducts(query = {}) {
  const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = query;
  const filter = { isActive: true };
  if (category) { const categoryDoc = await Category.findOne({ $or: [{ slug: category }, ...(category.match?.(/^[a-f\d]{24}$/i) ? [{ _id: category }] : [])], isActive: true }).select('_id').lean(); if (!categoryDoc) return { items: [], pagination: { page: Math.max(Number(page) || 1, 1), limit: Math.min(Math.max(Number(limit) || 12, 1), 50), total: 0, totalPages: 0 } }; filter.category = categoryDoc._id; }
  if (search) filter.$text = { $search: search };
  if (minPrice !== undefined || maxPrice !== undefined) { filter.price = {}; if (minPrice !== undefined) filter.price.$gte = Number(minPrice); if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice); }
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const [items, total] = await Promise.all([Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), Product.countDocuments(filter)]);
  return { items, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
}
export async function findProduct(identifier) { const filter = { isActive: true }; if (mongoose.isValidObjectId(identifier)) filter._id = identifier; else filter.slug = String(identifier).toLowerCase(); return Product.findOne(filter).populate('category', 'name slug').lean(); }
