import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'fresh-fruit-test-secret';
process.env.SEED_PASSWORD_SALT = 'fresh-fruit-test-salt';

import User from '../src/modules/users/user.model.js';
import Category from '../src/modules/categories/category.model.js';
import Product from '../src/modules/products/product.model.js';
import Order from '../src/modules/orders/order.model.js';
import Payment from '../src/modules/payments/payment.model.js';
import Inventory from '../src/modules/inventory/inventory.model.js';
import Voucher from '../src/modules/vouchers/voucher.model.js';
import Review from '../src/modules/reviews/review.model.js';
import Address from '../src/modules/addresses/address.model.js';
import Cart from '../src/modules/carts/cart.model.js';
import AuthSession from '../src/modules/auth/auth.model.js';
import { createOrder, cancelOrder } from '../src/modules/orders/order.service.js';
import { createReview } from '../src/modules/reviews/review.service.js';
import { addItem, getCart, updateItem, removeItem } from '../src/modules/carts/cart.service.js';
import { listAddresses, createAddress, updateAddress, deleteAddress } from '../src/modules/addresses/address.service.js';
import { updateOrder, updateUser } from '../src/modules/admin/admin.service.js';
import { createPayment } from '../src/modules/payments/payment.service.js';
import { updateProfile } from '../src/modules/users/user.service.js';

// Dùng database riêng để tránh xung đột khi node --test chạy song song nhiều file test.
const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresh-fruit-test';
const MONGODB_URI = baseUri.replace(/\/[^/?]+(\?|$)/, '/fresh-fruit-test-flow$1');

const validAddress = {
  recipientName: 'Nguyễn Văn A',
  phone: '0901234567',
  province: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Bến Nghé',
  streetAddress: '1 Nguyễn Huệ'
};

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
    Order.deleteMany({}), Payment.deleteMany({}), Inventory.deleteMany({}),
    Voucher.deleteMany({}), Review.deleteMany({}), Address.deleteMany({}),
    Cart.deleteMany({}), AuthSession.deleteMany({})
  ]);
});

async function setupCatalog(stock = 20, price = 40000) {
  const category = await Category.create({ name: 'Trái cây', slug: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` });
  const product = await Product.create({
    name: 'Táo Envy', slug: `tao-envy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: category._id, price, unit: 'kg', origin: 'Lâm Đồng', stock, soldCount: 0, isActive: true
  });
  await Inventory.create({ product: product._id, quantity: stock, lowStockAt: 5 });
  return { category, product };
}

async function createUser(role = 'customer') {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return User.create({
    fullName: `User ${unique}`, email: `${role}-${unique}@example.com`,
    password: 'scrypt:v1:0123456789abcdef0123456789abcdef:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    role, status: 'active'
  });
}

async function makeOrder(user, product, quantity = 1, extra = {}) {
  return createOrder({
    user: user._id,
    items: [{ product: product._id, quantity }],
    shippingAddress: validAddress,
    paymentMethod: 'cod',
    ...extra
  });
}

// Voucher: percent discount, min order, usage limit, expiry
test('voucher percent discount is capped by maxDiscount and minOrderValue is enforced', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20, 100000); // subtotal 200k for qty 2
  await Voucher.create({
    code: 'SALE50', discountType: 'percent', discountValue: 50, maxDiscount: 30000,
    minOrderValue: 150000, startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000), isActive: true
  });

  const order = await makeOrder(user, product, 2, { voucherCode: 'sale50' });
  // 50% of 200k = 100k, capped at 30k; total = 200k - 30k + 30k ship = 200k
  assert.equal(order.discountAmount, 30000);
  assert.equal(order.totalAmount, 200000);
});

