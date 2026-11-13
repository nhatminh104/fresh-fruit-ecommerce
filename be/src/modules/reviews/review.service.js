import mongoose from 'mongoose'; import Review from './review.model.js'; import Order from '../orders/order.model.js'; import Product from '../products/product.model.js'; import { ApiError } from '../../utils/ApiError.js';
export const listReviews = (productId) => Review.find({ product: productId, isApproved: true }).populate('user', 'fullName').sort({ createdAt: -1 }).lean();
export const listLatestReviews = (limit = 6) => Review.find({ isApproved: true }).populate('user', 'fullName').populate('product', 'name images').sort({ createdAt: -1 }).limit(limit).lean();
export const listUserReviews = (userId) => Review.find({ user: userId }).populate('product', 'name images').sort({ createdAt: -1 }).lean();
export async function createReview({ user, product, order, rating, comment }) {
  if (![user, product].every(mongoose.isValidObjectId) || (order && !mongoose.isValidObjectId(order))) {
    throw new ApiError(400, 'Thiếu thông tin người dùng hoặc sản phẩm');
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Điểm đánh giá phải là số nguyên từ 1 đến 5');
  }
  const [targetProduct, deliveredOrder, duplicate] = await Promise.all([Product.findOne({ _id: product, isActive: true }).select('_id').lean(), Order.findOne({ ...(order ? { _id: order } : {}), user, status: 'delivered', 'items.product': product }).select('_id').lean(), Review.findOne({ user, product }).select('_id').lean()]);
  if (!targetProduct) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  if (!deliveredOrder) throw new ApiError(403, 'Chỉ có thể đánh giá sản phẩm trong đơn đã giao');
  if (duplicate) throw new ApiError(409, 'Bạn đã đánh giá sản phẩm này');
  return Review.create({ user, product, order: deliveredOrder._id, rating: numericRating, comment });
}
