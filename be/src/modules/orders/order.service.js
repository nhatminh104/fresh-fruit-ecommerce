import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Order from './order.model.js';
import Product from '../products/product.model.js';
import Voucher from '../vouchers/voucher.model.js';
import Cart from '../carts/cart.model.js';

export const listOrders = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
export const findOrder = (userId, orderId) => Order.findOne({ _id: orderId, user: userId }).lean();
async function reserveStock(orderItems, session) { const reserved = []; for (const item of orderItems) { const result = await Product.updateOne({ _id: item.product, isActive: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity, soldCount: item.quantity } }, session ? { session } : undefined); if (result.modifiedCount !== 1) { for (const rollback of reserved) await Product.updateOne({ _id: rollback.product }, { $inc: { stock: rollback.quantity, soldCount: -rollback.quantity } }, session ? { session } : undefined); const error = new Error(`Sản phẩm ${item.productName} không đủ tồn kho`); error.status = 409; throw error; } reserved.push(item); } return reserved; }
async function releaseStock(orderItems, session) { for (const item of orderItems) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, soldCount: -item.quantity } }, session ? { session } : undefined); }
export async function createOrder(input, options = {}) {
  if (!options.session && !options.fallback) { const session = await mongoose.startSession(); try { let result; await session.withTransaction(async () => { result = await createOrder(input, { session }); }); return result; } catch (error) { if (error.code !== 20 && !/replica set|transaction numbers/i.test(error.message || '')) throw error; return createOrder(input, { fallback: true }); } finally { await session.endSession(); } }
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
  try {
    if (voucher) { const voucherResult = await Voucher.updateOne({ _id: voucher._id, isActive: true, ...(voucher.usageLimit ? { usedCount: { $lt: voucher.usageLimit } } : {}) }, { $inc: { usedCount: 1 } }, session ? { session } : undefined); if (voucherResult.modifiedCount !== 1) throw Object.assign(new Error('Mã giảm giá vừa hết lượt sử dụng'), { status: 409 }); voucherCounted = true; }
    const orderData = { orderCode: `FF-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`, user, items: orderItems, shippingAddress, subtotal, discountAmount, shippingFee, totalAmount: Math.max(0, subtotal - discountAmount + shippingFee), voucher: voucher?._id, paymentMethod, note };
    const createdOrders = await Order.create([orderData], session ? { session } : undefined); const order = createdOrders[0];
    await Cart.updateOne({ user }, { $set: { items: [] } }, session ? { session } : undefined);
    return order;
  } catch (error) {
    if (!session) await releaseStock(reserved);
    if (voucherCounted && !session) await Voucher.updateOne({ _id: voucher._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    throw error;
  }
}
