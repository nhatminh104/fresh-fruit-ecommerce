import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'fresh-fruit-test-secret';
process.env.SEED_PASSWORD_SALT = 'fresh-fruit-test-salt';

import app from '../src/app.js';
import User from '../src/modules/users/user.model.js';
import Category from '../src/modules/categories/category.model.js';
import Product from '../src/modules/products/product.model.js';
import Order from '../src/modules/orders/order.model.js';
import Payment from '../src/modules/payments/payment.model.js';
import Inventory from '../src/modules/inventory/inventory.model.js';
import Voucher from '../src/modules/vouchers/voucher.model.js';
import AuthSession from '../src/modules/auth/auth.model.js';
import { createOrder, cancelOrder, findOrder } from '../src/modules/orders/order.service.js';
import { createPayment } from '../src/modules/payments/payment.service.js';
import { signToken } from '../src/utils/token.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fresh-fruit-test';

const validAddress = {
  recipientName: 'Nguyễn Văn A',
  phone: '0901234567',
  province: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Bến Nghé',
  streetAddress: '1 Nguyễn Huệ'
};

let server;
let serverPort;

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
  await Order.syncIndexes();
  await Product.syncIndexes();
  await Payment.syncIndexes();
  await Inventory.syncIndexes();

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  serverPort = server.address().port;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Inventory.deleteMany({}),
    Voucher.deleteMany({}),
    AuthSession.deleteMany({})
  ]);
});

async function setupTestCatalog(stock = 10, price = 50000) {
  const category = await Category.create({
    name: 'Trái cây nhiệt đới',
    slug: `trai-cay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: 'Các loại trái cây tươi ngon'
  });
  const product = await Product.create({
    name: 'Xoài Cát Hòa Lộc',
    slug: `xoai-cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: category._id,
    price,
    unit: 'kg',
    origin: 'Tiền Giang',
    stock,
    soldCount: 0,
    isActive: true
  });
  await Inventory.create({
    product: product._id,
    quantity: stock,
    lowStockAt: 5
  });
  return { category, product };
}

async function createTestUser(role = 'customer') {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return User.create({
    fullName: `Test ${role} ${unique}`,
    email: `${role}-${unique}@example.com`,
    password: 'scrypt:v1:0123456789abcdef0123456789abcdef:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    role,
    status: 'active'
  });
}

// 1. Tạo đơn hàng thành công
test('1. Tạo đơn hàng thành công: trừ tồn kho, cập nhật inventory, tạo order đúng dữ liệu và hỗ trợ không có idempotencyKey', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 2 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });

  assert.ok(order._id);
  assert.equal(order.status, 'pending');
  assert.equal(order.paymentStatus, 'pending');
  assert.equal(order.totalAmount, 2 * product.price + 30000); // shipping fee 30000

  const updatedProduct = await Product.findById(product._id);
  assert.equal(updatedProduct.stock, 8);
  assert.equal(updatedProduct.soldCount, 2);

  const inventory = await Inventory.findOne({ product: product._id });
  assert.equal(inventory.quantity, 8);

  // Không có idempotencyKey thì tạo đơn tiếp theo của cùng user không bị lỗi duplicate key 11000
  const secondOrder = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });
  assert.ok(secondOrder._id);
  assert.notEqual(order._id.toString(), secondOrder._id.toString());
});

// 2. Tạo đơn vượt tồn kho
test('2. Tạo đơn vượt tồn kho: từ chối với lỗi phù hợp và không thay đổi tồn kho', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(3);

  await assert.rejects(
    () => createOrder({
      user: user._id,
      items: [{ product: product._id, quantity: 5 }],
      shippingAddress: validAddress,
      paymentMethod: 'cod'
    }),
    (error) => {
      assert.ok(error.status === 400 || error.status === 409);
      assert.match(error.message, /không đủ tồn kho/);
      return true;
    }
  );

  const unchangedProduct = await Product.findById(product._id);
  assert.equal(unchangedProduct.stock, 3);
  assert.equal(unchangedProduct.soldCount, 0);

  const ordersCount = await Order.countDocuments();
  assert.equal(ordersCount, 0);
});

