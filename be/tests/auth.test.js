import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'fresh-fruit-test-secret';
process.env.SEED_PASSWORD_SALT = 'fresh-fruit-test-salt';

import app from '../src/app.js';
import AuthSession from '../src/modules/auth/auth.model.js';
import { registerValidator } from '../src/modules/auth/auth.validator.js';
import { requireAdmin, requireAuth } from '../src/middlewares/authMiddleware.js';
import User from '../src/modules/users/user.model.js';
import { toPublicUser } from '../src/modules/users/user.service.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';
import { signToken, verifyToken } from '../src/utils/token.js';

test('password hashes round-trip and reject wrong values', async () => {
  const hash = await hashPassword('Secret123');
  assert.match(hash, /^scrypt:v1:[a-f0-9]{32}:[a-f0-9]{128}$/);
  assert.equal(await verifyPassword('Secret123', hash), true);
  assert.equal(await verifyPassword('secret123', hash), false);
  assert.equal(await verifyPassword('Secret123', 'plain-text'), false);
});

test('JWT signs, verifies and rejects tampered or expired tokens', () => {
  const token = signToken({ sub: 'user-1', type: 'access' }, 60);
  const payload = verifyToken(token);
  assert.equal(payload.sub, 'user-1');
  assert.equal(payload.type, 'access');

  const lastCharacter = token.at(-1);
  const tampered = `${token.slice(0, -1)}${lastCharacter === 'A' ? 'B' : 'A'}`;
  assert.throws(() => verifyToken(tampered), /Invalid authentication token/);

  const expired = signToken({ sub: 'user-1', type: 'access' }, -1);
  assert.throws(() => verifyToken(expired), /expired/);
});

test('register validator rejects invalid input', () => {
  assert.throws(
    () => registerValidator({ body: { fullName: 'A', email: 'not-an-email', password: 'short' } }, {}, () => {}),
    (error) => error.status === 400
  );
  assert.throws(
    () => registerValidator({ body: { fullName: 'Valid Name', email: 'user@example.com', password: 'weakpass' } }, {}, () => {}),
    (error) => error.status === 400 && /letter and one number/.test(error.message)
  );
});

test('register validator accepts a valid payload', () => {
  let called = false;
  registerValidator(
    { body: { fullName: 'Valid Name', email: 'user@example.com', password: 'Secret123', phone: '0901234567' } },
    {},
    () => {
      called = true;
    }
  );
  assert.equal(called, true);
});

test('public user shape never exposes credentials', () => {
  const user = toPublicUser({
    _id: new mongoose.Types.ObjectId(),
    fullName: 'Demo Customer',
    email: 'customer@example.com',
    password: 'scrypt:secret',
    passwordResetTokenHash: 'hash',
    role: 'customer',
    status: 'active'
  });
  assert.equal(user.fullName, 'Demo Customer');
  assert.equal(user.role, 'customer');
  assert.equal('password' in user, false);
  assert.equal('passwordResetTokenHash' in user, false);
});

test('requireAuth accepts a valid access token backed by an active session', async () => {
  const userId = new mongoose.Types.ObjectId();
  const sessionId = new mongoose.Types.ObjectId();
  const token = signToken({ sub: String(userId), sid: String(sessionId), role: 'customer', type: 'access' }, 60);
  const originalFindById = User.findById;
  const originalFindOne = AuthSession.findOne;

  User.findById = async () => ({ _id: userId, role: 'customer', status: 'active' });
  AuthSession.findOne = () => ({ select: async () => ({ _id: sessionId }) });

  try {
    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextError;
    await requireAuth(req, {}, (error) => {
      nextError = error;
    });
    assert.equal(nextError, undefined);
    assert.equal(req.user.role, 'customer');
    assert.equal(req.auth.sessionId, String(sessionId));
  } finally {
    User.findById = originalFindById;
    AuthSession.findOne = originalFindOne;
  }
});

test('requireAuth rejects a missing token before touching the database', async () => {
  let nextError;
  await requireAuth({ headers: {} }, {}, (error) => {
    nextError = error;
  });
  assert.equal(nextError.status, 401);
});

test('requireAdmin allows admins and blocks customers', () => {
  let allowed = false;
  requireAdmin({ user: { role: 'admin' } }, {}, (error) => {
    if (error) throw error;
    allowed = true;
  });
  assert.equal(allowed, true);

  let blocked;
  requireAdmin({ user: { role: 'customer' } }, {}, (error) => {
    blocked = error;
  });
  assert.equal(blocked.status, 403);
});

test('auth routes validate input and protect the current-user endpoint', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const invalidLogin = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    assert.equal(invalidLogin.status, 400);

    const unauthorized = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
    assert.equal(unauthorized.status, 401);
    const body = await unauthorized.json();
    assert.equal(body.success, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
