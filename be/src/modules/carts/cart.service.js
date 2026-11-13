import mongoose from 'mongoose';
import Cart from './cart.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/ApiError.js';

const cartQuery = (userId) => Cart.findOne({ user: userId }).populate({ path: 'items.product', select: 'name price unit images stock isActive' }).lean();

export async function getCart(userId) {
  const cart = await cartQuery(userId);
  return cart || { user: userId, items: [] };
}

function validateProductId(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, 'Sản phẩm không hợp lệ');
  }
}

async function getAvailableProduct(productId) {
  validateProductId(productId);
  const product = await Product.findOne({ _id: productId, isActive: true }).lean();
  if (!product) {
    throw new ApiError(404, 'Sản phẩm không còn kinh doanh');
  }
  return product;
}

function validateQuantity(quantity) {
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 1) {
    throw new ApiError(400, 'Số lượng phải là số nguyên dương');
  }
  return value;
}

export async function addItem(userId, productId, quantity = 1) {
  const product = await getAvailableProduct(productId);
  const amount = validateQuantity(quantity);
  const cart = await Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true, new: true });
  const existing = cart.items.find((item) => String(item.product) === String(product._id));
  const nextQuantity = (existing?.quantity || 0) + amount;
  if (nextQuantity > product.stock) {
    throw new ApiError(400, `Chỉ còn ${product.stock} sản phẩm`);
  }
  if (existing) existing.quantity = nextQuantity;
  else cart.items.push({ product: product._id, quantity: amount });
  await cart.save();
  return cartQuery(userId);
}

export async function updateItem(userId, productId, quantity) {
  const product = await getAvailableProduct(productId);
  const amount = validateQuantity(quantity);
  if (amount > product.stock) {
    throw new ApiError(400, `Chỉ còn ${product.stock} sản phẩm`);
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return getCart(userId);
  const item = cart.items.find((entry) => String(entry.product) === String(product._id));
  if (!item) {
    throw new ApiError(404, 'Sản phẩm không có trong giỏ hàng');
  }
  item.quantity = amount;
  await cart.save();
  return cartQuery(userId);
}

export async function removeItem(userId, productId) {
  validateProductId(productId);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return getCart(userId);
  cart.items = cart.items.filter((item) => String(item.product) !== String(productId));
  await cart.save();
  return cartQuery(userId);
}

export async function clearCart(userId) {
  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { upsert: true });
  return getCart(userId);
}