test('voucher below minOrderValue or expired is rejected and stock untouched', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20, 10000);
  await Voucher.create({
    code: 'BIGONLY', discountType: 'fixed', discountValue: 5000, minOrderValue: 500000,
    startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000), isActive: true
  });
  await Voucher.create({
    code: 'OLDCODE', discountType: 'fixed', discountValue: 5000,
    startDate: new Date(Date.now() - 10 * 86400000), endDate: new Date(Date.now() - 86400000), isActive: true
  });

  for (const code of ['BIGONLY', 'OLDCODE', 'NOPE']) {
    await assert.rejects(
      () => makeOrder(user, product, 1, { voucherCode: code }),
      (error) => error.status === 400
    );
  }
  const fresh = await Product.findById(product._id);
  assert.equal(fresh.stock, 20);
  assert.equal(await Order.countDocuments(), 0);
});

test('voucher usageLimit is enforced atomically', async () => {
  const userA = await createUser();
  const userB = await createUser();
  const { product } = await setupCatalog(20, 100000);
  await Voucher.create({
    code: 'ONCE', discountType: 'fixed', discountValue: 10000,
    startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
    usageLimit: 1, usedCount: 0, isActive: true
  });

  await makeOrder(userA, product, 1, { voucherCode: 'ONCE' });
  await assert.rejects(
    () => makeOrder(userB, product, 1, { voucherCode: 'ONCE' }),
    (error) => error.status === 400
  );
  const voucher = await Voucher.findOne({ code: 'ONCE' });
  assert.equal(voucher.usedCount, 1);
});

test('cancelling an order with voucher restores the voucher usage', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20, 100000);
  const voucher = await Voucher.create({
    code: 'BACK', discountType: 'fixed', discountValue: 10000,
    startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000), isActive: true
  });

  const order = await makeOrder(user, product, 1, { voucherCode: 'BACK' });
  assert.equal((await Voucher.findById(voucher._id)).usedCount, 1);

  await cancelOrder({ userId: user._id, orderId: order._id });
  assert.equal((await Voucher.findById(voucher._id)).usedCount, 0);
});

// Review eligibility
test('review requires a delivered order containing the product', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20);
  const order = await makeOrder(user, product, 1);

  // Order is pending -> reject
  await assert.rejects(
    () => createReview({ user: user._id, product: product._id, rating: 5, comment: 'Ngon' }),
    (error) => error.status === 403
  );

  // Mark delivered via admin transition chain
  await Order.updateOne({ _id: order._id }, { $set: { status: 'delivered' } });

  const review = await createReview({ user: user._id, product: product._id, rating: 5, comment: 'Rất ngon' });
  assert.equal(review.isApproved, false);
  assert.equal(review.order.toString(), order._id.toString());

  // Duplicate review rejected
  await assert.rejects(
    () => createReview({ user: user._id, product: product._id, rating: 4 }),
    (error) => error.status === 409
  );
});

// Address ownership
test('address update/delete are scoped to the owner and cannot reassign user', async () => {
  const owner = await createUser();
  const other = await createUser();
  const address = await createAddress({ ...validAddress, user: owner._id, isDefault: true });

  // Other user cannot see or mutate it
  assert.equal(await updateAddress(other._id, address._id, { streetAddress: 'Hack' }), null);
  assert.equal(await deleteAddress(other._id, address._id), null);

  // Owner update works; injected `user` field is ignored
  const updated = await updateAddress(owner._id, address._id, { streetAddress: '2 Lê Lợi', user: other._id });
  assert.equal(updated.streetAddress, '2 Lê Lợi');
  assert.equal(String(updated.user), String(owner._id));

  const list = await listAddresses(owner._id);
  assert.equal(list.length, 1);
});

// Cart
test('cart add/update/remove respects stock and ownership', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(3);

  await addItem(user._id, product._id, 2);
  let cart = await getCart(user._id);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 2);

  // Exceed stock
  await assert.rejects(() => addItem(user._id, product._id, 2), (error) => error.status === 400);

  await updateItem(user._id, product._id, 3);
  cart = await getCart(user._id);
  assert.equal(cart.items[0].quantity, 3);

  await removeItem(user._id, product._id);
  cart = await getCart(user._id);
  assert.equal(cart.items.length, 0);

  // Another user's cart is untouched
  const other = await createUser();
  const otherCart = await getCart(other._id);
  assert.equal(otherCart.items.length, 0);
});

