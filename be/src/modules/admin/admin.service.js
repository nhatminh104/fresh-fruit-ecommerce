import mongoose from 'mongoose';
import Category from '../categories/category.model.js';
import Inventory from '../inventory/inventory.model.js';
import Order from '../orders/order.model.js';
import Product from '../products/product.model.js';
import Review from '../reviews/review.model.js';
import User from '../users/user.model.js';
import Voucher from '../vouchers/voucher.model.js';
import Payment from '../payments/payment.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { cancelOrder } from '../orders/order.service.js';

const id = (value, label = 'Id') => {
  if (!mongoose.isValidObjectId(value)) throw new ApiError(400, `${label} is invalid`);
  return value;
};

const pick = (source, fields) => Object.fromEntries(fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));

export async function dashboard() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [users, products, orders, revenue, ordersByStatus, ordersByPayment, monthlyRevenue, topProducts, lowStock, recentOrders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'refunded' }, $or: [{ status: 'delivered' }, { paymentStatus: 'paid' }] } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'refunded' } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'refunded' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'refunded' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.productName' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]),
    Inventory.aggregate([{ $match: { $expr: { $lte: ['$quantity', '$lowStockAt'] } } }, { $count: 'count' }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email').select('orderCode status paymentStatus totalAmount createdAt user').lean()
  ]);

  return {
    users,
    products,
    orders,
    revenue: revenue[0]?.total || 0,
    ordersByStatus: ordersByStatus.map((s) => ({ status: s._id, count: s.count })),
    ordersByPayment: ordersByPayment.map((p) => ({ method: p._id, count: p.count, total: p.total })),
    monthlyRevenue,
    topProducts,
    lowStockCount: lowStock[0]?.count || 0,
    recentOrders
  };
}

