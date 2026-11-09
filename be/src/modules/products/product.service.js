import Product from './product.model.js';
import Category from '../categories/category.model.js';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
export async function listProducts(query = {}) {
  const { search, category, minPrice, maxPrice, sort = 'newest', featured } = query;
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const filter = { isActive: true };
  if (category) { const categoryDoc = await Category.findOne({ $or: [{ slug: category }, ...(category.match?.(/^[a-f\d]{24}$/i) ? [{ _id: category }] : [])], isActive: true }).select('_id').lean(); if (!categoryDoc) return { items: [], pagination: { page: Math.max(Number(page) || 1, 1), limit: Math.min(Math.max(Number(limit) || 12, 1), 50), total: 0, totalPages: 0 } }; filter.category = categoryDoc._id; }
  if (search) filter.$text = { $search: search };
  const min = minPrice === undefined || minPrice === '' ? undefined : Number(minPrice);
  const max = maxPrice === undefined || maxPrice === '' ? undefined : Number(maxPrice);
  if ([min, max].some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) throw new ApiError(400, 'Khoảng giá không hợp lệ');
  if (min !== undefined && max !== undefined && min > max) throw new ApiError(400, 'Giá tối thiểu không được lớn hơn giá tối đa');
  if (min !== undefined || max !== undefined) { filter.price = {}; if (min !== undefined) filter.price.$gte = min; if (max !== undefined) filter.price.$lte = max; }
  if (featured === 'true' || featured === true) filter.isFeatured = true;
  const sortMap = { newest: { createdAt: -1 }, price_asc: { price: 1, createdAt: -1 }, price_desc: { price: -1, createdAt: -1 }, popular: { soldCount: -1, createdAt: -1 } };
  const [items, total] = await Promise.all([Product.find(filter).populate('category', 'name slug').sort(sortMap[sort] || sortMap.newest).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
export async function findProduct(identifier) { const filter = { isActive: true }; if (mongoose.isValidObjectId(identifier)) filter._id = identifier; else filter.slug = String(identifier).toLowerCase(); return Product.findOne(filter).populate('category', 'name slug').lean(); }
