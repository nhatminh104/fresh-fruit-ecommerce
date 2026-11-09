import mongoose from 'mongoose';
import Cart from './cart.model.js';
import Product from '../products/product.model.js';

const cartQuery = (userId) => Cart.findOne({ user: userId }).populate({ path: 'items.product', select: 'name price unit images stock isActive' }).lean();

export async function getCart(userId) {
  const cart = await cartQuery(userId);
  return cart || { user: userId, items: [] };
}

function validateProductId(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    const error = new Error('Sản phẩm không hợp lệ');
    error.status = 400;
    throw error;
  }
}

async function getAvailableProduct(productId) {
  validateProductId(productId);
  const product = await Product.findOne({ _id: productId, isActive: true }).lean();
  if (!product) {
    const error = new Error('Sản phẩm không còn kinh doanh');
    error.status = 404;
    throw error;
  }
  return product;
}

function validateQuantity(quantity) {
  const value = Number(quantity);
  if (!Number.isInteger(value) || value < 1) {
    const error = new Error('Số lượng phải là số nguyên dương');
    error.status = 400;
    throw error;
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
    const error = new Error(`Chỉ còn ${product.stock} sản phẩm`);
    error.status = 400;
    throw error;
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
    const error = new Error(`Chỉ còn ${product.stock} sản phẩm`);
    error.status = 400;
    throw error;
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return getCart(userId);
  const item = cart.items.find((entry) => String(entry.product) === String(product._id));
  if (!item) {
    const error = new Error('Sản phẩm không có trong giỏ hàng');
    error.status = 404;
    throw error;
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