export const listProducts = () => Product.find().populate('category', 'name slug').sort({ createdAt: -1 }).lean();
export async function createProduct(payload) {
  if (payload.stock !== undefined) {
    const stock = Number(payload.stock);
    if (!Number.isInteger(stock) || stock < 0) throw new ApiError(400, 'Tồn kho phải là số nguyên không âm');
  }
  const product = await Product.create(pick(payload, ['name', 'slug', 'description', 'category', 'price', 'originalPrice', 'unit', 'origin', 'images', 'stock', 'soldCount', 'isFeatured', 'isActive']));
  const lowStockAt = payload.lowStockAt !== undefined ? Number(payload.lowStockAt) : 5;
  await Inventory.findOneAndUpdate(
    { product: product._id },
    { $set: { quantity: product.stock, lowStockAt: Number.isInteger(lowStockAt) && lowStockAt >= 0 ? lowStockAt : 5 } },
    { upsert: true }
  );
  return product;
}
export async function updateProduct(productId, payload) {
  if (payload.stock !== undefined) {
    const stock = Number(payload.stock);
    if (!Number.isInteger(stock) || stock < 0) throw new ApiError(400, 'Tồn kho phải là số nguyên không âm');
  }
  const product = await Product.findByIdAndUpdate(id(productId, 'Product id'), { $set: pick(payload, ['name', 'slug', 'description', 'category', 'price', 'originalPrice', 'unit', 'origin', 'images', 'stock', 'isFeatured', 'isActive']) }, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  if (payload.stock !== undefined) {
    await Inventory.findOneAndUpdate(
      { product: product._id },
      { $set: { quantity: product.stock } },
      { upsert: true }
    );
  }
  return product;
}
export async function archiveProduct(productId) {
  return updateProduct(productId, { isActive: false });
}

export const listCategories = () => Category.find().sort({ name: 1 }).lean();
export async function createCategory(payload) { return Category.create(pick(payload, ['name', 'slug', 'description', 'image', 'isActive'])); }
export async function updateCategory(categoryId, payload) {
  const category = await Category.findByIdAndUpdate(id(categoryId, 'Category id'), { $set: pick(payload, ['name', 'slug', 'description', 'image', 'isActive']) }, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}
export async function archiveCategory(categoryId) { return updateCategory(categoryId, { isActive: false }); }

export const listOrders = () => Order.find().populate('user', 'fullName email').sort({ createdAt: -1 }).lean();
export async function getOrder(orderId) { const order = await Order.findById(id(orderId, 'Order id')).populate('user', 'fullName email').lean(); if (!order) throw new ApiError(404, 'Order not found'); return order; }
export async function updateOrder(orderId, status) {
  if (status === 'cancelled') return cancelOrder({ orderId });
  const order = await Order.findById(id(orderId, 'Order id'));
  if (!order) throw new ApiError(404, 'Order not found');
  if (!Object.keys(Order.allowedTransitions).includes(status) || !Order.allowedTransitions[order.status].includes(status)) throw new ApiError(400, 'Invalid order status transition');
  order.status = status;
  if (status === 'delivered' && order.paymentMethod === 'cod') order.paymentStatus = 'paid';
  await order.save();
  if (status === 'delivered' && order.paymentMethod === 'cod') await Payment.updateOne({ order: order._id }, { $set: { status: 'paid' } });
  return order;
}

export const listUsers = () => User.find().sort({ createdAt: -1 }).lean();
export async function getUser(userId) { const user = await User.findById(id(userId, 'User id')).lean(); if (!user) throw new ApiError(404, 'User not found'); return user; }
export async function updateUser(userId, payload, actorId) {
  const set = pick(payload, ['fullName', 'phone', 'role', 'status']);
  if (actorId && String(userId) === String(actorId) && (set.role !== undefined || set.status !== undefined)) {
    throw new ApiError(400, 'Không thể tự thay đổi vai trò hoặc trạng thái tài khoản của chính mình');
  }
  const target = await User.findById(id(userId, 'User id')).lean();
  if (!target) throw new ApiError(404, 'User not found');
  const demotesAdmin =
    (set.role !== undefined && set.role !== 'admin') ||
    (set.status !== undefined && set.status !== 'active');
  if (target.role === 'admin' && demotesAdmin) {
    const otherActiveAdmins = await User.countDocuments({
      _id: { $ne: target._id },
      role: 'admin',
      status: 'active'
    });
    if (otherActiveAdmins === 0) {
      throw new ApiError(400, 'Không thể hạ quyền hoặc vô hiệu hóa quản trị viên đang hoạt động cuối cùng');
    }
  }
  const user = await User.findByIdAndUpdate(id(userId, 'User id'), { $set: set }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export const listReviews = () => Review.find().populate('user', 'fullName email').populate('product', 'name').sort({ createdAt: -1 }).lean();
export async function updateReview(reviewId, isApproved) {
  const review = await Review.findByIdAndUpdate(id(reviewId, 'Review id'), { $set: { isApproved: Boolean(isApproved) } }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');
  return review;
}
export async function deleteReview(reviewId) { const result = await Review.findByIdAndDelete(id(reviewId, 'Review id')); if (!result) throw new ApiError(404, 'Review not found'); return { deleted: true }; }

export const listVouchers = () => Voucher.find().sort({ createdAt: -1 }).lean();
export async function createVoucher(payload) { return Voucher.create(pick(payload, ['code', 'description', 'discountType', 'discountValue', 'minOrderValue', 'maxDiscount', 'startDate', 'endDate', 'usageLimit', 'isActive'])); }
export async function updateVoucher(voucherId, payload) {
  const voucher = await Voucher.findByIdAndUpdate(id(voucherId, 'Voucher id'), { $set: pick(payload, ['code', 'description', 'discountType', 'discountValue', 'minOrderValue', 'maxDiscount', 'startDate', 'endDate', 'usageLimit', 'isActive']) }, { new: true, runValidators: true });
  if (!voucher) throw new ApiError(404, 'Voucher not found');
  return voucher;
}
export async function archiveVoucher(voucherId) { return updateVoucher(voucherId, { isActive: false }); }

export async function listInventory() {
  const [products, settings] = await Promise.all([
    Product.find().select('name stock unit isActive').sort({ stock: 1 }).lean(),
    Inventory.find().select('product lowStockAt').lean()
  ]);
  const thresholds = new Map(settings.map((item) => [String(item.product), item.lowStockAt]));
  return products.map((product) => ({ product, quantity: product.stock, lowStockAt: thresholds.get(String(product._id)) || 5 }));
}
export async function updateInventory(productId, quantity, lowStockAt) {
  id(productId, 'Product id');
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) throw new ApiError(400, 'Inventory quantity must be a non-negative integer');
  const productBefore = await Product.findById(productId).select('stock');
  if (!productBefore) throw new ApiError(404, 'Product not found');
  const threshold = lowStockAt === undefined ? 5 : Number(lowStockAt);
  if (!Number.isInteger(threshold) || threshold < 0) throw new ApiError(400, 'Low-stock threshold must be a non-negative integer');
  const product = await Product.findByIdAndUpdate(productId, { $set: { stock: Number(quantity) } }, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  try {
    return await Inventory.findOneAndUpdate({ product: productId }, { $set: { quantity: Number(quantity), lowStockAt: threshold } }, { upsert: true, new: true, runValidators: true }).populate('product', 'name stock unit');
  } catch (error) {
    await Product.updateOne({ _id: productId }, { $set: { stock: productBefore.stock } });
    throw error;
  }
}