// 3. Hai người mua sản phẩm cuối cùng
test('3. Hai người mua sản phẩm cuối cùng: chỉ 1 người thành công, tồn kho không bao giờ âm', async () => {
  const userA = await createTestUser();
  const userB = await createTestUser();
  const { product } = await setupTestCatalog(1);

  const results = await Promise.allSettled([
    createOrder({
      user: userA._id,
      items: [{ product: product._id, quantity: 1 }],
      shippingAddress: validAddress,
      paymentMethod: 'cod'
    }),
    createOrder({
      user: userB._id,
      items: [{ product: product._id, quantity: 1 }],
      shippingAddress: validAddress,
      paymentMethod: 'cod'
    })
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.ok(rejected[0].reason.status === 400 || rejected[0].reason.status === 409);

  const finalProduct = await Product.findById(product._id);
  assert.equal(finalProduct.stock, 0);
  assert.equal(finalProduct.soldCount, 1);
});

// 4. Gửi lại request tạo đơn với cùng idempotency key
test('4. Gửi lại request tạo đơn với cùng idempotency key: trả về đơn đã tạo, không trừ kho lần hai', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);
  const idempotencyKey = 'idem-key-test-case-4';

  const orderFirst = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 3 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod',
    idempotencyKey
  });

  const productAfterFirst = await Product.findById(product._id);
  assert.equal(productAfterFirst.stock, 7);

  // Gửi lại cùng key
  const orderSecond = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 3 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod',
    idempotencyKey
  });

  assert.equal(orderFirst._id.toString(), orderSecond._id.toString());
  assert.equal(orderFirst.orderCode, orderSecond.orderCode);

  const productAfterSecond = await Product.findById(product._id);
  assert.equal(productAfterSecond.stock, 7); // Không bị trừ kho lần 2!

  const totalOrders = await Order.countDocuments({ user: user._id, idempotencyKey });
  assert.equal(totalOrders, 1);
});

// 4b. Hai request tạo đơn đồng thời với cùng idempotency key
test('4b. Hai request tạo đơn đồng thời với cùng idempotency key: xử lý an toàn, cùng trả về 1 đơn hàng, chỉ trừ kho 1 lần', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);
  const idempotencyKey = 'idem-concurrent-race-key';

  const results = await Promise.allSettled([
    createOrder({
      user: user._id,
      items: [{ product: product._id, quantity: 2 }],
      shippingAddress: validAddress,
      paymentMethod: 'cod',
      idempotencyKey
    }),
    createOrder({
      user: user._id,
      items: [{ product: product._id, quantity: 2 }],
      shippingAddress: validAddress,
      paymentMethod: 'cod',
      idempotencyKey
    })
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  assert.equal(fulfilled.length, 2, 'Cả 2 request đồng thời đều phải trả về kết quả thành công');

  const order1 = fulfilled[0].value;
  const order2 = fulfilled[1].value;
  assert.equal(order1._id.toString(), order2._id.toString());
  assert.equal(order1.orderCode, order2.orderCode);

  const productAfterRace = await Product.findById(product._id);
  assert.equal(productAfterRace.stock, 8, 'Kho chỉ được trừ chính xác 1 lần (10 - 2 = 8)');

  const orderCount = await Order.countDocuments({ user: user._id, idempotencyKey });
  assert.equal(orderCount, 1, 'Chỉ có đúng 1 bản ghi đơn hàng được tạo');
});

// 5. Hủy đơn thành công
test('5. Hủy đơn thành công: hoàn lại tồn kho chính xác, cập nhật trạng thái đơn và thanh toán', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 4 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });

  const productBeforeCancel = await Product.findById(product._id);
  assert.equal(productBeforeCancel.stock, 6);

  const cancelled = await cancelOrder({ userId: user._id, orderId: order._id });
  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.cancelledAt);
  assert.ok(cancelled.stockRestoredAt);
  assert.equal(cancelled.paymentStatus, 'failed');

  const productAfterCancel = await Product.findById(product._id);
  assert.equal(productAfterCancel.stock, 10);
  assert.equal(productAfterCancel.soldCount, 0);

  const inventory = await Inventory.findOne({ product: product._id });
  assert.equal(inventory.quantity, 10);
});

