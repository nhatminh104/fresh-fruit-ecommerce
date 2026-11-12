import mongoose from 'mongoose';
import Payment from './payment.model.js';
import Order from '../orders/order.model.js';
import { ApiError } from '../../utils/ApiError.js';

const transactionUnsupported = (error) => error?.code === 20 || /replica set|transaction numbers|mongos/i.test(error?.message || '');

export async function createPayment({ userId, orderId, method, amount }, options = {}) {
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(400, 'Mã đơn hàng không hợp lệ');
  if (!['cod', 'mock'].includes(method)) throw new ApiError(400, 'Phương thức thanh toán không được hỗ trợ');

  if (!options.session && !options.fallback) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await createPayment({ userId, orderId, method, amount }, { session });
      });
      return result;
    } catch (error) {
      if (error?.code === 11000) {
        throw new ApiError(409, 'Giao dịch thanh toán đang được xử lý hoặc đơn hàng đã được thanh toán');
      }
      if (!transactionUnsupported(error)) throw error;
      return createPayment({ userId, orderId, method, amount }, { fallback: true });
    } finally {
      await session.endSession();
    }
  }

  const session = options.session;
  const orderQuery = Order.findById(orderId);
  if (session) orderQuery.session(session);
  const order = await orderQuery;

  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  if (userId && String(order.user) !== String(userId)) {
    throw new ApiError(403, 'Bạn không có quyền thanh toán đơn hàng này');
  }
  if (order.status === 'cancelled') {
    throw new ApiError(400, 'Đơn hàng đã bị hủy, không thể thanh toán');
  }
  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'Đơn hàng đã được thanh toán');
  }
  if (order.paymentMethod !== method) {
    throw new ApiError(400, 'Phương thức thanh toán không khớp với đơn hàng');
  }
  if (amount !== undefined && Number(amount) !== order.totalAmount) {
    throw new ApiError(400, 'Số tiền thanh toán không khớp với đơn hàng');
  }

  const existingQuery = Payment.findOne({ order: order._id });
  if (session) existingQuery.session(session);
  const existing = await existingQuery;
  if (existing && existing.status === 'paid') {
    throw new ApiError(400, 'Đơn hàng đã được thanh toán');
  }
  // Retry an toàn: payment failed -> thử lại; payment pending cùng method -> idempotent.
  if (existing && existing.status === 'pending') {
    if (existing.method === method) return existing;
    throw new ApiError(409, 'Giao dịch thanh toán cho đơn hàng này đã tồn tại');
  }
  if (existing && existing.status === 'refunded') {
    throw new ApiError(409, 'Giao dịch thanh toán đã được hoàn tiền, không thể thanh toán lại');
  }

  const status = method === 'mock' ? 'paid' : 'pending';

  try {
    let payment;
    if (existing) {
      // existing.status === 'failed' -> ghi đè thành lần thử mới
      payment = await Payment.findByIdAndUpdate(
        existing._id,
        { $set: { method, status, amount: order.totalAmount } },
        { new: true, ...(session ? { session } : {}) }
      );
    } else {
      const paymentData = {
        order: order._id,
        method,
        status,
        amount: order.totalAmount
      };
      if (session) {
        const created = await Payment.create([paymentData], { session });
        payment = created[0];
      } else {
        payment = await Payment.create(paymentData);
      }
    }

    const orderUpdate = { paymentStatus: status };
    if (method === 'mock' && order.status === 'pending') {
      orderUpdate.status = 'confirmed';
    }
    await Order.updateOne({ _id: order._id }, { $set: orderUpdate }, session ? { session } : undefined);

    return payment;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Giao dịch thanh toán đang được xử lý hoặc đơn hàng đã được thanh toán');
    }
    throw error;
  }
}
