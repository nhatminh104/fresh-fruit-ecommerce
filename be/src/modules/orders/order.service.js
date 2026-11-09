import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Order from './order.model.js';
import Product from '../products/product.model.js';
import Voucher from '../vouchers/voucher.model.js';
import Cart from '../carts/cart.model.js';
import Payment from '../payments/payment.model.js';
import Inventory from '../inventory/inventory.model.js';
import { ApiError } from '../../utils/ApiError.js';

const addressFields = ['recipientName', 'phone', 'province', 'district', 'ward', 'streetAddress'];
const transactionUnsupported = (error) => error?.code === 20 || /replica set|transaction numbers|mongos/i.test(error?.message || '');
const snapshotAddress = (address = {}) => {
  const snapshot = Object.fromEntries(addressFields.map((field) => [field, String(address[field] || '').trim()]));
  if (addressFields.some((field) => !snapshot[field])) throw new ApiError(400, 'Địa chỉ giao hàng chưa đầy đủ');
  return snapshot;
};

export const listOrders = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
export const findOrder = (userId, orderId) => mongoose.isValidObjectId(orderId) ? Order.findOne({ _id: orderId, user: userId }).lean() : null;
async function reserveStock(orderItems, session) { const reserved = []; for (const item of orderItems) { const result = await Product.updateOne({ _id: item.product, isActive: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity, soldCount: item.quantity } }, session ? { session } : undefined); if (result.modifiedCount !== 1) { for (const rollback of reserved) await releaseStock([rollback], session); throw new ApiError(409, `Sản phẩm ${item.productName} không đủ tồn kho`); } await Inventory.updateOne({ product: item.product }, { $inc: { quantity: -item.quantity } }, session ? { session } : undefined); reserved.push(item); } return reserved; }
async function releaseStock(orderItems, session) { for (const item of orderItems) { await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, soldCount: -item.quantity } }, session ? { session } : undefined); await Inventory.updateOne({ product: item.product }, { $inc: { quantity: item.quantity } }, session ? { session } : undefined); } }
export async function createOrder(input, options = {}) {
  const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey).trim().slice(0, 120) : undefined;
  const existingQuery = idempotencyKey ? Order.findOne({ user: input.user, idempotencyKey }) : null;
  if (existingQuery && options.session) existingQuery.session(options.session);
  const existing = existingQuery ? await existingQuery.lean() : null;
  if (existing) return existing;
  if (!options.session && !options.fallback) { const session = await mongoose.startSession(); try { let result; await session.withTransaction(async () => { result = await createOrder(input, { session }); }); return result; } catch (error) { if (error?.code === 11000 && idempotencyKey) { const duplicate = await Order.findOne({ user: input.user, idempotencyKey }).lean(); if (duplicate) return duplicate; } if (!transactionUnsupported(error)) throw error; return createOrder(input, { fallback: true }); } finally { await session.endSession(); } }
  const { user, items, shippingAddress, voucherCode, paymentMethod = 'cod', note } = input; const session = options.session;
  if (!mongoose.isValidObjectId(user)) throw new Error('Người dùng không hợp lệ');
  const requested = new Map(items.map((item) => [String(item.product), Number(item.quantity)]));
  if ([...requested.values()].some((quantity) => !Number.isInteger(quantity) || quantity < 1)) throw new Error('Số lượng sản phẩm không hợp lệ');
  const productQuery = Product.find({ _id: { $in: [...requested.keys()] }, isActive: true }); if (session) productQuery.session(session); const products = await productQuery.lean();
  if (products.length !== requested.size) throw new Error('Một hoặc nhiều sản phẩm không còn kinh doanh');
  const orderItems = products.map((product) => { const quantity = requested.get(String(product._id)); if (quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}`); return { product: product._id, productName: product.name, image: product.images?.[0], unit: product.unit, price: product.price, quantity, subtotal: product.price * quantity }; });
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discountAmount = 0; let voucher;
  if (voucherCode) { const voucherQuery = Voucher.findOne({ code: String(voucherCode).toUpperCase(), isActive: true }); if (session) voucherQuery.session(session); voucher = await voucherQuery; const now = new Date(); if (!voucher || now < voucher.startDate || now > voucher.endDate || subtotal < voucher.minOrderValue || (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit)) throw new Error('Mã giảm giá không hợp lệ hoặc không còn khả dụng'); discountAmount = voucher.discountType === 'percent' ? subtotal * voucher.discountValue / 100 : voucher.discountValue; if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount); discountAmount = Math.min(discountAmount, subtotal); }
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const reserved = await reserveStock(orderItems, session);
  let voucherCounted = false;
  let createdOrder;
  try {
    if (voucher) { const voucherResult = await Voucher.updateOne({ _id: voucher._id, isActive: true, ...(voucher.usageLimit ? { usedCount: { $lt: voucher.usageLimit } } : {}) }, { $inc: { usedCount: 1 } }, session ? { session } : undefined); if (voucherResult.modifiedCount !== 1) throw Object.assign(new Error('Mã giảm giá vừa hết lượt sử dụng'), { status: 409 }); voucherCounted = true; }
    const orderData = { orderCode: `FF-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`, user, idempotencyKey, items: orderItems, shippingAddress: snapshotAddress(shippingAddress), subtotal, discountAmount, shippingFee, totalAmount: Math.max(0, subtotal - discountAmount + shippingFee), voucher: voucher?._id, paymentMethod, note };
    const createdOrders = await Order.create([orderData], session ? { session } : undefined); createdOrder = createdOrders[0];
    await Cart.updateOne({ user }, { $set: { items: [] } }, session ? { session } : undefined);
    return createdOrder;
  } catch (error) {
    if (!session) { if (createdOrder?._id) await Order.deleteOne({ _id: createdOrder._id }); await releaseStock(reserved); }
    if (voucherCounted && !session) await Voucher.updateOne({ _id: voucher._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    throw error;
  }
}

export async function cancelOrder({ userId, orderId }) {
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(400, 'Mã đơn hàng không hợp lệ');
  const filter = { _id: orderId, ...(userId ? { user: userId } : {}) };
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const order = await Order.findOne(filter).session(session);
      if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
      if (order.status === 'cancelled') { result = order; return; }
      if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(409, 'Đơn hàng hiện không thể hủy');
      await releaseStock(order.items, session);
      if (order.voucher) await Voucher.updateOne({ _id: order.voucher, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, { session });
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.stockRestoredAt = new Date();
      order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'failed';
      await order.save({ session });
      await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentStatus } }, { session });
      result = order;
    });
    return result;
  } catch (error) {
    if (!transactionUnsupported(error)) throw error;
    const order = await Order.findOne(filter);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.status === 'cancelled') return order;
    if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(409, 'Đơn hàng hiện không thể hủy');
    await releaseStock(order.items);
    try {
      if (order.voucher) await Voucher.updateOne({ _id: order.voucher, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
      order.status = 'cancelled'; order.cancelledAt = new Date(); order.stockRestoredAt = new Date(); order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'failed';
      await order.save();
      await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentStatus } });
      return order;
    } catch (fallbackError) {
      await reserveStock(order.items);
      throw fallbackError;
    }
  } finally {
    await session.endSession();
  }
}