// 6. Hủy đơn hai lần
test('6. Hủy đơn hai lần: từ chối lần thứ hai, không hoàn kho hai lần', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 2 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });

  await cancelOrder({ userId: user._id, orderId: order._id });
  const stockAfterFirstCancel = await Product.findById(product._id);
  assert.equal(stockAfterFirstCancel.stock, 10);

  // Lần hủy thứ 2 phải bị từ chối
  await assert.rejects(
    () => cancelOrder({ userId: user._id, orderId: order._id }),
    (error) => {
      assert.ok(error.status === 400 || error.status === 409);
      assert.match(error.message, /đã được hủy|không thể hủy/);
      return true;
    }
  );

  const stockAfterSecondCancel = await Product.findById(product._id);
  assert.equal(stockAfterSecondCancel.stock, 10); // Không hoàn kho lần 2!
});

// 7. Hai request hủy đơn đồng thời
test('7. Hai request hủy đơn đồng thời: chỉ hoàn kho chính xác một lần', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 3 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });

  const stockBeforeCancel = await Product.findById(product._id);
  assert.equal(stockBeforeCancel.stock, 7);

  const results = await Promise.allSettled([
    cancelOrder({ userId: user._id, orderId: order._id }),
    cancelOrder({ userId: user._id, orderId: order._id })
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);

  const finalProduct = await Product.findById(product._id);
  assert.equal(finalProduct.stock, 10); // Hoàn kho đúng 1 lần (7 + 3 = 10, không phải 13)
});

// 8. Thanh toán sai phương thức
test('8. Thanh toán sai phương thức: từ chối khi phương thức không khớp với đơn hàng', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'cod'
  });

  await assert.rejects(
    () => createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    (error) => {
      assert.equal(error.status, 400);
      assert.match(error.message, /không khớp/);
      return true;
    }
  );

  const paymentCount = await Payment.countDocuments({ order: order._id });
  assert.equal(paymentCount, 0);
});

// 9. Thanh toán đơn đã hủy
test('9. Thanh toán đơn đã hủy: từ chối thanh toán', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'mock'
  });

  await cancelOrder({ userId: user._id, orderId: order._id });

  await assert.rejects(
    () => createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    (error) => {
      assert.ok(error.status === 400 || error.status === 409);
      assert.match(error.message, /đã bị hủy/);
      return true;
    }
  );

  const paymentCount = await Payment.countDocuments({ order: order._id });
  assert.equal(paymentCount, 0);
});

// 10. Thanh toán đơn đã thanh toán
test('10. Thanh toán đơn đã thanh toán: không cho phép thanh toán lại', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'mock'
  });

  // Thanh toán lần 1 thành công
  const payment1 = await createPayment({ userId: user._id, orderId: order._id, method: 'mock' });
  assert.equal(payment1.status, 'paid');

  const orderAfterPay = await Order.findById(order._id);
  assert.equal(orderAfterPay.paymentStatus, 'paid');
  assert.equal(orderAfterPay.status, 'confirmed');

  // Thanh toán lần 2 phải bị từ chối
  await assert.rejects(
    () => createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    (error) => {
      assert.ok(error.status === 400 || error.status === 409);
      assert.match(error.message, /đã được thanh toán/);
      return true;
    }
  );
});

