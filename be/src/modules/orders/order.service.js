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

export async function findOrder(userId, orderId) {
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(400, 'Mã đơn hàng không hợp lệ');
  const order = await Order.findById(orderId).lean();
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  if (userId && String(order.user) !== String(userId)) {
    throw new ApiError(403, 'Bạn không có quyền truy cập đơn hàng này');
  }
  return order;
}

async function reserveStock(orderItems, session) {
  const reserved = [];
  for (const item of orderItems) {
    const result = await Product.updateOne(
      { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      session ? { session } : undefined
    );
    if (result.modifiedCount !== 1) {
      for (const rollback of reserved) await releaseStock([rollback], session);
      throw new ApiError(409, `Sản phẩm ${item.productName} không đủ tồn kho`);
    }
    await Inventory.updateOne(
      { product: item.product },
      { $inc: { quantity: -item.quantity } },
      session ? { session } : undefined
    );
    reserved.push(item);
  }
  return reserved;
}

async function releaseStock(orderItems, session) {
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity, soldCount: -item.quantity } },
      session ? { session } : undefined
    );
    await Inventory.updateOne(
      { product: item.product },
      { $inc: { quantity: item.quantity } },
      session ? { session } : undefined
    );
  }
}

export async function createOrder(input, options = {}) {
  const idempotencyKey = (input.idempotencyKey && typeof input.idempotencyKey === 'string' && input.idempotencyKey.trim().length > 0)
    ? input.idempotencyKey.trim().slice(0, 120)
    : undefined;

  const existingQuery = idempotencyKey ? Order.findOne({ user: input.user, idempotencyKey }) : null;
  if (existingQuery && options.session) existingQuery.session(options.session);
  const existing = existingQuery ? await existingQuery.lean() : null;
  if (existing) return existing;

  if (!options.session && !options.fallback) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await createOrder(input, { session });
      });
      return result;
    } catch (error) {
      if (error?.code === 11000 && idempotencyKey) {
        let duplicate = await Order.findOne({ user: input.user, idempotencyKey }).lean();
        if (!duplicate) {
          await new Promise((r) => setTimeout(r, 50));
          duplicate = await Order.findOne({ user: input.user, idempotencyKey }).lean();
        }
        if (duplicate) return duplicate;
      }
      if (!transactionUnsupported(error)) throw error;
      return createOrder(input, { fallback: true });
    } finally {
      await session.endSession();
    }
  }

  const { user, items, shippingAddress, voucherCode, paymentMethod = 'cod', note } = input;
  const session = options.session;

  if (!mongoose.isValidObjectId(user)) throw new ApiError(400, 'Người dùng không hợp lệ');
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'Giỏ hàng không có sản phẩm');

  const requested = new Map(items.map((item) => [String(item.product), Number(item.quantity)]));
  if ([...requested.values()].some((quantity) => !Number.isInteger(quantity) || quantity < 1)) {
    throw new ApiError(400, 'Số lượng sản phẩm không hợp lệ');
  }

  const productQuery = Product.find({ _id: { $in: [...requested.keys()] }, isActive: true });
  if (session) productQuery.session(session);
  const products = await productQuery.lean();

  if (products.length !== requested.size) {
    throw new ApiError(400, 'Một hoặc nhiều sản phẩm không còn kinh doanh');
  }

  const orderItems = products.map((product) => {
    const quantity = requested.get(String(product._id));
    if (quantity > product.stock) {
      throw new ApiError(409, `Sản phẩm ${product.name} không đủ tồn kho`);
    }
    return {
      product: product._id,
      productName: product.name,
      image: product.images?.[0],
      unit: product.unit,
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  let discountAmount = 0;
  let voucher;
  if (voucherCode) {
    const voucherQuery = Voucher.findOne({ code: String(voucherCode).toUpperCase(), isActive: true });
    if (session) voucherQuery.session(session);
    voucher = await voucherQuery;
    const now = new Date();
    if (!voucher || now < voucher.startDate || now > voucher.endDate || subtotal < voucher.minOrderValue || (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit)) {
      throw new ApiError(400, 'Mã giảm giá không hợp lệ hoặc không còn khả dụng');
    }
    discountAmount = voucher.discountType === 'percent' ? (subtotal * voucher.discountValue) / 100 : voucher.discountValue;
    if (voucher.maxDiscount) discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const reserved = await reserveStock(orderItems, session);
  let voucherCounted = false;
  let createdOrder;

  try {
    if (voucher) {
      const voucherResult = await Voucher.updateOne(
        { _id: voucher._id, isActive: true, ...(voucher.usageLimit ? { usedCount: { $lt: voucher.usageLimit } } : {}) },
        { $inc: { usedCount: 1 } },
        session ? { session } : undefined
      );
      if (voucherResult.modifiedCount !== 1) {
        throw new ApiError(409, 'Mã giảm giá vừa hết lượt sử dụng');
      }
      voucherCounted = true;
    }

    const orderData = {
      orderCode: `FF-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      user,
      ...(idempotencyKey ? { idempotencyKey } : {}),
      items: orderItems,
      shippingAddress: snapshotAddress(shippingAddress),
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount: Math.max(0, subtotal - discountAmount + shippingFee),
      voucher: voucher?._id,
      paymentMethod,
      note
    };

    const createdOrders = await Order.create([orderData], session ? { session } : undefined);
    createdOrder = createdOrders[0];
    await Cart.updateOne({ user }, { $set: { items: [] } }, session ? { session } : undefined);
    return createdOrder;
  } catch (error) {
    if (!session) {
      if (createdOrder?._id) await Order.deleteOne({ _id: createdOrder._id });
      await releaseStock(reserved);
      if (voucherCounted && voucher?._id) {
        await Voucher.updateOne({ _id: voucher._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
      }
    }
    if (error?.code === 11000 && idempotencyKey) {
      let duplicate = await Order.findOne({ user, idempotencyKey }).lean();
      if (!duplicate) {
        await new Promise((r) => setTimeout(r, 50));
        duplicate = await Order.findOne({ user, idempotencyKey }).lean();
      }
      if (duplicate) return duplicate;
    }
    throw error;
  }
}

export async function cancelOrder({ userId, orderId }) {
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(400, 'Mã đơn hàng không hợp lệ');

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await Order.findById(orderId).session(session);
      if (!existing) throw new ApiError(404, 'Không tìm thấy đơn hàng');
      if (userId && String(existing.user) !== String(userId)) {
        throw new ApiError(403, 'Bạn không có quyền hủy đơn hàng này');
      }
      if (existing.status === 'cancelled') {
        throw new ApiError(400, 'Đơn hàng đã được hủy trước đó');
      }
      if (!['pending', 'confirmed'].includes(existing.status)) {
        throw new ApiError(400, 'Đơn hàng ở trạng thái hiện tại không thể hủy');
      }

      const order = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: ['pending', 'confirmed'] } },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            stockRestoredAt: new Date(),
            paymentStatus: existing.paymentStatus === 'paid' ? 'refunded' : 'failed'
          }
        },
        { session, new: true }
      );
      if (!order) {
        throw new ApiError(400, 'Đơn hàng đã được hủy trước đó');
      }

      await releaseStock(order.items, session);
      if (order.voucher) {
        await Voucher.updateOne({ _id: order.voucher, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, { session });
      }
      await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentStatus } }, { session });
      result = order;
    });
    return result;
  } catch (error) {
    if (!transactionUnsupported(error)) throw error;

    const existing = await Order.findById(orderId);
    if (!existing) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (userId && String(existing.user) !== String(userId)) {
      throw new ApiError(403, 'Bạn không có quyền hủy đơn hàng này');
    }
    if (existing.status === 'cancelled') {
      throw new ApiError(400, 'Đơn hàng đã được hủy trước đó');
    }
    if (!['pending', 'confirmed'].includes(existing.status)) {
      throw new ApiError(400, 'Đơn hàng ở trạng thái hiện tại không thể hủy');
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: { $in: ['pending', 'confirmed'] } },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          stockRestoredAt: new Date(),
          paymentStatus: existing.paymentStatus === 'paid' ? 'refunded' : 'failed'
        }
      },
      { new: true }
    );

    if (!order) {
      throw new ApiError(400, 'Đơn hàng đã được hủy trước đó');
    }

    await releaseStock(order.items);
    if (order.voucher) {
      await Voucher.updateOne({ _id: order.voucher, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    }
    await Payment.updateOne({ order: order._id }, { $set: { status: order.paymentStatus } });

    return order;
  } finally {
    await session.endSession();
  }
}
