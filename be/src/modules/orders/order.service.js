import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Order from './order.model.js';
import Product from '../products/product.model.js';
import Voucher from '../vouchers/voucher.model.js';

export const listOrders = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
export async function createOrder({ user, items, shippingAddress, voucherCode, paymentMethod = 'cod', note }) {
  if (!mongoose.isValidObjectId(user)) throw new Error('A valid user is required');
  const requested = new Map(items.map((item) => [String(item.product), Number(item.quantity)]));
  if ([...requested.values()].some((quantity) => !Number.isInteger(quantity) || quantity < 1)) throw new Error('Invalid item quantity');
  const products = await Product.find({ _id: { $in: [...requested.keys()] }, isActive: true }).lean();
  if (products.length !== requested.size) throw new Error('One or more products are unavailable');
  const orderItems = products.map((product) => { const quantity = requested.get(String(product._id)); if (quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}`); return { product: product._id, productName: product.name, image: product.images?.[0], unit: product.unit, price: product.price, quantity, subtotal: product.price * quantity }; });
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discountAmount = 0; let voucher;
  if (voucherCode) { voucher = await Voucher.findOne({ code: String(voucherCode).toUpperCase(), isActive: true }); const now = new Date(); if (!voucher || now < voucher.startDate || now > voucher.endDate || subtotal < voucher.minOrderValue || (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit)) throw new Error('Voucher is invalid or unavailable'); discountAmount = voucher.discountType === 'percent' ? subtotal * voucher.discountValue / 100 : voucher.discountValue; if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount); }
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const order = await Order.create({ orderCode: `FF-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`, user, items: orderItems, shippingAddress, subtotal, discountAmount, shippingFee, totalAmount: Math.max(0, subtotal - discountAmount + shippingFee), voucher: voucher?._id, paymentMethod, note });
  for (const item of orderItems) await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
  if (voucher) await Voucher.updateOne({ _id: voucher._id }, { $inc: { usedCount: 1 } });
  return order;
}