// 11. Hai request thanh toán đồng thời
test('11. Hai request thanh toán đồng thời: chỉ 1 giao dịch thành công, không tạo trùng', async () => {
  const user = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const order = await createOrder({
    user: user._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'mock'
  });

  const results = await Promise.allSettled([
    createPayment({ userId: user._id, orderId: order._id, method: 'mock' }),
    createPayment({ userId: user._id, orderId: order._id, method: 'mock' })
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);

  const paymentCount = await Payment.countDocuments({ order: order._id });
  assert.equal(paymentCount, 1);

  const finalOrder = await Order.findById(order._id);
  assert.equal(finalOrder.paymentStatus, 'paid');
  assert.equal(finalOrder.status, 'confirmed');
});

// 12. User truy cập đơn hàng của người khác
test('12. User truy cập đơn hàng của người khác: từ chối với 403 Forbidden', async () => {
  const userA = await createTestUser();
  const userB = await createTestUser();
  const { product } = await setupTestCatalog(10);

  const orderA = await createOrder({
    user: userA._id,
    items: [{ product: product._id, quantity: 1 }],
    shippingAddress: validAddress,
    paymentMethod: 'mock'
  });

  // User B xem đơn của User A
  await assert.rejects(
    () => findOrder(userB._id, orderA._id),
    (error) => {
      assert.equal(error.status, 403);
      return true;
    }
  );

  // User B hủy đơn của User A
  await assert.rejects(
    () => cancelOrder({ userId: userB._id, orderId: orderA._id }),
    (error) => {
      assert.equal(error.status, 403);
      return true;
    }
  );

  // User B thanh toán đơn của User A
  await assert.rejects(
    () => createPayment({ userId: userB._id, orderId: orderA._id, method: 'mock' }),
    (error) => {
      assert.equal(error.status, 403);
      return true;
    }
  );
});

// 13. User thông thường truy cập API quản trị tồn kho
test('13. User thông thường truy cập API quản trị tồn kho: chặn với 401 hoặc 403', async () => {
  const customer = await createTestUser('customer');
  const admin = await createTestUser('admin');

  const customerSession = await AuthSession.create({
    user: customer._id,
    refreshTokenHash: 'dummy-hash',
    expiresAt: new Date(Date.now() + 86400000)
  });
  const adminSession = await AuthSession.create({
    user: admin._id,
    refreshTokenHash: 'dummy-hash',
    expiresAt: new Date(Date.now() + 86400000)
  });

  const customerToken = signToken({ sub: String(customer._id), sid: String(customerSession._id), role: 'customer', type: 'access' }, 3600);
  const adminToken = signToken({ sub: String(admin._id), sid: String(adminSession._id), role: 'admin', type: 'access' }, 3600);

  // Không có token -> 401
  const resNoAuth = await fetch(`http://127.0.0.1:${serverPort}/api/inventory`);
  assert.equal(resNoAuth.status, 401);

  // Customer token -> 403 Forbidden
  const resCustomer = await fetch(`http://127.0.0.1:${serverPort}/api/inventory`, {
    headers: { authorization: `Bearer ${customerToken}` }
  });
  assert.equal(resCustomer.status, 403);

  // Customer token truy cập /api/admin/inventory -> 403 Forbidden
  const resCustomerAdmin = await fetch(`http://127.0.0.1:${serverPort}/api/admin/inventory`, {
    headers: { authorization: `Bearer ${customerToken}` }
  });
  assert.equal(resCustomerAdmin.status, 403);

  // Admin token -> 200 OK
  const resAdmin = await fetch(`http://127.0.0.1:${serverPort}/api/inventory`, {
    headers: { authorization: `Bearer ${adminToken}` }
  });
  assert.equal(resAdmin.status, 200);
  const adminBody = await resAdmin.json();
  assert.equal(adminBody.success, true);
});

// 14. Kiểm tra cơ chế Fallback an toàn (không cần MongoDB replica set)
test('14. Cơ chế fallback an toàn: rollback kho và voucher khi gặp lỗi giữa chừng', async () => {
  const user = await createTestUser();
  const { product: prod1 } = await setupTestCatalog(5);
  const { product: prod2 } = await setupTestCatalog(1);

  const voucher = await Voucher.create({
    code: 'TESTFALLBACK',
    discountType: 'fixed',
    discountValue: 10000,
    minOrderValue: 20000,
    startDate: new Date(Date.now() - 86400000),
    endDate: new Date(Date.now() + 86400000),
    usageLimit: 1,
    usedCount: 0,
    isActive: true
  });

  // prod1 đủ stock (5 >= 2), nhưng prod2 không đủ stock (1 < 3)
  // Quá trình reserveStock cho prod1 thành công nhưng prod2 thất bại
  // Phải rollback lại prod1 và không trừ voucher!
  await assert.rejects(
    () => createOrder({
      user: user._id,
      items: [
        { product: prod1._id, quantity: 2 },
        { product: prod2._id, quantity: 3 }
      ],
      shippingAddress: validAddress,
      voucherCode: 'TESTFALLBACK',
      paymentMethod: 'cod'
    }, { fallback: true }),
    (error) => {
      assert.ok(error.status === 400 || error.status === 409);
      return true;
    }
  );

  const checkProd1 = await Product.findById(prod1._id);
  assert.equal(checkProd1.stock, 5); // Hoàn lại đúng 5!
  assert.equal(checkProd1.soldCount, 0);

  const checkVoucher = await Voucher.findById(voucher._id);
  assert.equal(checkVoucher.usedCount, 0); // Voucher không bị trừ lượt dùng!
});
