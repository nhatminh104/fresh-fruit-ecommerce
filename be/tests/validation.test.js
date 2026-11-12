import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'fresh-fruit-test-secret';

import { addressValidator } from '../src/modules/addresses/address.validator.js';
import { rateLimit } from '../src/middlewares/rateLimit.js';

const validAddress = {
  recipientName: 'Nguyễn Văn A',
  phone: '0901234567',
  province: 'Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Bến Nghé',
  streetAddress: '1 Nguyễn Huệ'
};

function runValidator(method, body) {
  let nextCalled = false;
  let caught;
  try {
    addressValidator({ method, body }, {}, () => { nextCalled = true; });
  } catch (error) {
    caught = error;
  }
  return { nextCalled, status: caught?.status, message: caught?.message };
}

test('address validator requires every field on create', () => {
  const { nextCalled, status } = runValidator('POST', { ...validAddress, ward: '' });
  assert.equal(nextCalled, false);
  assert.equal(status, 400);
  assert.equal(runValidator('POST', validAddress).nextCalled, true);
});

test('address validator accepts partial updates on PATCH', () => {
  assert.equal(runValidator('PATCH', { streetAddress: '2 Lê Lợi' }).nextCalled, true);
  assert.equal(runValidator('PATCH', { isDefault: true }).nextCalled, true);
  const invalid = runValidator('PATCH', { phone: 'abc' });
  assert.equal(invalid.nextCalled, false);
  assert.equal(invalid.status, 400);
  const empty = runValidator('PATCH', {});
  assert.equal(empty.nextCalled, false);
  assert.equal(empty.status, 400);
});

test('rate limiter blocks requests over the limit and resets after the window', async () => {
  const limiter = rateLimit({ windowMs: 50, max: 2 });
  const responses = [];
  const res = () => ({
    status(code) { this.code = code; return this; },
    json(payload) { this.payload = payload; responses.push(this); return this; },
    set() { return this; }
  });
  const req = { ip: '127.0.0.9' };
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  limiter(req, res(), next);
  limiter(req, res(), next);
  limiter(req, res(), next);
  assert.equal(nextCalls, 2);
  assert.equal(responses.at(-1).code, 429);
  assert.equal(responses.at(-1).payload.success, false);

  await new Promise((resolve) => setTimeout(resolve, 60));
  limiter(req, res(), next);
  assert.equal(nextCalls, 3);
});
