import crypto from 'node:crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PREFIX = 'scrypt:v1:';
const LEGACY_PREFIX = 'scrypt:';

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(password), salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = await derive(password, salt);
  return `${PREFIX}${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;

  let salt;
  let expectedHex;
  if (storedHash.startsWith(PREFIX)) {
    const [saltHex, keyHex] = storedHash.slice(PREFIX.length).split(':');
    if (!saltHex || !keyHex || saltHex.length !== SALT_LENGTH * 2) return false;
    if (!/^[a-f0-9]+$/i.test(saltHex)) return false;
    salt = Buffer.from(saltHex, 'hex');
    expectedHex = keyHex;
  } else if (storedHash.startsWith(LEGACY_PREFIX)) {
    salt = process.env.SEED_PASSWORD_SALT || 'fresh-fruit-demo-salt';
    expectedHex = storedHash.slice(LEGACY_PREFIX.length);
  } else {
    return false;
  }

  if (!/^[a-f0-9]+$/i.test(expectedHex) || expectedHex.length !== KEY_LENGTH * 2) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = await derive(password, salt);
  return crypto.timingSafeEqual(expected, actual);
}
