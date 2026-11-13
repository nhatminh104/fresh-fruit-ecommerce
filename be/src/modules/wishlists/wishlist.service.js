import mongoose from 'mongoose';
import Wishlist from './wishlist.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/ApiError.js';
export const getWishlist = async (userId) => (await Wishlist.findOne({ user: userId }).populate({ path: 'products', match: { isActive: true } }).lean()) || { user: userId, products: [] };
export async function addProduct(userId, productId) {
  if (!mongoose.isValidObjectId(productId)) throw new ApiError(400, 'Sản phẩm không hợp lệ');
  const product = await Product.findOne({ _id: productId, isActive: true }).select('_id').lean();
  if (!product) throw new ApiError(404, 'Sản phẩm không còn kinh doanh'); await Wishlist.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId }, $addToSet: { products: productId } }, { upsert: true, new: true, runValidators: true }); return getWishlist(userId); }
export async function removeProduct(userId, productId) { const wishlist = await Wishlist.findOne({ user: userId }); if (!wishlist) return getWishlist(userId); wishlist.products = wishlist.products.filter((item) => String(item) !== String(productId)); await wishlist.save(); return getWishlist(userId); }