// Order status transitions via admin
test('admin order transitions follow allowedTransitions and reject invalid jumps', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20);
  const order = await makeOrder(user, product, 1);

  // pending -> shipping is invalid
  await assert.rejects(() => updateOrder(order._id, 'shipping'), (error) => error.status === 400);

  let updated = await updateOrder(order._id, 'confirmed');
  assert.equal(updated.status, 'confirmed');

  updated = await updateOrder(order._id, 'shipping');
  assert.equal(updated.status, 'shipping');

  updated = await updateOrder(order._id, 'delivered');
  assert.equal(updated.status, 'delivered');
  assert.equal(updated.paymentStatus, 'paid'); // COD delivered -> paid

  // delivered is terminal
  await assert.rejects(() => updateOrder(order._id, 'cancelled'), (error) => error.status === 400);
});

// Role escalation guard
test('customer profile update cannot change role or status', async () => {
  const user = await createUser('customer');
  const result = await updateProfile(user._id, { fullName: 'Tên Mới', role: 'admin', status: 'blocked' });
  assert.equal(result.role, 'customer');
  assert.equal(result.status, 'active');
  const fresh = await User.findById(user._id);
  assert.equal(fresh.role, 'customer');
  assert.equal(fresh.status, 'active');
});

test('admin cannot change own role or status via updateUser', async () => {
  const admin = await createUser('admin');
  await assert.rejects(
    () => updateUser(admin._id, { role: 'customer' }, admin._id),
    (error) => error.status === 400
  );
  await assert.rejects(
    () => updateUser(admin._id, { status: 'blocked' }, admin._id),
    (error) => error.status === 400
  );
  // Admin vẫn sửa được profile người khác
  const other = await createUser('customer');
  const updated = await updateUser(other._id, { status: 'blocked' }, admin._id);
  assert.equal(updated.status, 'blocked');
});

// Payment retry: failed có thể thử lại, pending idempotent, paid không thể trả lại
test('payment failed can be retried and pending same-method is idempotent', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20);
  const order = await makeOrder(user, product, 1, { paymentMethod: 'mock' });

  // Giả lập payment failed tồn tại -> retry phải ghi đè thành paid
  await Payment.create({ order: order._id, method: 'mock', status: 'failed', amount: order.totalAmount });
  const retried = await createPayment({ userId: user._id, orderId: order._id, method: 'mock' });
  assert.equal(retried.status, 'paid');
  assert.equal(await Payment.countDocuments({ order: order._id }), 1);
  const freshOrder = await Order.findById(order._id);
  assert.equal(freshOrder.paymentStatus, 'paid');
  assert.equal(freshOrder.status, 'confirmed'); // mock auto-confirm từ pending

  // Paid -> gọi lại phải bị chặn
  await assert.rejects(
    () => createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    (error) => error.status === 400
  );
});

test('payment pending same method returns existing (idempotent), different method rejected', async () => {
  const user = await createUser();
  const { product } = await setupCatalog(20);
  const order = await makeOrder(user, product, 1, { paymentMethod: 'cod' });

  const first = await createPayment({ userId: user._id, orderId: order._id, method: 'cod' });
  assert.equal(first.status, 'pending');
  const second = await createPayment({ userId: user._id, orderId: order._id, method: 'cod' });
  assert.equal(String(second._id), String(first._id)); // cùng document, không tạo mới
  assert.equal(await Payment.countDocuments({ order: order._id }), 1);

  await assert.rejects(
    () => createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    (error) => error.status === 400 // method không khớp order.paymentMethod
  );
});
