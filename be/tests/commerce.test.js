import test from 'node:test';
import assert from 'node:assert/strict';
import { orderValidator } from '../src/modules/orders/order.validator.js';
import { listProducts } from '../src/modules/products/product.service.js';
import Order from '../src/modules/orders/order.model.js';
import Payment from '../src/modules/payments/payment.model.js';
import Review from '../src/modules/reviews/review.model.js';

const validOrder = {
  items: [{ product: '507f1f77bcf86cd799439011', quantity: 1 }],
  shippingAddress: { recipientName: 'Nguyễn Văn A', phone: '0901234567', province: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Bến Nghé', streetAddress: '1 Nguyễn Huệ' },
  paymentMethod: 'cod',
  idempotencyKey: 'web-test-order-1'
};

function runValidator(body) {
  let nextCalled = false;
  const response = { status: () => response, json: (payload) => payload };
  const result = orderValidator({ body }, response, () => { nextCalled = true; });
  return { nextCalled, result };
}

test('order validator accepts an idempotent order payload', () => {
  assert.equal(runValidator(validOrder).nextCalled, true);
});

test('order validator rejects duplicate products and short idempotency keys', () => {
  const duplicate = { ...validOrder, items: [...validOrder.items, ...validOrder.items] };
  assert.equal(runValidator(duplicate).result.success, false);
  assert.equal(runValidator({ ...validOrder, idempotencyKey: 'short' }).result.success, false);
});

test('product listing rejects an inverted price range before querying MongoDB', async () => {
  await assert.rejects(() => listProducts({ minPrice: '100', maxPrice: '10' }), { status: 400 });
});

test('order, payment and review schemas enforce the business invariants', () => {
  assert.equal(Order.schema.path('idempotencyKey').options.maxlength, 120);
  assert.equal(Payment.schema.path('order').options.unique, true);
  assert.equal(Review.schema.path('isApproved').defaultValue, false);
});
